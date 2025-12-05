// app/Api/populatePendingAssignments/route.js
import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Assignment from "@/models/assignment";
import User from "@/models/userModel";

export async function POST(request) {
  try {
    await connect();

    // Get all tutors (users with category "Tutor")
    const tutors = await User.find({ category: "Tutor" }).select("_id username");

    if (!tutors || tutors.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No tutors found in the system",
      });
    }

    let processedTutors = 0;
    let totalPendingAssignments = 0;
    const results = [];

    // Process each tutor
    for (const tutor of tutors) {
      try {
        // Find all assignments created by this tutor
        const assignments = await Assignment.find({
          userId: tutor._id,
        })
          .select("_id userId submissions")
          .lean();

        // Initialize pendingAssignments map for this tutor
        const pendingAssignmentsMap = new Map();

        // Process each assignment
        for (const assignment of assignments) {
          // Get all students assigned to this assignment (excluding the tutor)
          const assignedStudents = assignment.userId.filter(
            (userId) => userId.toString() !== tutor._id.toString()
          );

          // Check each student's submission status
          for (const studentId of assignedStudents) {
            const studentIdStr = studentId.toString();

            // Find the student's submission for this assignment
            const submission = assignment.submissions?.find(
              (sub) =>
                sub.studentId?.toString() === studentIdStr &&
                sub.status !== "APPROVED"
            );

            // If no submission or submission is not APPROVED, it's pending
            if (!submission || submission.status !== "APPROVED") {
              if (!pendingAssignmentsMap.has(studentIdStr)) {
                pendingAssignmentsMap.set(studentIdStr, new Set());
              }
              pendingAssignmentsMap.get(studentIdStr).add(assignment._id.toString());
            }
          }
        }

        // Convert map to the schema format
        const pendingAssignments = Array.from(pendingAssignmentsMap.entries()).map(
          ([studentId, assignmentIdsSet]) => ({
            studentId: studentId,
            assignmentIds: Array.from(assignmentIdsSet),
          })
        );

        // Update the tutor's pendingAssignments field
        await User.findByIdAndUpdate(
          tutor._id,
          { pendingAssignments },
          { new: true }
        );

        processedTutors++;
        const totalPending = pendingAssignments.reduce(
          (sum, pa) => sum + pa.assignmentIds.length,
          0
        );
        totalPendingAssignments += totalPending;

        results.push({
          tutorId: tutor._id,
          tutorName: tutor.username,
          studentsWithPending: pendingAssignments.length,
          totalPendingAssignments: totalPending,
        });

        console.log(
          `Processed tutor: ${tutor.username} - ${pendingAssignments.length} students with ${totalPending} pending assignments`
        );
      } catch (tutorError) {
        console.error(`Error processing tutor ${tutor._id}:`, tutorError);
        results.push({
          tutorId: tutor._id,
          tutorName: tutor.username,
          error: tutorError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pending assignments populated successfully",
      summary: {
        totalTutors: tutors.length,
        processedTutors,
        totalPendingAssignments,
      },
      results,
    });
  } catch (error) {
    console.error("Error populating pending assignments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to populate pending assignments",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to view current pending assignments for a specific tutor
export async function GET(request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      return NextResponse.json(
        { success: false, message: "Tutor ID is required" },
        { status: 400 }
      );
    }

    const tutor = await User.findById(tutorId)
      .select("username pendingAssignments")
      .populate({
        path: "pendingAssignments.studentId",
        select: "username email",
      })
      .populate({
        path: "pendingAssignments.assignmentIds",
        select: "title deadline status",
      });

    if (!tutor) {
      return NextResponse.json(
        { success: false, message: "Tutor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        tutorId: tutor._id,
        tutorName: tutor.username,
        pendingAssignments: tutor.pendingAssignments,
        totalStudentsWithPending: tutor.pendingAssignments?.length || 0,
        totalPendingAssignments:
          tutor.pendingAssignments?.reduce(
            (sum, pa) => sum + (pa.assignmentIds?.length || 0),
            0
          ) || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching pending assignments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pending assignments",
        error: error.message,
      },
      { status: 500 }
    );
  }
}