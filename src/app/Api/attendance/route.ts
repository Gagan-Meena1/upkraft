// pages/api/attendance.js (or app/api/attendance/route.js for App Router)

import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");
    
    const body = await request.json();
    const { status, attendanceRecords } = body;

    // Check if this is a bulk operation
    if (attendanceRecords && Array.isArray(attendanceRecords)) {
      // BULK ATTENDANCE MARKING
      if (!classId) {
        return NextResponse.json(
          { 
            success: false, 
            error: "classId is required for bulk attendance" 
          },
          { status: 400 }
        );
      }

      // Validate all records
      for (const record of attendanceRecords) {
        if (!record.studentId || !record.status) {
          return NextResponse.json(
            { 
              success: false, 
              error: "Each record must have studentId and status" 
            },
            { status: 400 }
          );
        }

        if (!["present", "absent", "canceled", "not_marked"].includes(record.status)) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Invalid status for student ${record.studentId}` 
            },
            { status: 400 }
          );
        }
      }

      // Process all attendance records
      const results = [];
      const errors = [];

      for (const record of attendanceRecords) {
        try {
          const user = await User.findById(record.studentId);

          if (!user) {
            errors.push({
              studentId: record.studentId,
              error: "Student not found"
            });
            continue;
          }

          // Check if attendance record exists for this class
          const attendanceIndex = user.attendance.findIndex(
            (att) => att.classId.toString() === classId
          );

          if (attendanceIndex !== -1) {
            // Update existing attendance record
            user.attendance[attendanceIndex].status = record.status;
          } else {
            // Create new attendance record
            user.attendance.push({
              classId: classId,
              status: record.status
            });
          }

          await user.save();

          results.push({
            studentId: record.studentId,
            classId,
            status: record.status,
            success: true
          });

        } catch (error: any) {
          errors.push({
            studentId: record.studentId,
            error: error.message
          });
        }
      }

      return NextResponse.json(
        {
          success: errors.length === 0,
          message: `Marked attendance for ${results.length} students`,
          data: {
            successful: results,
            failed: errors,
            total: attendanceRecords.length,
            successCount: results.length,
            failureCount: errors.length
          }
        },
        { status: errors.length === 0 ? 200 : 207 } // 207 = Multi-Status
      );

    } else {
      // SINGLE ATTENDANCE MARKING (Original logic)
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
    }

  } catch (error: any) {
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