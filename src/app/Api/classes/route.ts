// src/app/Api/classes/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { log } from 'console';
import jwt from 'jsonwebtoken'
import courseName from '@/models/courseName';
import User from '@/models/userModel';
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
    
    // Parse the FormData in App Router
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const timezone = formData.get('timezone') as string; // Get timezone from frontend
    
    console.log('Received data:', { title, description, date, startTime, endTime, timezone });
    
    // FIXED: Create dates without timezone conversion
    // Parse the date and time components separately
    const [year, month, day] = date.split('-').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Create Date objects in local time (no timezone conversion)
    const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);
    
    console.log('Created DateTime objects:', {
      startDateTime: startDateTime.toString(),
      endDateTime: endDateTime.toString(),
      startDateTimeISO: startDateTime.toISOString(),
      endDateTimeISO: endDateTime.toISOString()
    });

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
      course: courseId,
      startTime: startDateTime,
      endTime: endDateTime,
      instructor: instructorId,
      recording: videoPath,
      recordingProcessed: videoPath ? 0 : null,
    });
    
    const savednewClass = await newClass.save();
    console.log("333333333333333333333333333333333333333333333333333333333333");
    console.log('Saved class:', savednewClass);
    
    const course = await courseName.findById(courseId);
    await courseName.findByIdAndUpdate(courseId, {$addToSet: {class: savednewClass._id}});
    
    // Update users enrolled in this course
    await User.updateMany(
      { courses: courseId },
      { $addToSet: { classes: savednewClass._id } }
    );
    
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
    console.log("decodedToken : ",decodedToken);
    console.log("instructorId : ",instructorId);
    
    const classes=await Class.find({instructor:instructorId});
    
    // console.log(classes);
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
export async function PUT(request: NextRequest) {
  try {
    console.log("Updating class...");
    
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    
    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const token = request.cookies.get("token")?.value;
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, date, startTime, endTime } = body;
    
    console.log('RECEIVED:', { title, description, date, startTime, endTime });

    if (!title || !description || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (endTime <= startTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Create Date objects using LOCAL timezone - NO UTC conversion
    const [year, month, day] = date.split('-').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Create Date objects in LOCAL time zone
    const startDateTime = new Date(year, month - 1, day, startHour, startMinute, 0, 0);
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute, 0, 0);

    console.log('STORING AS DATE OBJECTS:', {
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      startDateTimeString: startDateTime.toString(),
      endDateTimeString: endDateTime.toString()
    });

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        title,
        description,
        startTime: startDateTime,  // Store as Date object in local time
        endTime: endDateTime,      // Store as Date object in local time
      },
      { new: true, runValidators: true }
    );

    console.log('STORED SUCCESSFULLY');

    return NextResponse.json({
      message: 'Class updated successfully',
      classData: updatedClass
    }, { status: 200 });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


// DELETE - Delete existing class
export async function DELETE(request: NextRequest) {
  try {
    console.log("Deleting class...");
    
    // Get classId from query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    
    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' }, 
        { status: 400 }
      );
    }

    // Get instructor ID from token
    const token = request.cookies.get("token")?.value;
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' }, 
        { status: 401 }
      );
    }

    // Find the class and verify ownership
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return NextResponse.json(
        { error: 'Class not found' }, 
        { status: 404 }
      );
    }

   

    console.log('Found class to delete:', existingClass);

    // Remove class reference from course
    if (existingClass.course) {
      await courseName.findByIdAndUpdate(
        existingClass.course,
        { $pull: { class: classId } }
      );
      console.log('Removed class reference from course');
    }

    // Remove class reference from users
    await User.updateMany(
      { classes: classId },
      { $pull: { classes: classId } }
    );
    console.log('Removed class reference from users');

    // Delete the class
    await Class.findByIdAndDelete(classId);
    console.log('Class deleted successfully');

    return NextResponse.json({
      message: 'Class deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Server error while deleting class:', error);
    return NextResponse.json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}