import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/dbConnection/dbConfic";
import User from "@/models/userModel";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const { studentId, credits, message } = await request.json();

    // Validate input
    if (!studentId) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      );
    }

   

    // Find the student and update credits
    const student = await User.findById(studentId);

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Update the credits field
    student.credits += credits;
    if(!student.creditsInput){
      student.creditsInput = [];
    }
    student.creditsInput.push({
       message : message , 
       credits : credits
      });
    
    await student.save();

    return NextResponse.json({
      message: "Credits per course updated successfully",
      data: {
        studentId: student._id,
        studentName: student.username,
        credits: student.credits
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating credits per class:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update credits per class" },
      { status: 500 }
    );
  }
}