import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import courseName from "@/models/courseName";
import Class from "@/models/Class";
import feedback from "@/models/feedback";
import feedbackDance from "@/models/feedbackDance";
import feedbackDrawing from "@/models/feedbackDrawing";
import Payment from "@/models/payment";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connect();

    // Get academy user from token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const decodedToken = jwt.decode(token);
    const academyId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
    if (!academyId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify the user is an Academy
    const academy = await User.findById(academyId)
      .populate({
        path: 'tutors',
        select: '-password'
      })
      .lean();

    if (!academy || academy.category !== "Academic") {
      return NextResponse.json({ error: "Only academies can access this endpoint" }, { status: 403 });
    }

    const tutors = academy.tutors || [];

    if (tutors.length === 0) {
      return NextResponse.json({
        success: true,
        tutors: [],
        total: 0
      });
    }

    const tutorIds = tutors.map(t => t._id);

    // ========================================
    // PARALLEL BATCH QUERIES
    // ========================================

    const [
      studentCounts,
      tutorCourses,
      revenueByTutor,
      allStudents,
      tutorsWithUserCourses
    ] = await Promise.all([
      // 1. Student counts
      User.aggregate([
        {
          $match: {
            category: "Student",
            instructorId: { $in: tutorIds }
          }
        },
        {
          $unwind: "$instructorId"
        },
        {
          $match: {
            instructorId: { $in: tutorIds }
          }
        },
        {
          $group: {
            _id: "$instructorId",
            count: { $sum: 1 }
          }
        }
      ]),

      // 2. Tutor courses
      courseName.find({
        academyInstructorId: { $in: tutorIds }
      }).select("_id title category class courseQuality performanceScores academyInstructorId price").lean(),

      // 3. Revenue
      Payment.aggregate([
        {
          $match: {
            academyId: new mongoose.Types.ObjectId(academyId),
            tutorId: { $in: tutorIds },
            status: "Paid"
          }
        },
        {
          $group: {
            _id: "$tutorId",
            totalRevenue: { $sum: "$amount" }
          }
        }
      ]),

      // 4. All students (for pending feedback)
      User.find({
        category: "Student",
        instructorId: { $in: tutorIds }
      }).select("_id courses instructorId").lean(),

      // 5. Tutors with their courses
      User.find({
        _id: { $in: tutorIds }
      }).select("_id courses").lean()
    ]);

    // Create maps
    const studentCountMap = new Map(studentCounts.map(sc => [sc._id.toString(), sc.count]));
    const revenueMap = new Map(revenueByTutor.map(r => [r._id?.toString() || "", r.totalRevenue]));

    // Group courses by tutor and build courseDetailsMap from same data (avoids duplicate fetch)
    const coursesByTutor = new Map<string, any[]>();
    const courseDetailsMap = new Map<string, any>();
    tutorCourses.forEach(course => {
      courseDetailsMap.set(course._id.toString(), course);
      if (course.academyInstructorId && Array.isArray(course.academyInstructorId)) {
        course.academyInstructorId.forEach((tutorId: any) => {
          const tutorIdStr = tutorId.toString();
          if (!coursesByTutor.has(tutorIdStr)) {
            coursesByTutor.set(tutorIdStr, []);
          }
          coursesByTutor.get(tutorIdStr)!.push(course);
        });
      }
    });

    // Get all class IDs (only for CSAT fetch - we do NOT load full class docs for pending feedback)
    const allClassIds = tutorCourses.reduce((acc: any[], course: any) => {
      return acc.concat(course.class || []);
    }, []);

    // Get only CSAT data from classes (minimal fields)
    const allClasses = await Class.find({
      _id: { $in: allClassIds }
    }).select("csat").lean();

    const classMap = new Map(allClasses.map(cls => [cls._id.toString(), cls]));

    // ========================================
    // OPTIMIZED PENDING FEEDBACK CALCULATION
    // ========================================

    // Create tutor courses map (from user's courses field)
    const tutorCoursesMap = new Map<string, string[]>();
    tutorsWithUserCourses.forEach(tutor => {
      const tutorIdStr = tutor._id.toString();
      const courseIds = (tutor.courses || []).map((id: any) => id.toString());
      tutorCoursesMap.set(tutorIdStr, courseIds);
    });

    // Group students by tutor
    const studentsByTutor = new Map<string, any[]>();
    allStudents.forEach(student => {
      const studentInstructorIds = (student.instructorId || []).map((id: any) => id.toString());
      tutorIds.forEach(tutorId => {
        const tutorIdStr = tutorId.toString();
        if (studentInstructorIds.includes(tutorIdStr)) {
          if (!studentsByTutor.has(tutorIdStr)) {
            studentsByTutor.set(tutorIdStr, []);
          }
          studentsByTutor.get(tutorIdStr)!.push(student);
        }
      });
    });

    // **KEY OPTIMIZATION**: Batch fetch ALL feedback records at once
    const allStudentIds = allStudents.map(s => s._id);
    const uniqueClassIds = [...new Set(allClassIds.map((id: any) => id.toString()))];
    const allClassIdsForFeedback = uniqueClassIds.map(id => new mongoose.Types.ObjectId(id));

    const [musicFeedbacks, danceFeedbacks, drawingFeedbacks] = await Promise.all([
      feedback.find({
        userId: { $in: allStudentIds },
        classId: { $in: allClassIdsForFeedback }
      }).select("userId classId").lean(),
      
      feedbackDance.find({
        userId: { $in: allStudentIds },
        classId: { $in: allClassIdsForFeedback }
      }).select("userId classId").lean(),
      
      feedbackDrawing.find({
        userId: { $in: allStudentIds },
        classId: { $in: allClassIdsForFeedback }
      }).select("userId classId").lean()
    ]);

    // Create feedback lookup sets for O(1) checking
    const feedbackSets = {
      Music: new Set(musicFeedbacks.map(f => `${f.userId}_${f.classId}`)),
      Dance: new Set(danceFeedbacks.map(f => `${f.userId}_${f.classId}`)),
      Drawing: new Set(drawingFeedbacks.map(f => `${f.userId}_${f.classId}`))
    };

    // ========================================
    // PROCESS TUTORS WITH CACHED DATA
    // ========================================

    const tutorsWithStats = tutors.map((tutor) => {
      const tutorIdStr = tutor._id.toString();
      
      // Get student count
      const studentCount = studentCountMap.get(tutorIdStr) || 0;

      // Get tutor's courses
      const courses = coursesByTutor.get(tutorIdStr) || [];

      // Get class IDs
      const classIds = courses.reduce((acc: any[], course: any) => {
        return acc.concat(course.class || []);
      }, []);

      const classCount = classIds.length;

      // Calculate CSAT
      let csatScore = 0;
      let csatCount = 0;
      
      classIds.forEach((classId: any) => {
        const cls = classMap.get(classId.toString());
        if (cls && cls.csat && Array.isArray(cls.csat) && cls.csat.length > 0) {
          const ratings = cls.csat.map((c: any) => c.rating).filter((r: any) => r && r > 0);
          if (ratings.length > 0) {
            const avgRating = ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length;
            csatScore += avgRating;
            csatCount++;
          }
        }
      });

      const averageCSAT = csatCount > 0 ? Math.round((csatScore / csatCount) * 20) : 0;

      // Get revenue
      const revenue = revenueMap.get(tutorIdStr) || 0;

      // Calculate Class Quality Score
      let totalCourseQuality = 0;
      let coursesWithQuality = 0;
      courses.forEach(course => {
        if (course.courseQuality != null && course.courseQuality > 0) {
          totalCourseQuality += course.courseQuality;
          coursesWithQuality++;
        }
      });
      const classQualityScore = coursesWithQuality > 0 
        ? Math.round((totalCourseQuality / coursesWithQuality) * 10) / 10 
        : 0;

      // Calculate Overall Performance Score
      let totalPerformanceScore = 0;
      let performanceScoreCount = 0;
      courses.forEach(course => {
        if (course.performanceScores && Array.isArray(course.performanceScores) && course.performanceScores.length > 0) {
          course.performanceScores.forEach((perfScore: any) => {
            if (perfScore.score != null) {
              totalPerformanceScore += perfScore.score;
              performanceScoreCount++;
            }
          });
        }
      });
      const overallPerformanceScore = performanceScoreCount > 0 
        ? Math.round((totalPerformanceScore / performanceScoreCount) * 10) / 10 
        : 0;

      // **OPTIMIZED** Pending Feedback Count - NO DATABASE QUERIES IN LOOP
      let pendingFeedbackCount = 0;
      const tutorStudents = studentsByTutor.get(tutorIdStr) || [];
      const tutorCourseIds = tutorCoursesMap.get(tutorIdStr) || [];
      
      if (tutorStudents.length > 0 && tutorCourseIds.length > 0) {
        for (const student of tutorStudents) {
          const studentCourseIds = (student.courses || []).map((id: any) => id.toString());
          const commonCourseIds = tutorCourseIds.filter(courseId => 
            studentCourseIds.includes(courseId)
          );

          if (commonCourseIds.length === 0) continue;

          for (const courseId of commonCourseIds) {
            const course = courseDetailsMap.get(courseId);
            if (!course) continue;

            const classIds = course.class || [];
            if (classIds.length === 0) continue;

            for (const classId of classIds) {
              // Check appropriate feedback set based on category (no need to load full class doc)
              const feedbackSet = feedbackSets[course.category as keyof typeof feedbackSets];
              if (!feedbackSet) continue;

              const feedbackKey = `${student._id}_${classId.toString()}`;
              if (!feedbackSet.has(feedbackKey)) {
                pendingFeedbackCount++;
              }
            }
          }
        }
      }

      // Return slim tutorCourses (no class arrays) to reduce payload size dramatically
      const tutorCoursesSlim = courses.map((c: any) => ({
        _id: c._id,
        title: c.title,
        category: c.category,
        academyInstructorId: c.academyInstructorId,
        price: c.price,
        performanceScores: c.performanceScores,
        classCount: (c.class || []).length
      }));

      return {
        _id: tutor._id,
        username: tutor.username,
        email: tutor.email,
        profileImage: tutor.profileImage || "",
        skills: tutor.skills || "",
        studentCount,
        classCount,
        csatScore: averageCSAT,
        revenue: revenue,
        isVerified: tutor.isVerified || false,
        createdAt: tutor.createdAt,
        tutorCourses: tutorCoursesSlim,
        classQualityScore,
        overallPerformanceScore,
        pendingFeedbackCount
      };
    });

    return NextResponse.json({
      success: true,
      tutors: tutorsWithStats,
      total: tutorsWithStats.length
    });

  } catch (error: any) {
    console.error("Error fetching academy tutors:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}