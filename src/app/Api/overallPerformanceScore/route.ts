import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import courseName from "@/models/courseName";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    await connect();
    
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const tutorId = decodedToken.id;
    
    // Get all courses for the tutor
    const tutorCourses = await courseName.find({ instructorId: tutorId });
    
    if (!tutorCourses || tutorCourses.length === 0) {
      return NextResponse.json({
        success: true,
        overallScore: 0,
        averageCourseQuality: 0,
        message: "No courses found"
      });
    }
    
    let totalScore = 0;
    let totalCount = 0;
    
    // Calculate average across all performance scores
    tutorCourses.forEach(course => {
      if (course.performanceScores && course.performanceScores.length > 0) {
        course.performanceScores.forEach(perfScore => {
          if (perfScore.score != null) {
            totalScore += perfScore.score;
            totalCount++;
          }
        });
      }
    });
    
    const averageScore = totalCount > 0 ? totalScore / totalCount : 0;
    
    // Calculate average course quality
    let totalCourseQuality = 0;
    let coursesWithQuality = 0;
    
    tutorCourses.forEach(course => {
      if (course.courseQuality != null && course.courseQuality > 0) {
        totalCourseQuality += course.courseQuality;
        coursesWithQuality++;
      }
    });
    
    const averageCourseQuality = coursesWithQuality > 0 
      ? totalCourseQuality / coursesWithQuality 
      : 0;
    
    return NextResponse.json({
      success: true,
      overallScore: parseFloat(averageScore.toFixed(1)),
      averageCourseQuality: parseFloat(averageCourseQuality.toFixed(1)),
      totalStudents: totalCount,
      totalCourses: tutorCourses.length,
      coursesWithQuality: coursesWithQuality
    });
    
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}