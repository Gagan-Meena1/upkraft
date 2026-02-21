import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import courseName from "@/models/courseName";
import Class from "@/models/Class";

export async function GET(request: NextRequest) {
  try {
    await connect();
    console.log("Fetching user...");

    // Get token from cookies
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    if (!token) return NextResponse.json({ error: "No token found" }, { status: 401 });

    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.id;
    console.log("User ID:", userId);

    // Find user and populate courses
    const user = await User.findOne({ _id: userId }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the courses the user is enrolled in
    const courses = await courseName.find({ _id: { $in: user.courses } });
    console.log("User courses:", courses.length);

    // Collect instructor IDs from multiple sources
    const instructorIdsFromCourses = courses.map(course => course.instructorId);
    const instructorIdsFromUser = user.instructorId || [];

    // Combine and get unique instructor IDs
    const allInstructorIds = [...instructorIdsFromCourses, ...instructorIdsFromUser];
    const uniqueInstructorIds = [...new Set(allInstructorIds.map(id => id.toString()))];

    console.log("Instructor IDs from courses:", instructorIdsFromCourses.length);
    console.log("Instructor IDs from user:", instructorIdsFromUser.length);
    console.log("Unique Instructor IDs:", uniqueInstructorIds.length);

    // Find all unique tutors based on the combined instructor IDs
    const tutors = await User.find({
      _id: { $in: uniqueInstructorIds }
    }).select("username email contact _id profileImage city skills experience education studentsCoached teachingMode instagramLink aboutMyself");

    // Extract all class IDs from the user's courses
    const classIds = courses.reduce((acc, course) => {
      return acc.concat(course.class);
    }, []);

    // Find classes that belong to the user's courses
    const classDetails = await Class.find({
      _id: { $in: classIds }
    }).sort({ startTime: 1 });

    console.log("Unique tutors found:", tutors.length);
    console.log("Classes found:", classDetails.length);

    return NextResponse.json({
      success: true,
      message: "Fetched tutors and classes successfully",
      tutors,
      classDetails,
      courses,
    
    });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}