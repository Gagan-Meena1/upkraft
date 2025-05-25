// app/api/assignments/create/route.js
import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Assignment from '@/models/assignment';
import User from '@/models/userModel';
import Class from '@/models/Class';
import courseName from '@/models/courseName';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { log } from 'console';

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Parse the FormData
    const formData = await request.formData();
    
    // Extract data from the form
    const title = formData.get('title');
    const description = formData.get('description');
    const deadline = formData.get('deadline');
    const classId = formData.get('classId');
    const courseId = formData.get('courseId');
    const assignmentFile = formData.get('assignmentFile');
    
    // Validate required fields
    console.log("classId : ", classId);
    console.log("courseId : ", courseId);
    console.log("11111111111111111111111111111111111111111111111111111");
    
    if (!title || !description || !deadline || !classId || !courseId) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }
    console.log("2222222222222222222222222222222222222222222222222222222222");
    
    // Create assignment object (without file info initially)
    const assignmentData = {
      title,
      description,
      deadline: typeof deadline === 'string' ? new Date(deadline) : null,
      classId,
      courseId,
    };
    console.log("333333333333333333333333333333333333333333333333333333333");
    
    // Handle file upload if present
    if (assignmentFile instanceof File && assignmentFile.size > 0) {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'assignments');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Error creating uploads directory:', error);
      }
      console.log("444444444444444444444444444444444444444444444444");
      
      // Generate unique filename to prevent overwrites
      const fileName = `${Date.now()}-${assignmentFile.name}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Create buffer from file
      const fileBuffer = Buffer.from(await assignmentFile.arrayBuffer());
      console.log("55555555555555555555555555555555555555555555555555");
      
      // Write file to server
      await writeFile(filePath, fileBuffer);
      
      // Update assignment data with file info
      assignmentData.fileUrl = `/uploads/assignments/${fileName}`;
      assignmentData.fileName = assignmentFile.name;
    }
    
    console.log("55555555555555555555555555555555555555555555555556");
    
    // Create new assignment in database
    const assignment = await Assignment.create(assignmentData);
    console.log("55555555555555555555555555555555555555555555555557");
    
    // Update the Class document with the assignment ID
    await Class.findByIdAndUpdate(
      classId,
      { assignmentId: assignment._id },
      { new: true }
    );
    console.log("Assignment ID added to Class document");
    
    return NextResponse.json({
      success: true,
      data: assignment
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error in assignment creation:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error creating assignment'
    }, { status: 500 });
  }
}



// app/api/assignment/route.js


export async function GET(request:NextRequest) {
  try {
    // Connect to MongoDB
    await connect();

    const token = request.cookies.get("token")?.value;
          const decodedToken = token ? jwt.decode(token) : null;
          const userId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    // Find user and their classes
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    console.log("user.username : ",user.username);
    
    // Get class IDs from user
    const classIds = user.classes || [];
    
    // Step 2: Find all classes and extract assignment IDs
    const classes = await Class.find({
      _id: { $in: classIds }
    });
    
    // Extract assignment IDs from each class
    const assignmentIds = classes
      .map(classObj => classObj.assignmentId)
      .filter(id => id !== null && id !== undefined);
    
    // Step 3: Find assignments using the extracted assignment IDs
    const assignments = await Assignment.find({
      _id: { $in: assignmentIds }
    }).sort({ deadline: 1 }); // Sort by deadline ascending
    
   
   
   
      console.log("11111111111111111111111111111111111111111111111111111111111111111111111111");
    
  
    
    
    console.log("assignments : ",assignments);
    
    return NextResponse.json({
      success: true,
      assignments: assignments
    });
    
  } catch (error:any) {
    console.error("Error fetching assignments:", error);
    
    // Handle JWT verification errors
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// app/api/assignment/route.js - Add this PUT method to your existing file

export async function PUT(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connect();

    // Get assignment ID from query parameters
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({
        success: false,
        message: 'Assignment ID is required'
      }, { status: 400 });
    }

    // Validate assignment ID format
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid assignment ID format'
      }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status field
    if (typeof status !== 'boolean') {
      return NextResponse.json({
        success: false,
        message: 'Status must be a boolean value'
      }, { status: 400 });
    }

    // Find and update the assignment
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { status: status },
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    );

    if (!updatedAssignment) {
      return NextResponse.json({
        success: false,
        message: 'Assignment not found'
      }, { status: 404 });
    }

    console.log(`Assignment ${assignmentId} status updated to: ${status}`);

    return NextResponse.json({
      success: true,
      message: 'Assignment status updated successfully',
      assignment: updatedAssignment
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating assignment status:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json({
        success: false,
        message: 'Invalid assignment ID'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update assignment status'
    }, { status: 500 });
  }
}