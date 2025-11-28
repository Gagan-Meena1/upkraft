// pages/api/attendance.js (or app/api/attendance/route.js for App Router)

import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");
    
    const body = await request.json();
    const { status } = body;

    // Validation
    if (!studentId || !classId) {
      return NextResponse.json(
        { 
          success: false, 
          error: "studentId and classId are required" 
        },
        { status: 400 }
      );
    }

    if (!status || !["present", "absent", "canceled", "not_marked"].includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Valid status is required (present, absent, canceled, not_marked)" 
        },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(studentId);

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Student not found" 
        },
        { status: 404 }
      );
    }

    // Check if attendance record exists for this class
    const attendanceIndex = user.attendance.findIndex(
      (att) => att.classId.toString() === classId
    );

    if (attendanceIndex !== -1) {
      // Update existing attendance record
      user.attendance[attendanceIndex].status = status;
    } else {
      // Create new attendance record
      user.attendance.push({
        classId: classId,
        status: status
      });
    }

    // Save the updated user
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: `Attendance marked as ${status} successfully`,
        data: {
          studentId,
          classId,
          status
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update attendance"
      },
      { status: 500 }
    );
  }
}