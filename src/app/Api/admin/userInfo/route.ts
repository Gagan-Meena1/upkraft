import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/userModel";
import Class from "@/models/Class";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import courseName from "@/models/courseName";

export async function GET(request:NextRequest) {
  try {
    await connect();
    console.log("Fetching user...");

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    console.log("11111111111111111111111111111111111111111111111111111111111");
    console.log("userId",userId);
    console.log("11111111111111111111111111111111111111111111111111111111111");
    
    
    // Get token from cookies
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    if (!token) return NextResponse.json({ error: "No token found" }, { status: 401 });

    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
 
    if (!userId) {
      return NextResponse.json({ error: "user ID is required" }, { status: 400 });
    }

 

    // Fix database query - Ensure user is found
    const user = await User.findOne({ _id: userId }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const courseDetails = await courseName.find({ _id: { $in: user.courses } });
    const classIds = courseDetails.flatMap(course => course.classIds || []);
    const classDetails = await Class.find({ _id: { $in: classIds } });
    
    user.age ? user.age = user.age : user.age = 18;
    user.address ? user.address = user.address : user.address = "";
    user.contact ? user.contact = user.contact : user.contact = "";

    console.log("user : ", user);
    console.log("courses : ", courseDetails);
    
    return NextResponse.json({
      success: true,
      message: `Sent user successfully`,
      user,
      courseDetails,
      classDetails
    });
  } catch (error:any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}