//Need to create new api

// src>app>api>dashboard>pendingFeedbackCount>route.ts


import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import courseName from "@/models/courseName";
import feedback from "@/models/feedback";
import feedbackDance from "@/models/feedbackDance";
import feedbackDrawing from "@/models/feedbackDrawing";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    let tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      const token = request.cookies.get("token")?.value;
      if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

      const decodedToken = jwt.decode(token);
      if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      tutorId = decodedToken.id;
    }

    // Fetch all students of this tutor
    const students = await User.find({
      instructorId: tutorId,
      category: "Student"
    }).select("_id courses").lean();

    if (!students.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const studentIds = students.map(s => s._id);
    const tutorCourses = await courseName.find({
      _id: { $in: students.flatMap(s => s.courses) },
      instructorId: tutorId
    }).select("_id class category").lean();

    const classesPast = tutorCourses
      .flatMap(c => c.class.map(cls => ({ cls, category: c.category })));

    if (!classesPast.length) return NextResponse.json({ success: true, count: 0 });

    const pastClasses = await Class.find({
      _id: { $in: classesPast.map(c => c.cls) },
      endTime: { $lt: new Date() }
    }).select("_id").lean();

    const classIds = pastClasses.map(c => c._id);

    // Parallel count calls for 3 subjects
    const [musicGiven, danceGiven, drawingGiven] = await Promise.all([
      feedback.countDocuments({ userId: { $in: studentIds }, classId: { $in: classIds } }),
      feedbackDance.countDocuments({ userId: { $in: studentIds }, classId: { $in: classIds } }),
      feedbackDrawing.countDocuments({ userId: { $in: studentIds }, classId: { $in: classIds } })
    ]);

    const totalFeedbackNeeded = classIds.length * studentIds.length;
    const pendingFeedback = totalFeedbackNeeded - (musicGiven + danceGiven + drawingGiven);

    return NextResponse.json({ success: true, count: pendingFeedback });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}