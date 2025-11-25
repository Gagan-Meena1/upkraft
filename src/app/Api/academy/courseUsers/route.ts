import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";

connect();

export async function POST(request: NextRequest) {
  try {
    const { tutorIds, studentIds } = await request.json();

    // Validate input
    if (!Array.isArray(tutorIds) && !Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: "tutorIds or studentIds must be provided as arrays" },
        { status: 400 }
      );
    }

    const tutors = [];
    const students = [];

    // Fetch tutors if tutorIds provided
    if (Array.isArray(tutorIds) && tutorIds.length > 0) {
      const fetchedTutors = await User.find(
        { _id: { $in: tutorIds } },
        { _id: 1, username: 1, category: 1, email: 1, profileImage: 1 }
      ).lean();
      tutors.push(...fetchedTutors);
    }

    // Fetch students if studentIds provided
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      const fetchedStudents = await User.find(
        { _id: { $in: studentIds } },
        { _id: 1, username: 1, category: 1, email: 1, profileImage: 1 }
      ).lean();
      students.push(...fetchedStudents);
    }

    return NextResponse.json(
      {
        success: true,
        tutors,
        students,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching course users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch course users" },
      { status: 500 }
    );
  }
}