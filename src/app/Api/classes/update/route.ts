// /Api/videos/upload-chunk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

connect();

function getGridFSBucket(): GridFSBucket {
  if (!mongoose.connection.db) {
    throw new Error('Database connection not established');
  }
  return new GridFSBucket(mongoose.connection.db, {
    bucketName: 'videos_bucket'
  });
}

// Optimized upload session interface
interface UploadSession {
  uploadStream: any; // GridFS upload stream
  fileName: string;
  classId: string;
  totalChunks: number;
  receivedChunks: number;
  totalSize: number;
  createdAt: number;
  lastActivity: number;
  expectedChunks: Set<number>;
  isCompleted: boolean;
  fileId?: string;
  error?: string;
}

const uploadSessions = new Map<string, UploadSession>();

// Clean up old sessions
const cleanupOldSessions = () => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes (reduced from 2 hours)
  
  for (const [uploadId, session] of uploadSessions.entries()) {
    if (now - session.createdAt > maxAge) {
      console.log(`Cleaning up old session: ${uploadId}`);
      try {
        if (session.uploadStream && !session.isCompleted) {
          session.uploadStream.destroy();
        }
      } catch (e) {
        console.warn(`Error destroying stream for ${uploadId}:`, e);
      }
      uploadSessions.delete(uploadId);
    }
  }
};

// Initialize upload session with immediate GridFS stream
const initializeUploadSession = (uploadId: string, fileName: string, classId: string, totalChunks: number) => {
  const bucket = getGridFSBucket();
  const uniqueFilename = `recording-${classId}-${Date.now()}-${fileName}`;
  
  const uploadStream = bucket.openUploadStream(uniqueFilename, {
    metadata: {
      classId,
      originalName: fileName,
      uploadDate: new Date(),
      fileType: 'recording'
    }
  });

  const expectedChunks = new Set<number>();
  for (let i = 0; i < totalChunks; i++) {
    expectedChunks.add(i);
  }

  const session: UploadSession = {
    uploadStream,
    fileName,
    classId,
    totalChunks,
    receivedChunks: 0,
    totalSize: 0,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    expectedChunks,
    isCompleted: false
  };

  // Handle upload completion
  uploadStream.on('finish', async () => {
    try {
      console.log(`GridFS upload completed: ${uploadStream.id}`);
      session.fileId = uploadStream.id.toString();
      session.isCompleted = true;

      // Update class record immediately
      const classRecord = await Class.findById(classId);
      if (classRecord) {
        // Delete old recording if exists
        if (classRecord.recordingFileId) {
          try {
            await bucket.delete(new ObjectId(classRecord.recordingFileId));
          } catch (deleteError) {
            console.warn("Could not delete existing recording:", deleteError);
          }
        }
        
        classRecord.recordingFileId = uploadStream.id.toString();
        classRecord.recordingFileName = uniqueFilename;
        await classRecord.save();
      }

      console.log(`Upload ${uploadId} completed successfully`);
    } catch (error) {
      console.error(`Error completing upload ${uploadId}:`, error);
      session.error = error instanceof Error ? error.message : 'Unknown error';
    }
  });

  uploadStream.on('error', (error) => {
    console.error(`GridFS upload error for ${uploadId}:`, error);
    session.error = error.message;
  });

  uploadSessions.set(uploadId, session);
  return session;
};

export async function POST(req: NextRequest) {
  try {
    // Clean up old sessions periodically
    if (Math.random() < 0.05) { // 5% chance to clean up
      cleanupOldSessions();
    }

    const formData = await req.formData();
    const chunk = formData.get("chunk") as File;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const fileName = formData.get("fileName") as string;
    const classId = formData.get("classId") as string;
    const uploadId = formData.get("uploadId") as string;

    if (!chunk || chunkIndex === undefined || !totalChunks || !fileName || !classId || !uploadId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Initialize session if it doesn't exist
    if (!uploadSessions.has(uploadId)) {
      initializeUploadSession(uploadId, fileName, classId, totalChunks);
    }

    const session = uploadSessions.get(uploadId)!;
    session.lastActivity = Date.now();

    // Check for errors
    if (session.error) {
      return NextResponse.json({ error: session.error }, { status: 500 });
    }

    // Check if chunk already received
    if (!session.expectedChunks.has(chunkIndex)) {
      return NextResponse.json({
        success: true,
        message: "Chunk already received",
        progress: (session.receivedChunks / session.totalChunks) * 100,
        completed: session.isCompleted
      });
    }

    // Write chunk directly to stream
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    
    // Write chunk in correct order (this is crucial for video files)
    if (chunkIndex === 0 || session.receivedChunks === chunkIndex) {
      // Can write immediately
      session.uploadStream.write(chunkBuffer);
      session.expectedChunks.delete(chunkIndex);
      session.receivedChunks++;
      session.totalSize += chunkBuffer.length;
    } else {
      // Store out-of-order chunk temporarily (minimal memory usage)
      if (!session.uploadStream.pendingChunks) {
        session.uploadStream.pendingChunks = new Map();
      }
      session.uploadStream.pendingChunks.set(chunkIndex, chunkBuffer);
      session.expectedChunks.delete(chunkIndex);
    }

    // Process any pending chunks that are now in order
    while (session.uploadStream.pendingChunks && session.uploadStream.pendingChunks.has(session.receivedChunks)) {
      const pendingChunk = session.uploadStream.pendingChunks.get(session.receivedChunks);
      session.uploadStream.write(pendingChunk);
      session.uploadStream.pendingChunks.delete(session.receivedChunks);
      session.receivedChunks++;
      session.totalSize += pendingChunk.length;
    }

    console.log(`Processed chunk ${chunkIndex + 1}/${totalChunks} for upload ${uploadId}`);

    // Check if all chunks are received
    if (session.receivedChunks === totalChunks) {
      console.log(`All chunks received for upload ${uploadId}, finalizing...`);
      session.uploadStream.end(); // This triggers the 'finish' event
      
      return NextResponse.json({
        success: true,
        message: "Upload completed, finalizing...",
        progress: 100,
        completed: false,
        processing: true
      });
    }

    return NextResponse.json({
      success: true,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} processed`,
      progress: (session.receivedChunks / totalChunks) * 100,
      completed: false,
      processing: false
    });

  } catch (error: any) {
    console.error("Error in chunk upload:", error);
    return NextResponse.json({ 
      error: error.message || "Upload failed" 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const uploadId = url.searchParams.get("uploadId");
    
    if (!uploadId) {
      return NextResponse.json({ error: "Upload ID is required" }, { status: 400 });
    }

    if (!uploadSessions.has(uploadId)) {
      return NextResponse.json({ error: "Upload session not found" }, { status: 404 });
    }
    
    const session = uploadSessions.get(uploadId)!;
    const progress = (session.receivedChunks / session.totalChunks) * 100;
    
    // If completed, clean up session after a delay
    if (session.isCompleted) {
      setTimeout(() => {
        uploadSessions.delete(uploadId);
      }, 5000); // Clean up after 5 seconds
    }
    
    return NextResponse.json({
      success: true,
      progress,
      receivedChunks: session.receivedChunks,
      totalChunks: session.totalChunks,
      isProcessing: session.receivedChunks === session.totalChunks && !session.isCompleted,
      completed: session.isCompleted,
      totalSize: session.totalSize,
      fileId: session.fileId,
      error: session.error
    });

  } catch (error: any) {
    console.error("Error checking upload status:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to check status" 
    }, { status: 500 });
  }
}