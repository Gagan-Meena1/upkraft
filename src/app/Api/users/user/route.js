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
    if (!token) return NextResponse.json({ error: "No token found" }, { status: 401 });

    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.id;

    // Find user
    const user = await User.findOne({ _id: userId }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get course details for the user's enrolled courses
    const courseDetails = await courseName.find({ _id: { $in: user.courses } });
    
    // EXTRA: Create a map of course ID to course name for easy access
    const courseTitleMap = {};
    courseDetails.forEach(course => {
      courseTitleMap[course._id.toString()] = {
        title: course.title,
        category: course.category,
        description: course.description,
        duration: course.duration,
        price: course.price,
        curriculum: course.curriculum
      };
    });

    // Extract all class IDs from the courses
    const classIds = courseDetails.reduce((acc, course) => {
      return acc.concat(course.class || []);
    }, []);

    // Find class details using the extracted class IDs
    const classDetails = await Class.find({ _id: { $in: classIds } });

    // Count students who have this user as their instructor
    const studentCount = await User.countDocuments({
      instructorId: userId,
      category: "Student"
    });

    return NextResponse.json({
      success: true,
      message: "Sent user successfully",
      user,
      courseDetails,
      classDetails,
      studentCount,
      courseTitleMap
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}