// File: app/api/videos/[fileId]/route.ts
// This API endpoint retrieves videos from GridFS

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

// GET endpoint - Retrieve video by file ID
export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = await params;
    
    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // Validate ObjectId
    if (!ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const bucket = getGridFSBucket();
    const objectId = new ObjectId(fileId);

    // Check if file exists
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = files[0];

    // Handle range requests for video streaming
    const range = req.headers.get('range');
    const fileSize = file.length;

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      // Create download stream with range
      const downloadStream = bucket.openDownloadStream(objectId, {
        start,
        end: end + 1
      });

      // Convert stream to response
      const stream = new ReadableStream({
        start(controller) {
          downloadStream.on('data', (chunk) => {
            controller.enqueue(chunk);
          });
          
          downloadStream.on('end', () => {
            controller.close();
          });
          
          downloadStream.on('error', (error) => {
            controller.error(error);
          });
        }
      });

      return new NextResponse(stream, {
        status: 206, // Partial Content
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': file.metadata?.mimeType || 'video/mp4',
          'Cache-Control': 'public, max-age=31536000',
        }
      });
    } else {
      // No range header, return full file
      const downloadStream = bucket.openDownloadStream(objectId);

      const stream = new ReadableStream({
        start(controller) {
          downloadStream.on('data', (chunk) => {
            controller.enqueue(chunk);
          });
          
          downloadStream.on('end', () => {
            controller.close();
          });
          
          downloadStream.on('error', (error) => {
            controller.error(error);
          });
        }
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': file.metadata?.mimeType || 'video/mp4',
          'Content-Length': fileSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000',
          'Content-Disposition': `inline; filename="${file.filename}"`,
        }
      });
    }

  } catch (error: any) {
    console.error("Error retrieving video:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE endpoint - Delete video from GridFS
export async function DELETE(
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

    // Check if file exists
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete the file
    await bucket.delete(objectId);

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully"
    });

  } catch (error: any) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
}