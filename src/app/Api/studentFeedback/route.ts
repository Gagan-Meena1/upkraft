import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import feedback from '@/models/feedback';
import jwt from 'jsonwebtoken'
import courseName from '@/models/courseName';
import User  from '@/models/userModel';
import {sendEmail} from '@/helper/mailer';

await connect();

export async function POST(request: NextRequest) {
    try {
      const url = new URL(request.url);
      const classId = url.searchParams.get("classId");
      const courseId = url.searchParams.get("courseId");
      const studentId = url.searchParams.get("studentId");
             
      // Validate IDs
      if (!classId || !courseId || !studentId) {
        return NextResponse.json({
           success: false,
           error: 'Missing required parameters'
         }, { status: 400 });
      }
             
      // Get token and instructor ID
      const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
      const decodedToken = token ? jwt.decode(token) : null;
      const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
             
      // Parse JSON body instead of FormData
      const data = await request.json();
             
      // Extract fields from JSON
      const {
        rhythm,
        theoreticalUnderstanding,
        performance,
        earTraining,
        assignment,
        technique,
        personalFeedback,
        naFields = [],
        attendanceStatus,
      } = data;

      const user= await User.findById(studentId);
     // Check if attendance record exists for this class
    const attendanceIndex = user.attendance.findIndex(
      (att) => att.classId.toString() === classId
    );

    if (attendanceIndex !== -1) {
      // Update existing attendance record
      user.attendance[attendanceIndex].status = attendanceStatus;
    } else {
      // Create new attendance record
      user.attendance.push({
        classId: classId,
        status: attendanceStatus
      });
    }

    // Save the updated user
    await user.save();
             
      // Prevent duplicate feedback for the same student + class
      const existing = await feedback.findOne({ userId: studentId, classId });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Feedback already submitted for this student and class' },
          { status: 409 }
        );
      }

      // Create feedback document
      const feedbackData = {
        userId: studentId,
        classId: classId,
        rhythm: Number(rhythm),
        theoreticalUnderstanding: Number(theoreticalUnderstanding),
        performance: Number(performance),
        earTraining: Number(earTraining),
        assignment: Number(assignment),
        technique: Number(technique),
        personalFeedback,
        naFields
      };

      const newFeedback = await feedback.create(feedbackData);
      
      // Update the Class document with the feedback ID
      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        { feedbackId: newFeedback._id },
        { new: true } // Return the updated document
      );

      if (!updatedClass) {
        return NextResponse.json({
          success: false,
          message: 'Class not found'
        }, { status: 404 });
      }

      const course = await courseName.findById(courseId).populate('class');
      
      if (!course) {
        return NextResponse.json({
          success: false,
          message: 'Course not found'
        }, { status: 404 });
      }

      // Step 2: Get all class IDs for this course
      const classIds = course.class.map((cls: any) => cls._id);

      // Step 3: Get all feedbacks for this student across all classes in this course
      const studentFeedbacks = await feedback.find({
        userId: studentId,
        classId: { $in: classIds }
      });

      const MUSIC_METRIC_KEYS = [
  "rhythm",
  "theoreticalUnderstanding",
  "performance",
  "earTraining",
  "assignment",
  "technique",
] as const;
    // Step 4: Calculate average score
      if (studentFeedbacks.length > 0) {
        // Average for THIS submission, excluding NA fields
        const usedKeys = MUSIC_METRIC_KEYS.filter(key => !naFields.includes(key));
        let currentSum = 0;
        let currentCount = 0;
        usedKeys.forEach((key) => {
          const v = Number((data as any)[key]);
          if (!isNaN(v)) {
            currentSum += v;
            currentCount++;
          }
        });
        const avgScore = currentCount > 0 ? currentSum / currentCount : 0;

        // Step 4: Calculate average score (course‑level), excluding NA fields
        let totalScores = 0;
        let totalMetricCount = 0;

        studentFeedbacks.forEach((fb: any) => {
          const fbNa = new Set<string>(fb.naFields || []);
          MUSIC_METRIC_KEYS.forEach((key) => {
            if (fbNa.has(key)) return;
            const v = Number(fb[key]);
            if (!isNaN(v)) {
              totalScores += v;
              totalMetricCount++;
            }
          });
        });

        const averageScore = totalMetricCount > 0 ? totalScores / totalMetricCount : 0;

        // Send notification email to the student
        try {
          const studentUser = await User.findById(studentId).select('email username').lean();
          if (studentUser && studentUser.email) {
            await sendEmail({
              email: studentUser.email,
              emailType: "FEEDBACK_RECEIVED",
              username: studentUser.username,
              courseName: (await courseName.findById(courseId).select('title'))?.title || undefined,
              className: updatedClass.title,
              personalFeedback: personalFeedback,
              averageScore: avgScore.toFixed(1),
              classId:classId,
              userId:studentId,
              feedbackCategory: 'Music',
              classDate: updatedClass.startTime ? new Date(updatedClass.startTime).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : undefined,
              feedbackDetails: {
                rhythm: Number(rhythm),
                theoreticalUnderstanding: Number(theoreticalUnderstanding),
                performance: Number(performance),
                earTraining: Number(earTraining),
                assignment: Number(assignment),
                technique: Number(technique)
              }
            });
          }
        } catch (mailErr) {
          console.error('[studentFeedback] Error sending feedback email:', mailErr);
        }
      
        // Step 5: Update or add the performance score in the course
        const existingScoreIndex = course.performanceScores.findIndex(
          (score: any) => score.userId.toString() === studentId.toString()
        );

        if (existingScoreIndex !== -1) {
          // Update existing score
          course.performanceScores[existingScoreIndex].score = averageScore;
          course.performanceScores[existingScoreIndex].date = new Date();
        } else {
          // Add new score
          course.performanceScores.push({
            userId: studentId,
            score: averageScore,
            date: new Date()
          });
        }

        await course.save();
      }
      return NextResponse.json({
        success: true,
        message: 'Feedback submitted successfully and class updated',
        data: {
          feedback: newFeedback,
          updatedClass: updatedClass
        }
      }, { status: 201 });
           
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      return NextResponse.json({
        success: false,
        message: error.message || 'Failed to submit feedback',
        error: error.stack
      }, { status: 500 });
    }
}
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const courseId = url.searchParams.get("courseId");
        // Extra query params used by mobile app for multi-mode fetching:
        // ?classId=&forClass=true  → all feedback for a class (tutor Students tab)
        // ?studentId=              → all feedback for a student (tutor profile modal)
        const classId = url.searchParams.get("classId");
        const forClass = url.searchParams.get("forClass");
        const queryStudentId = url.searchParams.get("studentId");

        // Priority 1: impersonation token (RSM acting as tutor — web only)
        // Priority 2: session cookie (web browser)
        // Priority 3: Bearer token in Authorization header (React Native mobile app)
        const referer = request.headers.get("referer") || "";
        let refererPath = "";
        try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
        const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
        const impersonateToken = request.cookies.get("impersonate_token")?.value;
        const authHeader = request.headers.get("Authorization") || "";
        const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        const token = (isTutorContext && impersonateToken)
            ? impersonateToken
            : (request.cookies.get("token")?.value || bearerToken || "");
        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }

        const decodedToken = token ? jwt.decode(token) : null;
        const authUserId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;

        if (!authUserId) {
            return NextResponse.json({
                success: false,
                error: 'Invalid authentication token'
            }, { status: 401 });
        }

        // Mode 2: ?classId={id}&forClass=true → all feedback for a class (tutor Students tab)
        if (forClass && classId) {
            const feedbackRecords = await feedback.find({ classId }).lean();
            return NextResponse.json({ success: true, data: feedbackRecords }, { status: 200 });
        }

        // Mode 3: ?studentId={id} → all feedback records for a given student (tutor profile modal)
        if (queryStudentId) {
            const feedbackRecords = await feedback.find({ userId: queryStudentId })
                .populate('classId', 'title startTime')
                .lean();
            return NextResponse.json({ success: true, data: feedbackRecords }, { status: 200 });
        }

        // Mode 4: no params → all feedback for the authenticated student (student profile)
        if (!courseId) {
            const myFeedbacks = await feedback.find({ userId: authUserId })
                .populate('classId', 'title startTime course')
                .lean();
            return NextResponse.json({ success: true, data: myFeedbacks }, { status: 200 });
        }

        // Mode 1 (existing): ?courseId={id} → student's own feedback for a course
        const classes = await Class.find({ course: courseId });

        if (!classes || classes.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No classes found for the specified course'
            }, { status: 404 });
        }

        const classIds = classes.map(cls => cls._id);
        const query: any = { classId: { $in: classIds }, userId: authUserId };

        const feedbackData = await feedback.find(query);
        const feedbackAllStudent = await feedback.find({ classId: { $in: classIds } });

        return NextResponse.json({
            success: true,
            count: feedbackData.length,
            data: feedbackData,
            feedbackAllStudent: feedbackAllStudent
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch feedback',
            error: error.stack
        }, { status: 500 });
    }
}