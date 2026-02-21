import { NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import courseName from "@/models/courseName";

export async function GET(request) {
  try {
    await connect();
    console.log("Fetching additional user data...");

    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.id;

    const user = await User.findOne({ _id: userId })
      .select("courses")
      .lean();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const courseDetails = await courseName.find({ _id: { $in: user.courses } })
      .select("_id title category description duration price curriculum class")
      .lean();
    
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

    return NextResponse.json({
      success: true,
      message: "Additional data sent successfully",
      courseDetails,
      courseTitleMap
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120'
      }
    });

  } catch (error) {
    console.error("Error fetching additional data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}