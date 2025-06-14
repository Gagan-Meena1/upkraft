// File: app/api/videos/metadata/[fileId]/route.ts
// This API endpoint gets video metadata from GridFS

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

// Connect to database
connect();

// Function to get GridFS bucket
function getGridFSBucket(): GridFSBucket {
  if (!mongoose.connection.db) {
    throw new Error('Database connection not established');
  }
  return new GridFSBucket(mongoose.connection.db, {
    bucketName: 'videos'
  });
}

// GET endpoint - Get video metadata
export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;
    
    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    if (!ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const bucket = getGridFSBucket();
    const objectId = new ObjectId(fileId);

    // Get file metadata
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = files[0];

    return NextResponse.json({
      success: true,
      metadata: {
        id: file._id.toString(),
        filename: file.filename,
        length: file.length,
        chunkSize: file.chunkSize,
        uploadDate: file.uploadDate,
        md5: file.md5,
        metadata: file.metadata
      }
    });

  } catch (error: any) {
    console.error("Error getting video metadata:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
}