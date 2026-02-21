import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

export async function PUT(request: NextRequest) {
  try {
    await connect();

    // Get token from cookies
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Decode token to get user ID
    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.id;

    // Verify user is a tutor
    const user = await User.findById(userId);
    if (!user || user.category !== 'Tutor') {
      return NextResponse.json({ error: 'Only tutors can update tutor information' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { tutorName, email, contactNumber, address, city, skills, teachingExperience, teachingMode, timezone } = body;

    // Validate required fields
    if (!tutorName || !email) {
      return NextResponse.json({ 
        error: 'Tutor name and email are required' 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      username: tutorName,
      email: email
    };

    // Add optional fields if provided
    if (contactNumber !== undefined && contactNumber !== null && contactNumber !== '') {
      updateData.contact = contactNumber;
    }
    if (address !== undefined && address !== null && address !== '') {
      updateData.address = address;
    }
    if (city !== undefined && city !== null && city !== '') {
      updateData.city = city;
    }
    if (skills !== undefined && skills !== null && skills !== '') {
      updateData.skills = skills;
    }
    if (teachingExperience !== undefined && teachingExperience !== null && teachingExperience !== '') {
      updateData.experience = parseInt(teachingExperience);
    }
    if (teachingMode !== undefined && teachingMode !== null && teachingMode !== '') {
      // Map user-friendly values to enum values
      const teachingModeMap: Record<string, string> = {
        'online': 'Online',
        'offline': 'In-person',
        'both': 'Both'
      };
      updateData.teachingMode = teachingModeMap[teachingMode.toLowerCase()] || teachingMode;
    }
    if (timezone !== undefined && timezone !== null && timezone !== '') {
      updateData.timezone = timezone;
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
      message: 'Tutor information updated successfully',
      user: updatedUser
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating tutor info:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update tutor information' 
    }, { status: 500 });
  }
}

