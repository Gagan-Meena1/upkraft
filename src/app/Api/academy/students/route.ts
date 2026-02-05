import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';
import { time } from 'console';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connect();

    // Extract academy ID from token
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

    // Get pagination parameters from query
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch students with populated instructor and courses
    const students = await User.find({
      category: "Student",
      academyId: academyId
    })
      .populate('instructorId', 'username email')
      .populate('courses', 'title')
      .populate({
        path: 'classes',
        options: { sort: { createdAt: -1 }, limit: 1 }, // Get last class
        select: 'startTime'
      })
      .select('-password -forgotPasswordToken -verifyToken')
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalStudents = await User.countDocuments({
      category: "Student",
      academyId: academyId
    });

// Convert academyId to ObjectId for aggregation
    const academyObjectId = new mongoose.Types.ObjectId(academyId);

    // Get status counts using aggregation
    const statusCounts = await User.aggregate([
      {
        $match: {
          category: "Student",
          academyId: academyObjectId // Use ObjectId here
        }
      },
      {
        $group: {
          _id: "$state",
          count: { $sum: 1 }
        }
      }
    ]);

    console.log("Status Counts Raw:", statusCounts);

    // Initialize stats object
    const stats = {
      total: totalStudents,
      active: 0,
      inactive: 0,
      vacation: 0,
      dormant: 0,
      blocked: 0
    };

    // Populate stats from aggregation results
    statusCounts.forEach(item => {
      const state = item._id?.toLowerCase();
      if (state && state in stats) {
        stats[state] = item.count;
      }
    });


console.log("Status Counts:", stats);

statusCounts.forEach(item => {
  if (item._id) {
    stats[item._id.toLowerCase()] = item.count;
  }
});


    const totalPages = Math.ceil(totalStudents / limit);

    // Format the response
    const formattedStudents = students.map(student => ({
      _id: student._id,
      username: student.username,
      email: student.email,
      profileImage: student.profileImage || '',
      contact: student.contact || '',
      city: student.city || '',
      tutor: student.instructorId && student.instructorId.length > 0 
        ? student.instructorId[0]?.username || 'N/A'
        : 'N/A',
      course: student.courses && student.courses.length > 0
        ? student.courses[0]?.title || 'N/A'
        : 'N/A',
      lastClass: student.classes && student.classes.length > 0
        ? student.classes[0]?.startTime || null
        : null,
      createdAt: student.createdAt || null,
      timezone: student.timezone || 'UTC',
      credits: student.credits || 0,
      // Hardcoded values as per requirement
      progress: 0,
      attendance: student.attendance || [],
      status: student.state || 'active'
    }));

    return NextResponse.json({
      success: true,
      students: formattedStudents,
      stats,
      pagination: {
        currentPage: page,
        totalPages,
        totalStudents,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching academy students:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch students',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}