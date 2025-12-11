//Need to create new api

// src>app>api>classes>students>route.ts

import { NextResponse } from "next/server";
import Class from "@/models/Class";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";

export async function GET(req) {
  try {
    await connect();

    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids");
    if (!idsParam) {
      return NextResponse.json({ error: "Class IDs required" }, { status: 400 });
    }

    const classIds = idsParam.split(",");

    // Step 1: Fetch all classes with course reference
    const classes = await Class.find({ _id: { $in: classIds } }).select("_id course");

    // Step 2: Extract all unique courseIds
    const courseIds = [...new Set(classes.map(c => c.course.toString()))];

    // Step 3: Fetch students linked to these courses
    const users = await User.find({
      courses: { $in: courseIds },
      category: { $in: ["Student", "student", "learner"] }
    })
    .select("_id username email contact city profileImage courses");

    // Step 4: Build students per class map
    const studentsMap = {};
    classIds.forEach(cId => {
      const cls = classes.find(cl => cl._id.toString() === cId);
      if (!cls) return;
      const courseId = cls.course?.toString();
      studentsMap[cId] = users.filter(u => u.courses.some(c => c.toString() === courseId));
    });

    return NextResponse.json({ studentsMap });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}