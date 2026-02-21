import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import feedbackDrums from '@/models/feedbackDrums';
import jwt from 'jsonwebtoken';
import courseName from '@/models/courseName';
import User from '@/models/userModel';
import { sendEmail } from '@/helper/mailer';
// import { getServerSession } from 'next-auth/next'; // If using next-auth

await connect();

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const classId = url.searchParams.get("classId");
    const courseId = url.searchParams.get("courseId");
    const studentId = url.searchParams.get("studentId");

    if (!classId || !courseId || !studentId) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }

    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId = decodedToken && typeof decodedToken === "object" && "id" in decodedToken ? decodedToken.id : null;

    const data = await request.json();

    const {
      techniqueAndFundamentals,
      timingAndTempo,
      coordinationAndIndependence,
      dynamicsAndMusicality,
      patternKnowledgeAndReading,
      progressAndPracticeHabits,
      personalFeedback,
      naFields = [],
      attendanceStatus,
    } = data;

    const user = await User.findById(studentId);
    if (!user) return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });

    const attendanceIndex = user.attendance.findIndex((att) => att.classId.toString() === classId);
    if (attendanceIndex !== -1) user.attendance[attendanceIndex].status = attendanceStatus;
    else user.attendance.push({ classId: classId, status: attendanceStatus });
    await user.save();

    const KEYS = [
      "techniqueAndFundamentals",
      "timingAndTempo",
      "coordinationAndIndependence",
      "dynamicsAndMusicality",
      "patternKnowledgeAndReading",
      "progressAndPracticeHabits",
    ];

    const feedbackPayload: any = { userId: studentId, classId, personalFeedback, naFields };
    KEYS.forEach(k => { feedbackPayload[k] = naFields.includes(k) ? null : Number((data as any)[k]) || 0; });

    const newFeedback = await feedbackDrums.create(feedbackPayload);

    const updatedClass = await Class.findByIdAndUpdate(classId, { feedbackId: newFeedback._id }, { new: true });
    if (!updatedClass) return NextResponse.json({ success: false, message: "Class not found" }, { status: 404 });

    const course = await courseName.findById(courseId).populate("class");
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    const classIds = course.class.map((cls: any) => cls._id);

    const studentFeedbacks = await feedbackDrums.find({ userId: studentId, classId: { $in: classIds } });

    const usedKeys = KEYS.filter(k => !naFields.includes(k));
    let currentSum = 0, currentCount = 0;
    usedKeys.forEach(k => {
      const v = Number((data as any)[k]);
      if (!isNaN(v)) { currentSum += v; currentCount++; }
    });
    const avgScore = currentCount > 0 ? currentSum / currentCount : 0;

    let totalScores = 0, totalMetricCount = 0;
    studentFeedbacks.forEach((fb: any) => {
      const fbNa = new Set<string>(fb.naFields || []);
      KEYS.forEach(k => {
        if (fbNa.has(k)) return;
        const v = Number(fb[k]);
        if (!isNaN(v)) { totalScores += v; totalMetricCount++; }
      });
    });
    const averageScore = totalMetricCount > 0 ? totalScores / totalMetricCount : 0;

    try {
      const studentUser = await User.findById(studentId).select("email username").lean();
      if (studentUser && studentUser.email) {
        const feedbackDetails: Record<string, number | null> = {};
        KEYS.forEach(k => { feedbackDetails[k] = naFields.includes(k) ? null : (Number((data as any)[k]) || 0); });

        await sendEmail({
          email: studentUser.email,
          emailType: "FEEDBACK_RECEIVED",
          username: studentUser.username,
          courseName: (await courseName.findById(courseId).select("title"))?.title || undefined,
          className: updatedClass.title,
          personalFeedback,
          averageScore: avgScore.toFixed(1),
          classId,
          userId: studentId,
          feedbackCategory: 'Drums',
          classDate: updatedClass.startTime ? new Date(updatedClass.startTime).toLocaleDateString('en-IN') : undefined,
          feedbackDetails
        });
      }
    } catch (mailErr) {
      console.error('[studentFeedback/drums] Error sending feedback email:', mailErr);
    }

    if (course.performanceScores && Array.isArray(course.performanceScores)) {
      const idx = course.performanceScores.findIndex((s: any) => s.userId.toString() === studentId.toString());
      if (idx !== -1) {
        course.performanceScores[idx].score = averageScore;
        course.performanceScores[idx].date = new Date();
      } else {
        course.performanceScores.push({ userId: studentId, score: averageScore, date: new Date() });
      }
      await course.save();
    }

    return NextResponse.json({ success: true, message: "Drums feedback submitted", data: { feedback: newFeedback, updatedClass } }, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting Drums feedback:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to submit Drums feedback" }, { status: 500 });
  }
}
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const courseId = url.searchParams.get("courseId");
        // const studentId = url.searchParams.get("studentId");
        
        // Get token and verify instructor
        const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }
        
        const decodedToken = token ? jwt.decode(token) : null;
        const studentId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        
        if (!studentId) {
            return NextResponse.json({
                success: false,
                error: 'Invalid authentication token'
            }, { status: 401 });
        }
        
        // Validate required parameters
        if (!courseId) {
            return NextResponse.json({
                success: false,
                error: 'Course ID is required'
            }, { status: 400 });
        }
        
        // First, find all classes that belong to the specified course
        const classes = await Class.find({ course: courseId });
        
        if (!classes || classes.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No classes found for the specified course'
            }, { status: 404 });
        }
        
        // Extract class IDs
        const classIds = classes.map(cls => cls._id);
        
        // Construct query for finding feedback
        const query: any = { classId: { $in: classIds } };
        
        // Add studentId to query if provided
        if (studentId) {
            query.userId = studentId;
        }
        
        // Find feedback for all classes in the course
        const feedbackData = await feedbackDrums.find(query)
            // .populate('userId', 'username email') // Populate student details
            // .populate('classId', 'title startTime') // Populate class details
            // .lean();
            const feedbackAllStudent=await feedbackDrums.find({ classId: { $in: classIds } })
        
        return NextResponse.json({
            success: true,
            count: feedbackData.length,
            data: feedbackData,
            feedbackAllStudent:feedbackAllStudent
        }, { status: 200 });
        
    } catch (error: any) {
        console.error('Error fetching Drums feedback:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch Drums feedback',
            error: error.stack
        }, { status: 500 });
    }
}