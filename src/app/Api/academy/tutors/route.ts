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
      .lean();    if (!academy || academy.category !== "Academic") {
      return NextResponse.json({ error: "Only academies can access this endpoint" }, { status: 403 });
    }
    const tutors = academy.tutors || [];

    // Get all tutors
    // const tutors = await User.find({
    //   category: "Tutor",
    //   academyId: academyId
    // }).select("-password").lean();

    if (tutors.length === 0) {
      return NextResponse.json({
        success: true,
        tutors: [],
        total: 0
      });
    }

    const tutorIds = tutors.map(t => t._id);

    // ========================================
    // BATCH ALL QUERIES INSTEAD OF LOOPING
    // ========================================

    // 1. Get all student counts in one query using aggregation
    // Since instructorId is an array, we need to unwind it first
    const studentCounts = await User.aggregate([
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
    ]);
    const studentCountMap = new Map(studentCounts.map(sc => [sc._id.toString(), sc.count]));

    // 2. Get all courses for these tutors in one query
    const tutorCourses = await courseName.find({
      academyInstructorId: { $in: tutorIds }
    }).select("_id title category class courseQuality performanceScores academyInstructorId price").lean();

    // Group courses by tutor
   // Group courses by tutor
const coursesByTutor = new Map<string, any[]>();
tutorCourses.forEach(course => {
  // academyInstructorId is an array, so iterate through it
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

    // 3. Get all class IDs from courses
    const allClassIds = tutorCourses.reduce((acc: any[], course: any) => {
      return acc.concat(course.class || []);
    }, []);

    // 4. Get all classes with CSAT in one query
    const allClasses = await Class.find({
      _id: { $in: allClassIds }
    }).select("csat").lean();

    // Create a map of classId -> class for quick lookup (CSAT only)
    const classMap = new Map(allClasses.map(cls => [cls._id.toString(), cls]));

    // 5. Get enrolled student counts per course in one aggregation
    const enrollmentCounts = await User.aggregate([
      {
        $match: {
          category: "Student",
          academyId: academyId,
          courses: { $in: tutorCourses.map(c => c._id) }
        }
      },
      {
        $unwind: "$courses"
      },
      {
        $group: {
          _id: "$courses",
          count: { $sum: 1 }
        }
      }
    ]);
    const enrollmentMap = new Map(enrollmentCounts.map(ec => [ec._id.toString(), ec.count]));

    // 6. Get all revenue from Payment model aggregated by tutorId
    const academyObjectId = new mongoose.Types.ObjectId(academyId);
    const revenueByTutor = await Payment.aggregate([
      {
        $match: {
          academyId: academyObjectId,
          tutorId: { $in: tutorIds },
          status: "Paid" // Only count paid transactions
        }
      },
      {
        $group: {
          _id: "$tutorId",
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);
    const revenueMap = new Map(revenueByTutor.map(r => [r._id?.toString() || "", r.totalRevenue]));

    // ========================================
    // NOW PROCESS TUTORS WITH CACHED DATA
    // ========================================

    // Get all students for all tutors to calculate pending feedback
    // Note: instructorId is an array, so we need to check if any tutorId is in the array
    const allStudents = await User.find({
      category: "Student",
      instructorId: { $in: tutorIds }
    }).select("_id courses instructorId").lean();

    // Create a map of tutorId -> students
    // Since instructorId is an array, we need to check each tutorId in the array
    const studentsByTutor = new Map<string, any[]>();
    allStudents.forEach(student => {
      const studentInstructorIds = (student.instructorId || []).map((id: any) => id.toString());
      // Add this student to each tutor's list if the tutor is in the student's instructorId array
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

    // Get all tutors with their courses from User model (for pending feedback calculation)
    const tutorsWithUserCourses = await User.find({
      _id: { $in: tutorIds }
    }).select("_id courses").lean();
    
    const tutorCoursesMap = new Map<string, string[]>();
    tutorsWithUserCourses.forEach(tutor => {
      const tutorIdStr = tutor._id.toString();
      const courseIds = (tutor.courses || []).map((id: any) => id.toString());
      tutorCoursesMap.set(tutorIdStr, courseIds);
    });

    // Get all course details for tutors' courses
    const allTutorCourseIds = Array.from(tutorCoursesMap.values()).flat();
    const allTutorCoursesDetails = await courseName.find({
      _id: { $in: allTutorCourseIds }
    }).select("_id title category class").lean();
    
    const courseDetailsMap = new Map<string, any>();
    allTutorCoursesDetails.forEach(course => {
      courseDetailsMap.set(course._id.toString(), course);
    });

    // Get all class IDs from tutor's courses (from User model)
    const allTutorClassIds = allTutorCoursesDetails.reduce((acc: any[], course: any) => {
      return acc.concat(course.class || []);
    }, []);

    // Get all classes with full details for pending feedback calculation
    const allTutorClassesFull = await Class.find({
      _id: { $in: allTutorClassIds }
    }).lean();

    // Create a map of classId -> full class for pending feedback
    const classMapFull = new Map(allTutorClassesFull.map(cls => [cls._id.toString(), cls]));

    const tutorsWithStats = await Promise.all(tutors.map(async (tutor) => {
      const tutorIdStr = tutor._id.toString();
      
      // Get student count from map
      const studentCount = studentCountMap.get(tutorIdStr) || 0;

      // Get tutor's courses from map
      const courses = coursesByTutor.get(tutorIdStr) || [];

      // Get class IDs for this tutor
      const classIds = courses.reduce((acc: any[], course: any) => {
        return acc.concat(course.class || []);
      }, []);

      // Count classes
      const classCount = classIds.length;

      // Calculate CSAT from cached classes
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

      // Calculate revenue from actual Payment records
      const revenue = revenueMap.get(tutorIdStr) || 0;

      // Calculate Class Quality Score (average of courseQuality from all courses)
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

      // Calculate Overall Performance Score (average of all performanceScores from all courses)
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

      // Calculate Pending Feedback Count (matching pendingFeedback API logic exactly)
      let pendingFeedbackCount = 0;
      const tutorStudents = studentsByTutor.get(tutorIdStr) || [];
      
      // Get tutor's courses from User model (not from academyInstructorId)
      const tutorCourseIds = tutorCoursesMap.get(tutorIdStr) || [];
      
      if (tutorStudents.length > 0 && tutorCourseIds.length > 0) {
        // Process each student (matching pendingFeedback API logic exactly)
        for (const student of tutorStudents) {
          const studentCourseIds = (student.courses || []).map((id: any) => id.toString());
          
          // Find common courses between tutor and student
          const commonCourseIds = tutorCourseIds.filter(courseId => 
            studentCourseIds.includes(courseId)
          );

          if (commonCourseIds.length === 0) continue;

          // Get course details for common courses (fetch fresh to ensure we have all data)
          const commonCourses = await courseName.find({
            _id: { $in: commonCourseIds }
          });

          // Process each common course
          for (const course of commonCourses) {
            const classIds = course.class || [];
            
            if (classIds.length === 0) continue;

            // Get class details (fetch fresh like pendingFeedback API does)
            const classes = await Class.find({ _id: { $in: classIds } });

            // Check feedback for each class based on course category
            for (const classItem of classes) {
              let FeedbackModel;
              
              // Select appropriate feedback model based on course category
              if (course.category === "Music") {
                FeedbackModel = feedback;
              } else if (course.category === "Dance") {
                FeedbackModel = feedbackDance;
              } else if (course.category === "Drawing") {
                FeedbackModel = feedbackDrawing;
              } else {
                continue; // Skip if category doesn't match
              }

              // Check if feedback exists for this student and class
              // Ensure ObjectIds are properly handled (Mongoose will convert strings to ObjectIds automatically)
              const existingFeedback = await FeedbackModel.findOne({
                userId: student._id,
                classId: classItem._id
              }).lean();

              if (!existingFeedback) {
                // Feedback not found - increment count
                pendingFeedbackCount++;
              }
            }
          }
        }
      }

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
        tutorCourses: courses,
        classQualityScore,
        overallPerformanceScore,
        pendingFeedbackCount
      };
    }));

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