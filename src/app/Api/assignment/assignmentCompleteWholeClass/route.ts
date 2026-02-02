import { NextRequest, NextResponse } from 'next/server';
import Assignment from '@/models/assignment';
import User from '@/models/userModel';
import { connect } from '@/dbConnection/dbConfic';

export async function PUT(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");
    if (!assignmentId) {
      return NextResponse.json({ success: false, message: "assignmentId is required" }, { status: 400 });
    }

    // Do not populate 'assignedStudents' (not in schema) to avoid strictPopulate error
    const existingAssignment = await Assignment.findById(assignmentId)
      .setOptions({ strictPopulate: false })
      .populate({ path: "userId", select: "category" });
    if (!existingAssignment) {
      return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 });
    }

    if (!Array.isArray((existingAssignment as any).submissions)) {
      (existingAssignment as any).submissions = [];
    }

    const newStatus = !existingAssignment.status;
    existingAssignment.status = newStatus;

    if (newStatus === true) {
      // Prefer raw assignedStudents ids; fallback to non-tutor userIds
      const assigned = Array.isArray((existingAssignment as any).assignedStudents)
        ? (existingAssignment as any).assignedStudents
        : [];

      let studentIds: string[] = assigned
        .map((id: any) => id?.toString?.())
        .filter(Boolean);

      if (studentIds.length === 0) {
        const userArr = Array.isArray((existingAssignment as any).userId)
          ? (existingAssignment as any).userId
          : [(existingAssignment as any).userId].filter(Boolean);

        studentIds = userArr
          .filter((u: any) => String(u?.category || "").toLowerCase() !== "tutor")
          .map((u: any) => u?._id?.toString?.() ?? u?.toString?.())
          .filter(Boolean);
      }

      for (const sid of studentIds) {
        const idx = (existingAssignment as any).submissions.findIndex(
          (s: any) => s?.studentId?.toString?.() === sid
        );
        if (idx === -1) {
          (existingAssignment as any).submissions.push({
            studentId: sid,
            studentMessage: "Marked complete by tutor (whole class)",
            status: "APPROVED",
            submittedAt: new Date(),
          });
        } else {
          (existingAssignment as any).submissions[idx].status = "APPROVED";
          (existingAssignment as any).submissions[idx].submittedAt = new Date();
        }
      }

      // Optional: clean tutor.pendingAssignments
      const userArr = Array.isArray((existingAssignment as any).userId)
        ? (existingAssignment as any).userId
        : [(existingAssignment as any).userId].filter(Boolean);
      const tutorUser = userArr.find((u: any) => String(u?.category || "").toLowerCase() === "tutor");
      if (tutorUser?._id) {
        const tutor = await User.findById(tutorUser._id);
        if (tutor && Array.isArray((tutor as any).pendingAssignments)) {
          (tutor as any).pendingAssignments = (tutor as any).pendingAssignments
            .map((pa: any) => ({
              ...pa,
              assignmentIds: (pa.assignmentIds || []).filter(
                (id: any) => id?.toString?.() !== assignmentId?.toString?.()
              ),
            }))
            .filter((pa: any) => (pa.assignmentIds || []).length > 0);
          await tutor.save();
        }
      }
    }

    await existingAssignment.save();

    return NextResponse.json({
      success: true,
      message: `Assignment marked as ${newStatus ? "complete" : "incomplete"}`,
      data: existingAssignment,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating assignment status:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Error updating assignment status",
    }, { status: 500 });
  }
}