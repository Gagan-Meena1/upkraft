import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import Class from "@/models/Class";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";  // Ensure jwt is imported
import courseName from "@/models/courseName";

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
    // console.log("User ID:", userId);
    // console.log("User ID:", request);


    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");

    // Fix database query - Ensure user is found
    const user = await User.findOne({ _id: userId }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const courseDetails = await courseName.findById(courseId);
    const courses = await courseName.findById(courseId);
    const classIds = courses.class;
    const classDetails = await Class.find({ _id: { $in: classIds } });
    console.log("1111111111111111111111111111111111111111111111111111111111111111111111111111111");
    
    console.log("classDetails : ",classDetails);
    
    user.age?user.age=user.age:user.age=18;
    user.address?user.address=user.address:user.address="";
    user.contact?user.contact=user.contact:user.contact="";

    
    console.log("user : ",user);
    console.log("courses : ",courseDetails);
  return NextResponse.json({
        success: true,
        message: `Sent user successfully `,
        user,
        courseDetails,
        classDetails
      });    
  } catch (error:any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
   