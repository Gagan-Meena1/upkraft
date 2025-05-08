// Import required modules
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class"; // Assuming you have a Class model
import { writeFile, mkdir } from 'fs/promises';

// Connect to database
connect();

// Function to ensure directory exists
async function ensureDirectoryExists(directory: string) {
  try {
    await mkdir(directory, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EXIST') {
      throw error;
    }
  }
}

// In App Router, route handlers should not accept the params argument directly
export async function POST(req: NextRequest) {
  try {
    // Get the class ID from query parameters
    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");
    
    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }
    
    // Check if class exists
    const classRecord = await Class.findById(classId);
    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    
    // Get the form data (multipart/form-data)
    const formData = await req.formData();
    const videoFile = formData.get("video") as File | null;
    
    if (!videoFile) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }
    
    // Check if the file is a video
    if (!videoFile.type.startsWith("video/")) {
      return NextResponse.json({ error: "File must be a video" }, { status: 400 });
    }
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public/uploads/recordings");
    await ensureDirectoryExists(uploadDir);
    
    // Create a unique filename
    const uniqueFilename = `${classId}-${Date.now()}${path.extname(videoFile.name)}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Convert the file to an array buffer and write to disk
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Update the class record with the recording URL
    const recordingUrl = `/uploads/recordings/${uniqueFilename}`;
    classRecord.recording = recordingUrl;
    await classRecord.save();
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Video uploaded successfully",
      recordingUrl: recordingUrl
    });
  } catch (error: any) {
    console.error("Error uploading video:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}