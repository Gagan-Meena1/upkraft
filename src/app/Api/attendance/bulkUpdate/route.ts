// src/app/Api/attendance/bulkUpdate/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import mongoose from 'mongoose';

await connect();

export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json();

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { message: 'Please provide an array of user IDs' },
        { status: 400 }
      );
    }

    // Filter and convert valid ObjectIds
    const validIds: mongoose.Types.ObjectId[] = [];
    const invalidIds: string[] = [];

    userIds.forEach((id: string) => {
      if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
        validIds.push(new mongoose.Types.ObjectId(id));
      } else {
        invalidIds.push(id);
      }
    });

    console.log('Valid IDs:', validIds.length);
    console.log('Invalid IDs:', invalidIds);

    if (validIds.length === 0) {
      return NextResponse.json(
        { message: 'No valid user IDs provided', invalidIds },
        { status: 400 }
      );
    }

    // Update all attendance entries to "not_marked" for the specified users
    const result = await User.updateMany(
      { _id: { $in: validIds } },
      { 
        $set: { 
          "attendance.$[].status": "not_marked" 
        } 
      }
    );

    console.log('Update result:', result);

    return NextResponse.json({
      message: 'Attendance status updated successfully',
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
      validIdsCount: validIds.length,
      invalidIds: invalidIds.length > 0 ? invalidIds : undefined
    }, { status: 200 });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}