import { NextResponse } from "next/server";
import User from "@/models/userModel";
import Class from "@/models/Class";
import courseName from "@/models/courseName";
import feedback from "@/models/feedback";
import feedbackDance from "@/models/feedbackDance";
import feedbackDrawing from "@/models/feedbackDrawing";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    await connect();
    console.log("Fetching missing feedback...");

    // Get tutorId from query param or token
    const { searchParams } = new URL(request.url);
    let tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      // Get from token if not in query param
      const token = request.cookies.get("token")?.value;
      if (!token) {
        return NextResponse.json({ error: "No token or tutorId found" }, { status: 401 });
      }

      const decodedToken = jwt.decode(token);
      if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      tutorId = decodedToken.id;
    }

    // Step 1: Find all students who have this tutor in their instructorId field
    const students = await User.find({
      instructorId: tutorId,
      category: "Student"
    }).select("_id username courses");

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No students found for this tutor",
        missingFeedbackClasses: [],
        count: 0
      });
    }

    // Step 2: Find tutor's courses
    const tutor = await User.findById(tutorId).select("courses");
    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    const tutorCourseIds = tutor.courses.map(id => id.toString());
    
    // Check if tutor has any courses
    if (tutorCourseIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tutor has no courses assigned",
        tutorId,
        totalStudents: students.length,
        missingFeedbackClasses: [],
        count: 0
      });
    }

    const missingFeedbackClasses = [];
    const studentsWithCommonCourses = [];
    const studentsWithoutCommonCourses = [];

    // Process each student
    for (const student of students) {
      const studentCourseIds = student.courses.map(id => id.toString());
      
      // Step 3: Find common courses between tutor and student
      const commonCourseIds = tutorCourseIds.filter(courseId => 
        studentCourseIds.includes(courseId)
      );

      if (commonCourseIds.length === 0) continue;

      // Get course details for common courses
      const commonCourses = await courseName.find({
        _id: { $in: commonCourseIds }
      });

      // Step 4: Process each common course
      for (const course of commonCourses) {
        const classIds = course.class || [];
        
        if (classIds.length === 0) continue;

        // Get class details
        const classes = await Class.find({ _id: { $in: classIds } });

        // Step 5: Check feedback for each class based on course category
        for (const classItem of classes) {
          let feedbackExists = false;
          let FeedbackModel;

          // Select appropriate feedback model based on course category
          if (course.category === "Music") {
            FeedbackModel = feedback;
          } else if (course.category === "Dance") {
            FeedbackModel = feedbackDance;
          } else if (course.category === "Drawing") {
            FeedbackModel = feedbackDrawing;
          } else {
            continue; // Skip if category doesn't match
          }

          // Check if feedback exists for this student and class
          const existingFeedback = await FeedbackModel.findOne({
            userId: student._id,
            classId: classItem._id
          });

          if (!existingFeedback) {
            // Feedback not found - add to missing list
            missingFeedbackClasses.push({
              studentId: student._id,
              studentName: student.username,
              profileImage: student.profileImage || null,
              classId: classItem._id,
              className: classItem.title || classItem.name,
              courseId: course._id,
              courseName: course.title,
              courseCategory: course.category,
              classDate: classItem.date || classItem.scheduledDate,
              feedbackModelRequired: course.category === "Music" ? "feedback" : 
                                     course.category === "Dance" ? "feedbackDance" : 
                                     "feedbackDrawing"
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Missing feedback classes retrieved successfully",
      tutorId,
      totalStudents: students.length,
      missingFeedbackClasses,
      count: missingFeedbackClasses.length
    });

  } catch (error:any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}