// src/app/Api/classes/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { log } from 'console';
import jwt from 'jsonwebtoken'
// import { getServerSession } from 'next-auth/next'; // If using next-auth
await connect();
export async function POST(request: NextRequest) {
  try {
    console.log("1111111111111111111111111111111111111111111111111111111111111111111");
    
    const referer = request.headers.get('referer');
  
    console.log('Full Referer:', referer);
  
    // Parse the courseId from the Referer URL
    let courseId = null;
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        courseId = refererUrl.searchParams.get('courseId');
        
        console.log('Extracted CourseId:', courseId);
      } catch (error) {
        console.error('Error parsing Referer URL:', error);
      }
    }
  
    // Validate courseId
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' }, 
        { status: 400 }
      );
    }
  
    
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Get session (if using next-auth)
    // const session = await getServerSession();
    
    // Parse the FormData in App Router
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    // const courseName = formData.get('courseName') as string;
    
    // Format dates
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    const token = request.cookies.get("token")?.value;
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
    
    // Handle video upload
    let videoPath = null;
    const videoFile = formData.get('video') as File | null;
    
    if (videoFile && videoFile.size > 0) {
      const originalFilename = videoFile.name;
      const newFilename = `${Date.now()}-${originalFilename}`;
      const newPath = path.join(uploadDir, newFilename);
      
      // Convert file to ArrayBuffer, then Buffer
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Write file to disk
      await writeFile(newPath, buffer);
      
      // Store the relative path in the database
      videoPath = `/uploads/${newFilename}`;
    }
    
    // Create a new Class document
    console.log("222222222222222222222222222222222222222222222222222");
    
    const newClass = new Class({
      title,
      description,
      course:courseId,
      startTime: startDateTime,
      endTime: endDateTime,
      instructor: instructorId, // Set this based on your auth solution
      recording: videoPath,
      recordingProcessed: videoPath ? 0 : null,
    });
    
    await newClass.save();
    console.log("333333333333333333333333333333333333333333333333333333333333");
    

    console.log(newClass);
    return NextResponse.json({
      message: 'Session created successfully',
      classData: newClass
    }, { status: 201 });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
export async function GET(request: NextRequest) {
  try {
    console.log("1111111111111111111111111111111111111111111111111111111111111111111");

    const token = request.cookies.get("token")?.value;
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
    const classes=await Class.find({instructor:instructorId});
    
   
      
    
    // Create a new Class document
    console.log("222222222222222222222222222222222222222222222222222");
    
    // const newClass = new Class({
    //   title,
    //   description,
    //   course:courseId,
    //   startTime: startDateTime,
    //   endTime: endDateTime,
    //   instructor: instructorId, // Set this based on your auth solution
    //   recording: videoPath,
    //   recordingProcessed: videoPath ? 0 : null,
    // });
    
    // await newClass.save();
    console.log("333333333333333333333333333333333333333333333333333333333333");
    

    console.log(classes);
    return NextResponse.json({
      message: 'Session sent successfully',
      classData: classes
    }, { status: 201 });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}