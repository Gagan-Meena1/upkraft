import { NextResponse } from "next/server";
import User from "@/models/userModel";
import Class from "@/models/Class";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import courseName from "@/models/courseName";

export async function GET(request) {
  try {
    await connect();
    console.log("Fetching essential user data...");

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.id;

    const user = await User.findOne({ _id: userId })
      .select("_id username email category age address contact courses createdAt")
      .lean();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const courseDetails = await courseName.find({ _id: { $in: user.courses } })
      .select("class")
      .lean();

    const classIds = courseDetails.reduce((acc, course) => {
      return acc.concat(course.class || []);
    }, []);

    const now = new Date();
    const futureClasses = await Class.find({
      _id: { $in: classIds },
      startTime: { $gt: now }
    })
    .sort({ startTime: 1 })
    .lean();

    return NextResponse.json({
      success: true,
      message: "Essential data sent successfully",
      user,
      classDetails: futureClasses,
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60'
      }
    });

  } catch (error) {
    console.error("Error fetching essential data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}