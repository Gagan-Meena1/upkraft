import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import courseName from "@/models/courseName";
import Class from "@/models/Class";

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
    const academy = await User.findById(academyId);
    if (!academy || academy.category !== "Academic") {
      return NextResponse.json({ error: "Only academies can access this endpoint" }, { status: 403 });
    }

    // Get all tutors
    const tutors = await User.find({
      category: "Tutor",
      academyId: academyId
    }).select("-password").lean();

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
    const studentCounts = await User.aggregate([
      {
        $match: {
          category: "Student",
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
    }).lean();

    // Group courses by tutor
    const coursesByTutor = new Map<string, any[]>();
    tutorCourses.forEach(course => {
      const tutorId = course.academyInstructorId.toString();
      if (!coursesByTutor.has(tutorId)) {
        coursesByTutor.set(tutorId, []);
      }
      coursesByTutor.get(tutorId)!.push(course);
    });

    // 3. Get all class IDs from courses
    const allClassIds = tutorCourses.reduce((acc: any[], course: any) => {
      return acc.concat(course.class || []);
    }, []);

    // 4. Get all classes with CSAT in one query
    const allClasses = await Class.find({
      _id: { $in: allClassIds }
    }).select("csat").lean();

    // Create a map of classId -> class for quick lookup
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

    // ========================================
    // NOW PROCESS TUTORS WITH CACHED DATA
    // ========================================

    const tutorsWithStats = tutors.map((tutor) => {
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

      // Calculate revenue from cached enrollment data
      let revenue = 0;
      courses.forEach(course => {
        const enrolledCount = enrollmentMap.get(course._id.toString()) || 0;
        revenue += (course.price || 0) * enrolledCount;
      });

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