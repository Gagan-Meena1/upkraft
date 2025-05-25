// Import required modules
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import courseName from "@/models/courseName";

// Connect to database
connect();

export async function POST(req: NextRequest) {
  try {
    // Extract data from request body
    const requestData = await req.json();
    const { courseId, studentId, tutorId } = requestData;
    console.log("requestData:", requestData);
    
    // Determine instructor ID from request or token
    let instructorId;
    if (tutorId) {
      instructorId = tutorId;
    } else {
      const token = req.cookies.get("token")?.value;
      const decodedToken = token ? jwt.decode(token) : null;
      instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    }
    
    console.log("API Details:");
    console.log("URL:", req.url);
    console.log("courseId:", courseId);
    console.log("studentId:", studentId);
    console.log("instructorId:", instructorId);
    
    // Validate required data
    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }
    
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }
    
    if (!instructorId) {
      return NextResponse.json({ error: "Instructor ID could not be determined" }, { status: 400 });
    }
    
    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    
    // Check if instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }
    
     const course = await courseName.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    
    // Get all class IDs for this course
    const classIds = course.class || [];
    console.log("Classes to add:", classIds);
    
    // Update student: Add course to their courses array and reference to instructor
    // Also add all class IDs to their classes array
    const updatedStudent = await User.findByIdAndUpdate(
      studentId,
      {
        $addToSet: {
          courses: courseId,
          instructors: instructorId, // Keep track of instructors (optional)
          classes: { $each: classIds } // Add all classes from the course
        }
      },
      { new: true }
    );
    
    // Update instructor: Add course to their courses array
    // Also add all class IDs to their classes array
    const updatedInstructor = await User.findByIdAndUpdate(
      instructorId,
      {
        $addToSet: {
          courses: courseId,
          students: studentId, // Keep track of students (optional)
          classes: { $each: classIds } // Add all classes from the course
        }
      },
      { new: true }
    );
    
    // Prepare response data
    const responseData = {
      success: true,
      message: "Course added successfully ",
      student: {
        id: updatedStudent._id,
        name: updatedStudent.name,
        email: updatedStudent.email,
        courses: updatedStudent.courses
      },
      instructor: {
        id: updatedInstructor._id,
        name: updatedInstructor.name,
        courses: updatedInstructor.courses
      },
      courseId
    };
    
    return NextResponse.json(responseData);
  
  } catch (error: any) {
    console.error("Error adding course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}