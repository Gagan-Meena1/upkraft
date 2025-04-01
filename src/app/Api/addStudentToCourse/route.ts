// Import required modules
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class"; 
import User from "@/models/userModel";
import courseName from "@/models/courseName";
import { writeFile, mkdir } from 'fs/promises';
import { log } from "console";

// Connect to database
connect();



export async function POST(req: NextRequest, { params }: { params: Record<string, string> },res:NextResponse) {
  try {
   
    
     // Extract data from request body
     const requestData = await req.json();
     const { courseId } = requestData;
     const { userId } = requestData;
     const studentId=userId;
     console.log("requestData : ",requestData);
     
     
    
    console.log("11111111111111111111111111111111111111111111111111111111111111");
    console.log(req.url);
    
        console.log("courseId : ",courseId);
        console.log(" studentId: ",studentId);
    console.log("11111111111111111111111111111111111111111111111111111111111111");
        
    if (!studentId) {
      return NextResponse.json({ error: "student ID is required" }, { status: 400 });
    }
    
    // Check if student exists
    const student = await User.findById(studentId);
    console.log("222222222222222222222222222222222222222222222222222222");
    console.log(student.username);
    

    if (!student) {
      return NextResponse.json({ error: "student not found" }, { status: 404 });
    }
     // $addToSet ensures no duplicates
      // $addToSet ensures no duplicates
      const updatedUser = await User.findByIdAndUpdate(
        studentId,
        { $addToSet: { courses: courseId } },
        { new: true }
      );
  
      if (!updatedUser) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      const userResponse = {
        name: updatedUser.name,
        email: updatedUser.email,
        courses: updatedUser.courses
      };
  
      return NextResponse.json({
        success: true,
        message: `Course added to user successfully `,
        userResponse,
        courseId
      });
  
  } catch (error: any) {
    console.error("Error adding course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}