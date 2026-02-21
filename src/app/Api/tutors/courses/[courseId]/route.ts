import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import courseName from "@/models/courseName";
import Class from "@/models/Class";
import User from "@/models/userModel";
import jwt from 'jsonwebtoken';

// Type assertion approach using generic Next.js types
export async function GET(request: Request, { params }: { params: Promise<{ courseId: string }> }) {

  await connect(); // Ensure database connection

  try {
    const {courseId} = await params;
    console.log("courseId:", courseId);

    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }
    
    // Fetch course details
    const courseDetails = await courseName.findById(courseId);
    const classDetails = await Class.find({ course: courseId });

    if (!courseDetails) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch all students enrolled in this course
    const enrolledStudents = await User.find({
      courses: courseId,
      category: "Student"
    }).select('-password -forgotPasswordToken -verifyToken'); 

    // fetching instructor is from academy or not

    const instructor = await User.findById(instructorId).select('academyId');

    return NextResponse.json({ 
      courseId, 
      courseDetails,
      classDetails,
      enrolledStudents,
      totalStudents: enrolledStudents.length,
      academyId:instructor?.academyId || null,
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

export async function PUT(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  await connect();

  try {
    const { courseId } = await params;
    const courseData = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Validate required fields
    if (!courseData.title || !courseData.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Find and update the course
    const updatedCourse = await courseName.findByIdAndUpdate(
      courseId,
      {
        title: courseData.title,
        description: courseData.description,
        duration: courseData.duration,
        price: courseData.price,
        curriculum: courseData.curriculum,
        category: courseData.category,
         subCategory: courseData?.subCategory|| '', // ADD THIS
    maxStudentCount: courseData?.maxStudentCount
      },
      { new: true } // Return the updated document
    );

    if (!updatedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Course updated successfully",
      course: updatedCourse
    });

  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      {
        error: "Failed to update course",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}