import { NextResponse } from "next/server";
import User from "@/models/userModel";
import Class from "@/models/Class";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import courseName from "@/models/courseName";

export async function GET(request) {
  try {
    await connect();
    console.log("Fetching user...");

    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.id;

    // Fetch user with lean() for better performance
    const user = await User.findOne({ _id: userId })
      .select("_id username email category profileImage courses")
      .lean();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Early return if user has no courses
    if (!user.courses || user.courses.length === 0) {
      const studentCount = await User.countDocuments({
        instructorId: userId,
        category: "Student"
      });

      return NextResponse.json({
        success: true,
        message: "Sent user successfully",
        user,
        courseDetails: [],
        classDetails: [],
        studentCount
      });
    }

    // Fetch course details and student count in parallel
    const [courseDetails, studentCount] = await Promise.all([
      courseName.find({ _id: { $in: user.courses } })
        .select("_id category class")
        .lean(),
      User.countDocuments({
        instructorId: userId,
        category: "Student"
      })
    ]);

    // Collect all class IDs from all courses
    const classIds = [];
    
    courseDetails.forEach(course => {
      // Collect class IDs from each course
      if (course.class && course.class.length > 0) {
        classIds.push(...course.class);
      }
    });

    // Fetch class details only if there are classes
    let classDetails = [];
    if (classIds.length > 0) {
      // Remove duplicates and fetch
      const uniqueClassIds = [...new Set(classIds.map(id => id.toString()))];
      classDetails = await Class.find({ _id: { $in: uniqueClassIds } })
        .lean();
    }

    return NextResponse.json({
      success: true,
      message: "Sent user successfully",
      user,
      courseDetails,
      classDetails,
      studentCount
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}