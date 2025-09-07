// app/Api/assignment/route.js (modify your existing endpoint)
import { NextResponse } from 'next/server';
import {connect} from '@/dbConnection/dbConfic'
import Assignment from '@/models/assignment'; 

export async function GET(request) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    
    // If assignmentId is provided, return single assignment details
    if (assignmentId) {
      // Validate assignment ID
      if (!assignmentId) {
        return NextResponse.json(
          { success: false, message: 'Assignment ID is required' },
          { status: 400 }
        );
      }

      // Find assignment by ID and populate related data
      const assignment = await Assignment.findById(assignmentId)
        .populate({
          path: 'classId',
          select: 'title description startTime endTime'
        })
        .populate({
          path: 'courseId',
          select: 'title category'
        })
        .populate({
          path: 'userId',
          select: 'username email category'
        })
        .lean();

      if (!assignment) {
        return NextResponse.json(
          { success: false, message: 'Assignment not found' },
          { status: 404 }
        );
      }

      // Transform the data to match your frontend interface
      const transformedAssignment = {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline,
        status: assignment.status || false,
        fileUrl: assignment.fileUrl,
        fileName: assignment.fileName,
        createdAt: assignment.createdAt,
        class: {
          _id: assignment.classId?._id || '',
          title: assignment.classId?.title || '',
          description: assignment.classId?.description || '',
          startTime: assignment.classId?.startTime || '',
          endTime: assignment.classId?.endTime || ''
        },
        course: {
          _id: assignment.courseId?._id || '',
          title: assignment.courseId?.title || '',
          category: assignment.courseId?.category || ''
        },
        assignedStudents: assignment.userId?.filter(user => user.category !== 'Tutor').map(user => ({
          userId: user._id,
          username: user.username,
          email: user.email
        })) || [],
        totalAssignedStudents: assignment.userId?.filter(user => user.category !== 'Tutor').length || 0
      };

      return NextResponse.json({
        success: true,
        message: 'Assignment details fetched successfully',
        data: transformedAssignment
      });
    }

    // If no assignmentId, return all assignments (your existing logic)
    // ... your existing code for fetching all assignments
    
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'Invalid assignment ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const body = await request.json();
    
    if (!assignmentId) {
      return NextResponse.json(
        { success: false, message: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { status: body.status },
      { new: true }
    );

    if (!updatedAssignment) {
      return NextResponse.json(
        { success: false, message: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment status updated successfully',
      data: updatedAssignment
    });

  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}