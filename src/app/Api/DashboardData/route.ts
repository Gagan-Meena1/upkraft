import { NextResponse } from "next/server";
import { headers } from "next/headers";
import User from "@/models/userModel";
import Class from "@/models/Class";
import courseName from "@/models/courseName";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    await connect();

    const referer = request.headers.get("referer") || "";
    const activeCookie = request.cookies.get("impersonate_token")?.value;
    const originalCookie = request.cookies.get("token")?.value;

    // DEBUGGING DUMP
    const fs = require('fs');
    fs.appendFileSync('/tmp/debug_dashboard.txt', `\n[${new Date().toISOString()}] Referer: ${referer} | HasImpersonate: ${!!activeCookie} | x-active-token: ${headers().get("x-active-token") || "None"}\n`);

    let refererPath = "";
    try { if (referer) refererPath = new URL(referer).pathname; } catch (e) { }

    const isTutorContext = refererPath.startsWith("/tutor") || request.nextUrl?.pathname?.startsWith("/Api/tutor");
    const token = (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;

    fs.appendFileSync('/tmp/debug_dashboard.txt', `x-active is: ${request.headers.get("x-active-token")}, isTutorContext: ${isTutorContext}, token extracted is: ${token}\n`);

    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

    const decoded = jwt.decode(token);
    const userId = decoded?.id;
    if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const [user, studentCount] = await Promise.all([
      User.findById(userId)
        .select("_id username email category profileImage courses timezone academyId")
        .lean(),

      User.countDocuments({
        instructorId: userId,
        category: "Student"
      })
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.courses?.length) {
      return NextResponse.json({
        success: true,
        message: "Sent user successfully",
        user,
        courseDetails: [],
        classDetails: [],
        studentCount
      });
    }

    const courseDetails = await courseName
      .find({ _id: { $in: user.courses } })
      .select("_id category class title instructorId academyInstructorId")
      .lean();

    const allClassIds = courseDetails.flatMap(course => course.class);
    const uniqueClassIds = [...new Set(allClassIds.map(id => id.toString()))];

    const classDetails = uniqueClassIds.length
      ? await Class.find({ _id: { $in: uniqueClassIds } }).lean()
      : [];

    return NextResponse.json({
      success: true,
      message: "Sent user successfully",
      user,
      courseDetails,
      classDetails,
      studentCount
    });

  } catch (error) {
    console.error("DashboardData Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}