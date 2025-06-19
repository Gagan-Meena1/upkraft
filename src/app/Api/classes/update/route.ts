// Import required modules
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

// Connect to database
connect();

// Enhanced retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 2000, // Increased to 2 seconds
  maxDelay: 15000, // Increased to 15 seconds
};

// MongoDB connection options with increased timeouts
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 300000, // 5 minutes for large uploads
  connectTimeoutMS: 30000, // 30 seconds
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 30000,
  heartbeatFrequencyMS: 10000, // Ping every 10 seconds
  bufferMaxEntries: 0, // Disable mongoose buffering
};

// Function to sleep/delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to calculate exponential backoff delay
function getRetryDelay(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
    RETRY_CONFIG.maxDelay
  );
  return delay + Math.random() * 2000; // Increased jitter
}

// Enhanced connection function with proper timeout settings
async function ensureConnection(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    // Test existing connection
    try {
      await mongoose.connection.db!.admin().ping();
      return;
    } catch (error) {
      console.log('Existing connection failed ping test, reconnecting...');
      await mongoose.disconnect();
    }
  }

  // Establish new connection with timeout options
  await mongoose.connect(process.env.MONGO_URL!, MONGO_OPTIONS);
  
  // Verify connection
  await mongoose.connection.db!.admin().ping();
  console.log('MongoDB connection established and verified');
}

// Function to get GridFS bucket with enhanced connection handling
async function getGridFSBucket(): Promise<GridFSBucket> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`GridFS connection attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}`);
      
      // Ensure robust connection
      await ensureConnection();
      
      if (!mongoose.connection.db) {
        throw new Error('Database connection not available');
      }
      
      // Create GridFS bucket with optimized settings for large files
      return new GridFSBucket(mongoose.connection.db, {
        bucketName: 'videos_bucket',
        chunkSizeBytes: 1024 * 1024, // 1MB chunks for better network handling
        writeConcern: { w: 'majority', j: true, wtimeout: 30000 }
      });
      
    } catch (error) {
      lastError = error as Error;
      console.error(`GridFS connection attempt ${attempt + 1} failed:`, error);
      
      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = getRetryDelay(attempt);
        console.log(`Retrying GridFS connection in ${delay}ms...`);
        await sleep(delay);
        
        // Force clean disconnect before retry
        try {
          await mongoose.disconnect();
        } catch (disconnectError) {
          console.warn('Error during disconnect:', disconnectError);
        }
      }
    }
  }
  
  throw new Error(`Failed to establish GridFS connection after ${RETRY_CONFIG.maxRetries + 1} attempts: ${lastError?.message}`);
}

// Enhanced file stream handling with chunked processing
function createChunkedReadableStream(file: File, chunkSize: number = 1024 * 1024): Readable {
  let offset = 0;
  const fileSize = file.size;
  
  return new Readable({
    highWaterMark: chunkSize,
    async read() {
      try {
        if (offset >= fileSize) {
          this.push(null); // End of file
          return;
        }
        
        const end = Math.min(offset + chunkSize, fileSize);
        const chunk = file.slice(offset, end);
        const arrayBuffer = await chunk.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        offset = end;
        this.push(buffer);
        
      } catch (error) {
        console.error('Error reading file chunk:', error);
        this.destroy(error as Error);
      }
    }
  });
}

// Enhanced upload function with better error handling and progress tracking
async function uploadWithRetry(
  bucket: GridFSBucket,
  videoFile: File,
  filename: string,
  metadata: any
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    let uploadStream: any = null;
    let uploadProgress = 0;
    
    try {
      console.log(`Upload attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} for ${filename}`);
      console.log(`File size: ${Math.round(videoFile.size / 1024 / 1024)}MB`);
      
      // Verify connection before each upload attempt
      await ensureConnection();
      
      // Create upload stream with write concern
      uploadStream = bucket.openUploadStream(filename, { 
        metadata,
        chunkSizeBytes: 1024 * 1024, // 1MB chunks
      });
      
      // Create optimized readable stream
      const readableStream = createChunkedReadableStream(videoFile, 1024 * 1024);
      
      // Set up comprehensive progress tracking
      const uploadPromise = new Promise<string>((resolve, reject) => {
        let lastProgressUpdate = Date.now();
        let stallCheckInterval: NodeJS.Timeout;
        
        // Monitor for stalled uploads
        stallCheckInterval = setInterval(() => {
          const now = Date.now();
          if (now - lastProgressUpdate > 60000) { // 1 minute without progress
            clearInterval(stallCheckInterval);
            reject(new Error('Upload stalled - no progress for 60 seconds'));
          }
        }, 10000); // Check every 10 seconds
        
        uploadStream.on('error', (error: Error) => {
          clearInterval(stallCheckInterval);
          console.error('Upload stream error:', error);
          reject(error);
        });
        
        uploadStream.on('finish', () => {
          clearInterval(stallCheckInterval);
          console.log(`Upload completed successfully: ${uploadStream.id}`);
          resolve(uploadStream.id.toString());
        });
        
        // Track progress through data events
        let uploadedBytes = 0;
        uploadStream.on('progress', (bytesWritten: number) => {
          uploadedBytes = bytesWritten;
          uploadProgress = (uploadedBytes / videoFile.size) * 100;
          lastProgressUpdate = Date.now();
          
          if (Math.floor(uploadProgress) % 10 === 0 && uploadProgress > 0) {
            console.log(`Upload progress: ${Math.round(uploadProgress)}% (${Math.round(uploadedBytes / 1024 / 1024)}MB/${Math.round(videoFile.size / 1024 / 1024)}MB)`);
          }
        });
        
        readableStream.on('error', (error: Error) => {
          clearInterval(stallCheckInterval);
          console.error('Readable stream error:', error);
          reject(error);
        });
        
        // Handle backpressure properly
        readableStream.on('data', (chunk) => {
          lastProgressUpdate = Date.now();
        });
        
        // Start the upload
        readableStream.pipe(uploadStream);
      });
      
      // Set timeout for entire upload (10 minutes for large files)
      const timeoutMs = 600000; // 10 minutes
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Upload timeout after ${timeoutMs / 1000} seconds`));
        }, timeoutMs);
      });
      
      // Race between upload completion and timeout
      const fileId = await Promise.race([uploadPromise, timeoutPromise]);
      
      console.log(`Upload successful on attempt ${attempt + 1}: ${fileId}`);
      return fileId;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`Upload attempt ${attempt + 1} failed (${Math.round(uploadProgress)}% completed):`, error);
      
      // Enhanced cleanup
      if (uploadStream?.id) {
        try {
          // Wait a moment for any pending operations
          await sleep(1000);
          
          const filesCollection = mongoose.connection.db!.collection('videos_bucket.files');
          const fileExists = await filesCollection.findOne({ _id: uploadStream.id });
          
          if (fileExists) {
            await bucket.delete(uploadStream.id);
            console.log(`Cleaned up partial upload: ${uploadStream.id}`);
          }
        } catch (cleanupError) {
          console.warn('Cleanup warning:', cleanupError);
        }
      }
      
      // Don't retry certain error types
      const nonRetryableErrors = [
        'File must be',
        'size must be',
        'required',
        'Invalid file type',
        'File too large'
      ];
      
      if (nonRetryableErrors.some(errorType => error.message.includes(errorType))) {
        throw error;
      }
      
      // Implement progressive retry delays
      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = getRetryDelay(attempt);
        console.log(`Retrying upload in ${Math.round(delay / 1000)} seconds...`);
        await sleep(delay);
        
        // Reset connection for next attempt
        try {
          await mongoose.disconnect();
          await sleep(2000); // Allow clean disconnect
        } catch (disconnectError) {
          console.warn('Disconnect error (will retry anyway):', disconnectError);
        }
      }
    }
  }
  
  throw new Error(`Upload failed after ${RETRY_CONFIG.maxRetries + 1} attempts: ${lastError?.message}`);
}

// Enhanced POST endpoint with chunked upload support
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('=== Starting robust video upload ===');
    
    // Get and validate class ID
    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");
    
    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }
    
    console.log(`Processing upload for class: ${classId}`);
    
    // Get chunk information from headers
    const formData = await req.formData();
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const uploadId = formData.get("uploadId") as string;
    const originalFileName = formData.get("originalFileName") as string;
    const mimeType = formData.get("mimeType") as string;
    const videoFile = formData.get("video") as File;
    const videoType = formData.get("videoType") as string;

    if (!videoFile) {
      return NextResponse.json({ error: "No video chunk provided" }, { status: 400 });
    }

    // Verify class exists
    let classRecord;
    try {
      await ensureConnection();
      classRecord = await Class.findById(classId);
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        error: "Database connection failed",
        details: "Could not verify class record"
      }, { status: 503 });
    }
    
    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Get GridFS bucket
    const bucket = await getGridFSBucket();
    
    // For the first chunk, start a new upload
    if (chunkIndex === 0) {
      // Clean up any existing incomplete uploads for this uploadId
      try {
        const filesCollection = mongoose.connection.db!.collection('videos_bucket.files');
        const chunksCollection = mongoose.connection.db!.collection('videos_bucket.chunks');
        
        const existingFile = await filesCollection.findOne({ 
          'metadata.uploadId': uploadId,
          'metadata.incomplete': true 
        });
        
        if (existingFile) {
          await chunksCollection.deleteMany({ files_id: existingFile._id });
          await filesCollection.deleteOne({ _id: existingFile._id });
        }
      } catch (error) {
        console.warn('Cleanup warning:', error);
      }
    }

    // Create unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${videoType}-${classId}-${timestamp}-${originalFileName}`;

    // Upload the chunk
    try {
      const uploadStream = bucket.openUploadStream(uniqueFilename, {
        metadata: {
          classId,
          originalName: originalFileName,
          mimeType,
          uploadDate: new Date(),
          uploadId,
          chunkIndex,
          totalChunks,
          incomplete: true
        }
      });

      const buffer = Buffer.from(await videoFile.arrayBuffer());
      uploadStream.write(buffer);
      uploadStream.end();

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      // If this is the last chunk, finalize the upload
      if (chunkIndex === totalChunks - 1) {
        // Update metadata to mark as complete
        const filesCollection = mongoose.connection.db!.collection('videos_bucket.files');
        await filesCollection.updateOne(
          { 'metadata.uploadId': uploadId },
          { $set: { 'metadata.incomplete': false } }
        );

        // Update class record
        const updateFields: any = {};
        if (videoType === "recording") {
          updateFields.recording = uploadStream.id;
          updateFields.recordingFileName = uniqueFilename;
        } else if (videoType === "performance") {
          updateFields.performanceVideo = uploadStream.id;
          updateFields.performanceVideoFileName = uniqueFilename;
        }

        await Class.findByIdAndUpdate(classId, updateFields, { new: true });

        return NextResponse.json({
          success: true,
          message: `${videoType} uploaded successfully`,
          fileId: uploadStream.id.toString(),
          fileName: uniqueFilename
        });
      }

      // For intermediate chunks, just return success
      return NextResponse.json({
        success: true,
        message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      return NextResponse.json({ 
        error: "Upload failed", 
        details: error.message 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error in upload handler:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
}