// app/Api/sessions/stats/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

await connect();

// Helper function to get query params
function getQueryParam(request: NextRequest, param: string): string | null {
  return request.nextUrl.searchParams.get(param);
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const decodedToken = token ? jwt.decode(token) : null;
    const userId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken 
      ? decodedToken.id 
      : null;

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized - Please log in again"
      }, { status: 401 });
    }

    // Get pagination params
    const page = parseInt(getQueryParam(request, 'page') || '1');
    const limit = parseInt(getQueryParam(request, 'limit') || '15');
    const skip = (page - 1) * limit;

    // Get the current user to check if they're an academy
    const currentUser = await User.findById(userId).select('category tutors students');
    
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found"
      }, { status: 404 });
    }

    // Determine which instructors to include based on user type
    let instructorIds = [userId];
    
    if (currentUser.category === 'Academic' && currentUser.tutors && currentUser.tutors.length > 0) {
      instructorIds = [...currentUser.tutors, userId];
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Fetch current month sessions for stats
    const currentMonthSessions = await Class.find({
      instructor: { $in: instructorIds },
      startTime: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    }).select('status startTime endTime csat evaluation attendance');

    // Get total count for pagination
    const totalSessions = await Class.countDocuments({
      instructor: { $in: instructorIds }
    });

    // Fetch paginated sessions
    const allSessions = await Class.find({
      instructor: { $in: instructorIds }
    })
    .populate('course', 'courseName title category')
    .populate('instructor', 'username email')
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(limit);

    // Get users for each session
    const sessionsWithUsers = await Promise.all(
      allSessions.map(async (session) => {
        const usersInClass = await User.find({
          classes: session._id
        }).select('username email category');

        const tutors = usersInClass.filter(user => user.category === 'Tutor');
        const students = usersInClass.filter(user => user.category === 'Student');

        return {
          _id: session._id,
          title: session.title,
          course: session.course,
          instructor: session.instructor,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
          recordingUrl: session.recordingUrl,
          evaluation: session.evaluation,
          tutors: tutors.map(t => ({ name: t.username, email: t.email })),
          students: students.map(s => ({ name: s.username, email: s.email }))
        };
      })
    );

    // Fetch last month's sessions for comparison
    const lastMonthSessions = await Class.find({
      instructor: { $in: instructorIds },
      startTime: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth }
    }).select('status');

    // Calculate statistics
    const totalSessionsCount = currentMonthSessions.length;
    const lastMonthTotal = lastMonthSessions.length;
    const totalSessionsChange = lastMonthTotal > 0 
      ? ((totalSessionsCount - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
      : '0.0';

    const completedSessions = currentMonthSessions.filter(s => s.status === 'completed').length;
    const scheduledSessions = currentMonthSessions.filter(
      s => s.status === 'scheduled' && new Date(s.startTime) > now
    ).length;
    const cancelledSessions = currentMonthSessions.filter(s => s.status === 'canceled').length;

    // Calculate attendance rate
    let totalAttendance = 0;
    let totalAttendanceRecords = 0;
    let lastMonthAttendance = 0;
    let lastMonthAttendanceRecords = 0;

    const completedSessionsData = currentMonthSessions.filter(s => s.status === 'completed');
    completedSessionsData.forEach(session => {
      if (session.attendance && Array.isArray(session.attendance)) {
        session.attendance.forEach(att => {
          totalAttendanceRecords++;
          if (att.status === 'present') totalAttendance++;
        });
      }
    });

    const lastMonthCompletedSessions = await Class.find({
      instructor: { $in: instructorIds },
      startTime: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth },
      status: 'completed'
    }).select('attendance');

    lastMonthCompletedSessions.forEach(session => {
      if (session.attendance && Array.isArray(session.attendance)) {
        session.attendance.forEach(att => {
          lastMonthAttendanceRecords++;
          if (att.status === 'present') lastMonthAttendance++;
        });
      }
    });

    const attendanceRate = totalAttendanceRecords > 0 
      ? ((totalAttendance / totalAttendanceRecords) * 100).toFixed(1)
      : '0.0';

    const lastMonthAttendanceRate = lastMonthAttendanceRecords > 0
      ? ((lastMonthAttendance / lastMonthAttendanceRecords) * 100)
      : 0;

    const attendanceRateChange = lastMonthAttendanceRate > 0
      ? ((parseFloat(attendanceRate) - lastMonthAttendanceRate) / lastMonthAttendanceRate * 100).toFixed(1)
      : '0.0';

    // Calculate average quality score
    let totalQualityScore = 0;
    let qualityScoreCount = 0;

    completedSessionsData.forEach(session => {
      if (session.evaluation && session.evaluation.overall_quality_score) {
        totalQualityScore += session.evaluation.overall_quality_score;
        qualityScoreCount++;
      }
    });

    const avgQualityScore = qualityScoreCount > 0
      ? (totalQualityScore / qualityScoreCount).toFixed(1)
      : '0.0';

    return NextResponse.json({
      success: true,
      stats: {
        totalSessions: totalSessionsCount,
        totalSessionsChange: parseFloat(totalSessionsChange),
        completedSessions,
        scheduledSessions,
        cancelledSessions,
        attendanceRate: parseFloat(attendanceRate),
        attendanceRateChange: parseFloat(attendanceRateChange),
        avgQualityScore: parseFloat(avgQualityScore)
      },
      classData: sessionsWithUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
        limit
      }
    });

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch session statistics'
    }, { status: 500 });
  }
}