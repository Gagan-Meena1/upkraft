import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";  // Ensure jwt is imported
import courseName from "@/models/courseName";
import Class from "@/models/Class";

export async function GET(request:NextRequest) {
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
    console.log("User ID:", userId);

    // Fix database query - Ensure user is found
    const user = await User.findOne({ _id: userId }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const courses = await courseName.find({ _id: { $in: user.courses } });
     // Extract instructor IDs from courses
     const instructorIds = courses.map(course => course.instructorId);
     console.log("Instructor IDs:", instructorIds);
  // Find all instructors based on the extracted IDs
  const tutors = await User.find({ 
    _id: { $in: instructorIds } 
  }).select("username email contact _id");


  const classDetails = await Class.find({
    instructor: { $in: instructorIds },
 
  })
  .sort({ startTime: 1 })

    console.log("Tutors found:", tutors.length);
    user.age?user.age=user.age:user.age=18;
    user.address?user.address=user.address:user.address="";
    user.contact?user.contact=user.contact:user.contact="";

    
    // console.log("user : ",classDetails);
    // console.log("courses : ",courseDetails);
    return NextResponse.json({
        success: true,
        message: `Fetched tutors successfully`,
        tutors,
        classDetails
      });   
  } catch (error:any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
