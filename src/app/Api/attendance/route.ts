// pages/api/attendance.js (or app/api/attendance/route.js for App Router)

import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import Class from "@/models/Class";
import Course from "@/models/courseName"; // Import Course model

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");
    
    const body = await request.json();
    const { status, attendanceRecords, credits , creditReason} = body;

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

          const result: any = {
            studentId: record.studentId,
            classId,
            status: record.status,
            success: true
          };

          results.push(result);
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
        { status: errors.length === 0 ? 200 : 207 }
      );

    } else {
      // SINGLE ATTENDANCE MARKING
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

      // ✅ OPTIMIZED: Single query with populate to get all needed data
      const [student, classData] = await Promise.all([
        User.findById(studentId),
        Class.findById(classId).populate('course').lean()
      ]);

      if (!student) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Student not found" 
          },
          { status: 404 }
        );
      }

      if (!classData) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Class not found" 
          },
          { status: 404 }
        );
      }

      // Check if attendance record exists for this class
      const attendanceIndex = student.attendance.findIndex(
        (att) => att.classId.toString() === classId
      );

      // ✅ Handle credits for present status
      let instructorId = null;
      let creditsProcessed = false;

      if (status === 'present' && credits && credits > 0) {
        // Deduct credits from student
        student.credits -= credits;
      

        // Update attendance record with creditDeducted
        if (attendanceIndex !== -1) {
          student.attendance[attendanceIndex].status = status;
          student.attendance[attendanceIndex].creditDeducted = credits;
          student.attendance[attendanceIndex].reasonForCreditDeduction = creditReason || "";
        } else {
          student.attendance.push({
            classId: classId,
            status: status,
            creditDeducted: credits,
            reasonForCreditDeduction: creditReason || ""
          });
        }

        // ✅ Find instructor to add credits
        const course = classData.course;
        
        if (course && course.academyInstructorId && course.academyInstructorId.length > 0) {
          // Use first academyInstructorId
          instructorId = course.academyInstructorId[0];
        } else {
          // Find tutor who has this classId in their classes array
          const tutor = await User.findOne({
            category: 'Tutor',
            classes: classId
          }).lean();
          
          if (tutor) {
            instructorId = tutor._id;
          }
        }

        // ✅ Add credits to instructor (parallel operation)
        if (instructorId) {
          await User.findByIdAndUpdate(
            instructorId,
            { $inc: { credits: credits } },
            { new: true }
          );
          creditsProcessed = true;
        }

      } else {
        // Regular attendance update without credits
        if (attendanceIndex !== -1) {
          student.attendance[attendanceIndex].status = status;
        } else {
          student.attendance.push({
            classId: classId,
            status: status
          });
        }
      }

      // Save student
      await student.save();

      const responseData: any = {
        studentId,
        classId,
        status,
        ...(creditsProcessed && {
          creditsDeducted: credits,
          creditsAddedToInstructor: instructorId?.toString()
        })
      };

      return NextResponse.json(
        {
          success: true,
          message: `Attendance marked as ${status} successfully${creditsProcessed ? ' and credits processed' : ''}`,
          data: responseData
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