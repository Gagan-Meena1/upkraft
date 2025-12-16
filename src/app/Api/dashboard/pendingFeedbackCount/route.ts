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

    // Single aggregation query to get students with their course IDs
    const students = await User.find({
      instructorId: tutorId,
      category: "Student"
    }).select("_id courses").lean();

    if (!students.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const studentIds = students.map(s => s._id);
    const allCourseIds = [...new Set(students.flatMap(s => s.courses))];

    // Fetch courses with populated class data in single query
    const tutorCourses = await courseName.find({
      _id: { $in: allCourseIds },
      instructorId: tutorId
    }).select("_id class category").lean();

    if (!tutorCourses.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Build class-to-category map
    const classCategoryMap = new Map();
    const allClassIds = [];
    
    tutorCourses.forEach(course => {
      course.class.forEach(classId => {
        const classIdStr = classId.toString();
        classCategoryMap.set(classIdStr, course.category);
        allClassIds.push(classId);
      });
    });

    if (!allClassIds.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Fetch only past classes
    const pastClasses = await Class.find({
      _id: { $in: allClassIds },
      endTime: { $lt: new Date() }
    }).select("_id").lean();

    if (!pastClasses.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Categorize past classes
    const categorizedClasses = {
      Music: [],
      Dance: [],
      Drawing: []
    };

    pastClasses.forEach(cls => {
      const category = classCategoryMap.get(cls._id.toString());
      if (categorizedClasses[category]) {
        categorizedClasses[category].push(cls._id);
      }
    });

    // Parallel fetch all existing feedbacks
    const [musicFeedbacks, danceFeedbacks, drawingFeedbacks] = await Promise.all([
      categorizedClasses.Music.length > 0
        ? feedback.find({
            userId: { $in: studentIds },
            classId: { $in: categorizedClasses.Music }
          }).select("userId classId").lean()
        : Promise.resolve([]),
      
      categorizedClasses.Dance.length > 0
        ? feedbackDance.find({
            userId: { $in: studentIds },
            classId: { $in: categorizedClasses.Dance }
          }).select("userId classId").lean()
        : Promise.resolve([]),
      
      categorizedClasses.Drawing.length > 0
        ? feedbackDrawing.find({
            userId: { $in: studentIds },
            classId: { $in: categorizedClasses.Drawing }
          }).select("userId classId").lean()
        : Promise.resolve([])
    ]);

    // Create efficient lookup sets
    const feedbackSets = {
      Music: new Set(musicFeedbacks.map(f => `${f.userId}_${f.classId}`)),
      Dance: new Set(danceFeedbacks.map(f => `${f.userId}_${f.classId}`)),
      Drawing: new Set(drawingFeedbacks.map(f => `${f.userId}_${f.classId}`))
    };

    // Calculate pending feedbacks by checking what's missing
    let pendingCount = 0;

    Object.entries(categorizedClasses).forEach(([category, classIds]) => {
      const feedbackSet = feedbackSets[category];
      studentIds.forEach(studentId => {
        classIds.forEach(classId => {
          if (!feedbackSet.has(`${studentId}_${classId}`)) {
            pendingCount++;
          }
        });
      });
    });

    return NextResponse.json({ 
      success: true, 
      count: pendingCount 
    });

  } catch (err:any) {
    console.error("Error in pendingFeedbackCount:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}