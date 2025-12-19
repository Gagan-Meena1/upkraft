import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Assignment from "@/models/assignment";

export async function POST(request: Request) {
  try {
    await connect();
    const { classIds, studentId } = await request.json();

    if (!Array.isArray(classIds) || !studentId) {
      return NextResponse.json({ success: false, error: "classIds (array) and studentId are required" }, { status: 400 });
    }

    const stats: Record<string, { totalStudentAssignments: number; completedAssignments: number }> = {};

    for (const classId of classIds) {
      // Get all assignments for this class
      const assignments = await Assignment.find({ classId });

      // Total assignments for this class where the student has at least one submission
      const totalStudentAssignments = assignments.filter(a =>
        Array.isArray(a.submissions) &&
        a.submissions.some((s: any) => s.studentId?.toString() === studentId)
      ).length;

      // Completed assignments for this student: submissions with status APPROVED
      let completedAssignments = 0;
      assignments.forEach(a => {
        if (Array.isArray(a.submissions)) {
          const approved = a.submissions.some(
            (s: any) =>
              s.studentId?.toString() === studentId &&
              String(s.status).toUpperCase() === "APPROVED"
          );
          if (approved) completedAssignments += 1;
        }
      });

      stats[classId] = { totalStudentAssignments, completedAssignments };
    }

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("classAssignmentStats error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}