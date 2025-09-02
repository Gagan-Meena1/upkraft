// app/api/assignments/create/route.js
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
import Assignment from '@/models/assignment';
import Class from '@/models/Class';
import { connect } from '@/dbConnection/dbConfic';
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
    // console.log("classId : ", classId);
    // console.log("courseId : ", courseId);
    // console.log("11111111111111111111111111111111111111111111111111111");
    
    if (!title || !description || !deadline || !classId || !courseId) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }
    console.log("2222222222222222222222222222222222222222222222222222222222");

    // Find all  who have this courseId
    const userWithCourse = await User.find({
      courses: courseId 
    }).select('_id');

    const UserIds = userWithCourse.map(student => student._id);
    
    console.log("Found students with courseId:", UserIds.length);
    
    // Create assignment object (without file info initially)
    const assignmentData = {
      title,
      description,
      deadline: typeof deadline === 'string' ? new Date(deadline) : null,
      classId,
      courseId,
      userId: UserIds, // Changed from userId to userIds array
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
    
    // Update all users' assignment arrays with the new assignment ID
    if (UserIds.length > 0) {
      await User.updateMany(
        { _id: { $in: UserIds } },
        { $push: { assignment: assignment._id } }
      );
      console.log(`Assignment ID added to ${UserIds.length} students' assignment arrays`);
    }
    
    // Update the Class document with the assignment ID
    await Class.findByIdAndUpdate(
      classId,
      { assignmentId: assignment._id },
      { new: true }
    );
    console.log("Assignment ID added to Class document");
    
    return NextResponse.json({
      success: true,
      data: assignment,
      studentsAssigned: UserIds.length
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error in assignment creation:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error creating assignment'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // Extract user ID from URL query parameters
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get('userId');
    
    // Get userId from token if not provided in query parameters
    let userId;
    if (userIdParam) {
      userId = userIdParam;
    } else {
      const token = request.cookies.get("token")?.value;
      const decodedToken = token ? jwt.decode(token) : null;
      userId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    }
    
    // Ensure we have a valid userId
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        message: "User ID is required. Please provide userId parameter or ensure you are logged in." 
      }, { status: 400 });
    }
    
    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ 
        success: false,
        message: "Invalid user ID format" 
      }, { status: 400 });
    }
    
    // Find the user and get their assignment array and category
    const user = await User.findById(userId).select('username email assignment category');
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: "User not found" 
      }, { status: 404 });
    }
    
    // Check if user has any assignments
    if (!user.assignment || user.assignment.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No assignments found for this user",
        data: {
          userId: user._id,
          username: user.username,
          userCategory: user.category,
          assignments: []
        }
      });
    }
    
    // Handle based on user category
    if (user.category.toLowerCase() === 'student') {
      // For Students: Get assignment details only
      const assignments = await Assignment.find({
        _id: { $in: user.assignment }
      })
      .populate('classId', 'title description startTime endTime')
      .populate('courseId', 'title category')
      .sort({ deadline: 1 }); // Sort by deadline (earliest first)
      
      return NextResponse.json({
        success: true,
        message: "Student assignments retrieved successfully",
        data: {
          userId: user._id,
          username: user.username,
          userCategory: user.category,
          totalAssignments: assignments.length,
          assignments: assignments.map(assignment => ({
            _id: assignment._id,
            title: assignment.title,
            description: assignment.description,
            deadline: assignment.deadline,
            status: assignment.status,
            fileUrl: assignment.fileUrl,
            fileName: assignment.fileName,
            createdAt: assignment.createdAt,
            class: assignment.classId,
            course: assignment.courseId
          }))
        }
      });
      
    } else if (user.category.toLowerCase() === 'tutor') {
      // For Tutors: Get assignment details with student information
      const assignments = await Assignment.find({
        _id: { $in: user.assignment }
      })
      .populate('classId', 'title description startTime endTime')
      .populate('courseId', 'title category')
      .populate('userId', 'username email')
      .sort({ deadline: 1 }); // Sort by deadline (earliest first)
      
      // Transform the data to include student details for each assignment
      // Filter out the tutor from the student lists
      const assignmentsWithStudents = assignments.map(assignment => {
        // Filter out the tutor's ID from the assigned students
        const studentsOnly = assignment.userId.filter(student => 
          student._id.toString() !== userId.toString()
        );
        
        return {
          _id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          deadline: assignment.deadline,
          status: assignment.status,
          fileUrl: assignment.fileUrl,
          fileName: assignment.fileName,
          createdAt: assignment.createdAt,
          class: assignment.classId,
          course: assignment.courseId,
          assignedStudents: studentsOnly.map(student => ({
            userId: student._id,
            username: student.username,
            email: student.email
          })),
          totalAssignedStudents: studentsOnly.length
        };
      });
      
      return NextResponse.json({
        success: true,
        message: "Tutor assignments with student details retrieved successfully",
        data: {
          userId: user._id,
          username: user.username,
          userCategory: user.category,
          totalAssignments: assignmentsWithStudents.length,
          assignments: assignmentsWithStudents
        }
      });
      
    } else {
      // Handle other categories if any
      return NextResponse.json({
        success: false,
        message: "Invalid user category. Must be either 'student' or 'tutor'"
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error("Error fetching user assignments:", error);
    return NextResponse.json({ 
      success: false,
      message: error.message || "Internal server error"
    }, { status: 500 });
  }
}

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