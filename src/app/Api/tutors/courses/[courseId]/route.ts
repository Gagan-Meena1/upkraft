import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import courseName from "@/models/courseName";
import User from "@/models/userModel"
import Class from "@/models/Class"


export async function GET(
  request: NextRequest, 
  { params }: { params: { courseId: string } } // Correct destructuring
) {
  await connect(); // Ensure database connection

  try {
    const courseId = params.courseId; // Correct way to access params
    console.log("courseId:", courseId);

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Fetch course details
    const courseDetails = await courseName.findById(courseId);
    const classDetails=await Class.find({course:courseId});

    if (!courseDetails) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      courseId, 
      courseDetails, 
      classDetails,
      message: "Course ID successfully extracted" 
    });

  } catch (error) {
    console.error("Error fetching course:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch course details",
        message: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}
