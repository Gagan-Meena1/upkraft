import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

export async function PUT(request: NextRequest) {
  try {
    await connect();

    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Decode token to get user ID
    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.id;

    // Verify user is a student
    const user = await User.findById(userId);
    if (!user || user.category !== 'Student') {
      return NextResponse.json({ error: 'Only students can update student information' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { studentName, email, phone, address } = body;

    // Validate required fields
    if (!studentName || !email) {
      return NextResponse.json({ 
        error: 'Student name and email are required' 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      username: studentName,
      email: email
    };

    // Add optional fields if provided
    if (phone) {
      updateData.contact = phone;
    }
    if (address) {
      updateData.address = address;
    }

    // Update the user in the database
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Student information updated successfully',
      user: updatedUser
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating student info:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update student information' 
    }, { status: 500 });
  }
}

