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
  await mongoose.connect(process.env.MONGODB_URI!, MONGO_OPTIONS);
  
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
        bucketName: 'videos',
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
          
          const filesCollection = mongoose.connection.db!.collection('videos.files');
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

// Enhanced POST endpoint with better error handling
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
    
    // Verify class exists (with connection retry)
    let classRecord;
    try {
      await ensureConnection();
      classRecord = await Class.findById(classId);
    } catch (dbError) {
      console.error('Database connection error during class lookup:', dbError);
      return NextResponse.json({ 
        error: "Database connection failed",
        details: "Could not verify class record"
      }, { status: 503 });
    }
    
    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    
    // Parse and validate form data
    const formData = await req.formData();
    const videoFile = formData.get("video") as File | null;
    
    if (!videoFile) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }
    
    // Enhanced file validation
    if (!videoFile.type.startsWith("video/")) {
      return NextResponse.json({ 
        error: "Invalid file type",
        details: "File must be a video format"
      }, { status: 400 });
    }
    
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (videoFile.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large",
        details: `File size (${Math.round(videoFile.size / 1024 / 1024)}MB) exceeds limit (500MB)`
      }, { status: 400 });
    }
    
    if (videoFile.size === 0) {
      return NextResponse.json({ 
        error: "Empty file",
        details: "Uploaded file appears to be empty"
      }, { status: 400 });
    }
    
    console.log(`File validated: ${videoFile.name} (${Math.round(videoFile.size / 1024 / 1024)}MB, ${videoFile.type})`);
    
    // Get GridFS bucket with enhanced error handling
    const bucket = await getGridFSBucket();
    
    // Background cleanup of existing recording
    if (classRecord.recordingFileId) {
      setImmediate(async () => {
        try {
          await bucket.delete(new ObjectId(classRecord.recordingFileId));
          console.log(`Previous recording deleted: ${classRecord.recordingFileId}`);
        } catch (error) {
          console.warn("Could not delete existing recording:", error);
        }
      });
    }
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `recording-${classId}-${timestamp}-${sanitizedName}`;
    
    console.log(`Starting upload with filename: ${uniqueFilename}`);
    
    // Perform upload with comprehensive retry logic
    const fileId = await uploadWithRetry(bucket, videoFile, uniqueFilename, {
      classId: classId,
      originalName: videoFile.name,
      mimeType: videoFile.type,
      uploadDate: new Date(),
      fileSize: videoFile.size,
      fileType: 'recording',
      version: '2.0'
    });
    
    // Update database record with retry
    try {
      await Class.findByIdAndUpdate(
        classId,
        {
          recordingFileId: fileId,
          recordingFileName: uniqueFilename,
          recordingUploadDate: new Date()
        },
        { new: true }
      );
    } catch (updateError) {
      console.error('Database update failed:', updateError);
      // Upload succeeded but DB update failed - log but don't fail the request
      console.warn('Upload completed but could not update class record');
    }
    
    const duration = Date.now() - startTime;
    const durationSeconds = Math.round(duration / 1000);
    
    console.log(`=== Upload completed successfully in ${durationSeconds}s ===`);
    
    return NextResponse.json({
      success: true,
      message: "Recording uploaded successfully to GridFS",
      fileId: fileId,
      fileName: uniqueFilename,
      fileSize: `${Math.round(videoFile.size / 1024 / 1024)}MB`,
      uploadTime: `${durationSeconds}s`,
      uploadSpeed: `${Math.round((videoFile.size / 1024 / 1024) / (duration / 1000))}MB/s`
    });
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const durationSeconds = Math.round(duration / 1000);
    
    console.error(`=== Upload failed after ${durationSeconds}s ===`);
    console.error('Error details:', error);
    
    // Categorize error types for better client handling
    let statusCode = 500;
    let errorCategory = 'unknown';
    
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      statusCode = 408;
      errorCategory = 'timeout';
    } else if (error.message.includes('connection') || error.message.includes('network')) {
      statusCode = 503;
      errorCategory = 'network';
    } else if (error.message.includes('File') || error.message.includes('size')) {
      statusCode = 400;
      errorCategory = 'validation';
    }
    
    return NextResponse.json({ 
      error: "Upload failed",
      category: errorCategory,
      details: error.message,
      duration: `${durationSeconds}s`,
      retryable: statusCode >= 500
    }, { status: statusCode });
  }
}