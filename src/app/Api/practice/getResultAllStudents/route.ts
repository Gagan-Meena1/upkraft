// pages/api/practice/getTutorStudentsResults.js or app/api/practice/getTutorStudentsResults/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConnection/dbConfic';
import { PianoResult, GuitarResult } from '@/models/practiceResult';
import User from '@/models/userModel';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // Connect to database
    await connect();

    // Get tutorId from query params or JWT token
    const { searchParams } = new URL(request.url);
    let tutorId = searchParams.get('tutorId') || searchParams.get('userId');

    // Check if tutorId is null, undefined, or the string "null"
    if (!tutorId || tutorId === 'null' || tutorId === 'undefined') {
      // Get token from cookies
      const token = request.cookies.get("token")?.value;
      if (!token) {
        return NextResponse.json({ error: "No token found" }, { status: 401 });
      }
     
      const decodedToken = jwt.decode(token);
      if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
     
      tutorId = decodedToken.id;
    }

    // Final validation - ensure we have a valid tutorId
    if (!tutorId || tutorId === 'null' || tutorId === 'undefined') {
      return NextResponse.json(
        { error: 'Tutor ID is required' },
        { status: 401 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(tutorId)) {
      return NextResponse.json(
        { error: 'Invalid tutor ID format' },
        { status: 400 }
      );
    }

    // Optional: Verify the user is actually a tutor
            const tutor = await User.findById(tutorId).lean();
            // if (!tutor) {
            //   return NextResponse.json(
            //     { error: 'Tutor not found' },
            //     { status: 404 }
            //   );
            // }

    // You can add additional check for tutor role if needed
    // if (tutor.category !== 'tutor') {
    //   return NextResponse.json(
    //     { error: 'User is not a tutor' },
    //     { status: 403 }
    //   );
    // }

    // Find all students who have this tutorId in their instructorId array
    const students = await User.find({
      instructorId: tutorId
    }).select('_id username email profileImage').lean();

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No students found for this tutor',
        data: {
          students: [],
          results: []
        },
        stats: {
          totalStudents: 0,
          totalSessions: 0,
          pianoSessions: 0,
          guitarSessions: 0
        }
      });
    }

    // Get instrument filter if provided
    const instrument = searchParams.get('instrument');
    
    // Get student IDs
    const studentIds = students.map(student => student._id);

    // Fetch results for all students
    let pianoResults = [];
    let guitarResults = [];

    if (!instrument || instrument === 'piano') {
      pianoResults = await PianoResult.find({ 
        userId: { $in: studentIds } 
      })
      .sort({ createdAt: -1 })
      .lean();
    }

    if (!instrument || instrument === 'guitar') {
      guitarResults = await GuitarResult.find({ 
        userId: { $in: studentIds } 
      })
      .sort({ createdAt: -1 })
      .lean();
    }

    // Organize results by student
    const studentResults = students.map(student => {
      const studentPianoResults = pianoResults.filter(
        result => result.userId.toString() === student._id.toString()
      );
      const studentGuitarResults = guitarResults.filter(
        result => result.userId.toString() === student._id.toString()
      );

      return {
        studentId: student._id,
        studentName: student.username,
        studentEmail: student.email,
        profileImage: student.profileImage,
        results: {
          piano: studentPianoResults,
          guitar: studentGuitarResults
        },
        stats: {
          totalSessions: studentPianoResults.length + studentGuitarResults.length,
          pianoSessions: studentPianoResults.length,
          guitarSessions: studentGuitarResults.length,
          lastActivity: [...studentPianoResults, ...studentGuitarResults].length > 0
            ? [...studentPianoResults, ...studentGuitarResults].reduce((latest, current) => {
                return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
              }).createdAt
            : null
        }
      };
    });

    // Calculate overall stats
    const overallStats = {
      totalStudents: students.length,
      totalSessions: pianoResults.length + guitarResults.length,
      pianoSessions: pianoResults.length,
      guitarSessions: guitarResults.length,
      activeStudents: studentResults.filter(s => s.stats.totalSessions > 0).length,
      lastActivity: null
    };

    // Find overall last activity
    const allResults = [...pianoResults, ...guitarResults];
    if (allResults.length > 0) {
      overallStats.lastActivity = allResults.reduce((latest, current) => {
        return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
      }).createdAt;
    }

    return NextResponse.json({
      success: true,
      data: {
        tutor: {
          id: tutor._id,
          name: tutor.username,
          email: tutor.email
        },
        students: studentResults
      },
      stats: overallStats,
      category:tutor.category
    });

  } catch (error) {
    console.error('Error fetching tutor students practice results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice results', details: error.message },
      { status: 500 }
    );
  }
}