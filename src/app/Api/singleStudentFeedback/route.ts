// Import required modules
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class"; // Assuming you have a Class model
import courseName from "@/models/courseName";
import User from "@/models/userModel";
import { writeFile, mkdir } from 'fs/promises';
import { getServerSession } from "next-auth/next"; // Added import for getServerSession

// Connect to database
connect();


export async function GET(req: NextRequest) {
  try {
    // Authenticate user (optional, but recommended)
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== "tutor") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    
    // Get the class ID from query parameters
    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");
    const courseId = url.searchParams.get("courseId");
    const studentId = url.searchParams.get("studentId");
        
    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }
    if (!courseId) {
        return NextResponse.json({ error: "course ID is required" }, { status: 400 });
      }
    
    // Check if class exists
    const classRecord = await Class.findById(classId);
    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    const courseRecord = await courseName.findById(courseId);
    if (!classRecord) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    // const users=await User.find({category:"Student"});

// Update all student users with the courseId
// await User.updateMany(
//   { category: "Student" },
//   { $push: { courses: courseId } }
// );

 const student=await User.findById(studentId);
    // console.log(usersSameCourse);
  
    console.log(student);
    console.log(classRecord);
    console.log(courseRecord);
    

    

    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "send successfully",
      
            studentId: student._id,
            username: student.username,
            email: student.email,
            courses: courseRecord,
            class:classRecord
          
      
    });
  } catch (error: any) {
    console.error("Error uploading video:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}