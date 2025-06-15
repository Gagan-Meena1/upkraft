import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import courseName from "@/models/courseName";
import Class from "@/models/Class";

// Type assertion approach using generic Next.js types
export async function GET(
  request: NextRequest,
  // This approach uses type assertion but keeps the type safety
  { params }: { params: Record<string, string> }
) {
  await connect(); // Ensure database connection

  try {
    const courseId = await params.courseId;
    console.log("courseId:", courseId);

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Fetch course details
    const courseDetails = await courseName.findById(courseId);
    const classDetails = await Class.find({ course: courseId });

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