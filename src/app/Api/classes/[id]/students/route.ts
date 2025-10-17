import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";

export async function GET(req, { params }) {
  try {
    await connect();

    const { id } = await params; // ensure await in Next.js dynamic route

    if (!id) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    // Check if class exists
    const classData = await Class.findById(id);
    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Find all users who are students in this class
    // Assuming students have category === "Student" (you can adjust)
    const students = await User.find({
      classes: id,
      category: { $in: ["Student", "student", "learner"] },
    }).select("username email contact city");

    if (!students.length) {
      return NextResponse.json({
        message: "No students assigned to this class",
        students: [],
      });
    }

    return NextResponse.json({
      classId: id,
      classTitle: classData.title,
      totalStudents: students.length,
      students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
