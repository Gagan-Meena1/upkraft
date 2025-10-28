import { NextRequest, NextResponse } from 'next/server';
import Assignment from '@/models/assignment';
import { connect } from '@/dbConnection/dbConfic';

export async function PUT(request: NextRequest) {
  try {
    await connect();
    
    // Get assignmentId from query parameters
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    
    if (!assignmentId) {
      return NextResponse.json({
        success: false,
        message: 'Assignment ID is required'
      }, { status: 400 });
    }

    // Get the current assignment to toggle its status
    const currentAssignment = await Assignment.findById(assignmentId);
    
    if (!currentAssignment) {
      return NextResponse.json({
        success: false,
        message: 'Assignment not found'
      }, { status: 404 });
    }

    // Toggle the status
    const newStatus = !currentAssignment.status;
    
    // Update the assignment status
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { status: newStatus },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Assignment marked as ${newStatus ? 'complete' : 'incomplete'}`,
      data: updatedAssignment
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating assignment status:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error updating assignment status'
    }, { status: 500 });
  }
}