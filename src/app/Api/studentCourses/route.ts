import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import courseName from '@/models/courseName';

export async function GET(request:NextRequest) {
  try {
    // Extract user ID from URL or query parameters
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get instructor ID from token
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
    if (!instructorId) {
      return NextResponse.json({ error: "Instructor authentication required" }, { status: 401 });
    }
    
    // Validate IDs format to prevent MongoDB errors
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(instructorId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }
    
    // Find both users in parallel for efficiency
    const [student, instructor] = await Promise.all([
      User.findById(studentId).select('username email courses profileImage contact city age'),
      User.findById(instructorId).select('courses')
    ]);
    
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }
    
    // Get the course IDs from both users
    const studentCourseIds = student.courses || [];
    const instructorCourseIds = instructor.courses || [];
    
    // Find common course IDs (courses that both student and instructor have)
    const commonCourseIds = studentCourseIds.filter(courseId => 
      instructorCourseIds.some(instructorCourseId => 
        instructorCourseId.toString() === courseId.toString()
      )
    );
    
    // Check if there are any common courses
    if (commonCourseIds.length === 0) {
      return NextResponse.json({
        message: "No common courses found between student and instructor",
        studentId: student._id,
        username: student.username,
        email: student.email,
        profileImage:student.profileImage,
        contact: student.contact,
        city: student.city,
        age: student.age,
        courses: []
      });
    }
    
    // Fetch the common courses
    const commonCourses = await courseName.find({ _id: { $in: commonCourseIds } });
    
    return NextResponse.json({
      message: "Common courses retrieved successfully",
      studentId: student._id,
      username: student.username,
      email: student.email,
      profileImage:student.profileImage,
      contact: student.contact,
      city: student.city,
      age: student.age,
      courses: commonCourses
    });
    
  } catch (error:any) {
    console.error("Error fetching common courses:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}