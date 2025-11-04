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

    // Find all tutors where this academy is in their instructorId array
    const tutors = await User.find({
      category: "Tutor",
      instructorId: academyId
    }).select("-password").lean();

    // For each tutor, calculate additional stats
    const tutorsWithStats = await Promise.all(
      tutors.map(async (tutor) => {
        // Count students for this tutor
        const studentCount = await User.countDocuments({
          category: "Student",
          instructorId: tutor._id
        });

        // Get tutor's courses
        const tutorCourses = await courseName.find({
          instructorId: tutor._id
        }).lean();

        // Count total classes for this tutor
        const classIds = tutorCourses.reduce((acc: any[], course: any) => {
          return acc.concat(course.class || []);
        }, []);

        const classCount = await Class.countDocuments({
          _id: { $in: classIds }
        });

        // Calculate CSAT score (average from classes)
        const classes = await Class.find({
          _id: { $in: classIds }
        }).select("csat").lean();

        let csatScore = 0;
        let csatCount = 0;
        
        classes.forEach((cls: any) => {
          if (cls.csat && Array.isArray(cls.csat) && cls.csat.length > 0) {
            const ratings = cls.csat.map((c: any) => c.rating).filter((r: any) => r && r > 0);
            if (ratings.length > 0) {
              const avgRating = ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length;
              csatScore += avgRating;
              csatCount++;
            }
          }
        });

        // Convert CSAT to percentage (assuming ratings are 1-5 scale)
        const averageCSAT = csatCount > 0 ? Math.round((csatScore / csatCount) * 20) : 0;

        // Calculate revenue (sum of course prices multiplied by student enrollments)
        let revenue = 0;
        for (const course of tutorCourses) {
          const enrolledStudents = await User.countDocuments({
            category: "Student",
            courses: course._id
          });
          revenue += (course.price || 0) * enrolledStudents;
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
        };
      })
    );

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

