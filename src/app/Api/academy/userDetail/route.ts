// /Api/academy/userDetail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connect();

    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const decodedToken = jwt.decode(token);
    const academyId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken 
      ? decodedToken.id 
      : null;

    if (!academyId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get userId from query params
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');

    if (!userId) {
    //   return NextResponse.json(
    //     { error: 'User ID is required' },
    //     { status: 400 }
    //   );
    userId = academyId; // If no userId provided, default to academyId
    }

    // Fetch user data
    const user = await User.findOne({
      _id: userId,
    })
      .select('username email profileImage timezone contact city attendance slotsAvailable credits creditsInput')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || '',
        timezone: user.timezone || 'UTC',
        contact: user.contact || '',
        city: user.city || '',
        attendance: user.attendance ,
        slotsAvailable: user.slotsAvailable ,
        credits: user.credits || 0,
        creditsInput: user.creditsInput || []
      }
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch user details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}