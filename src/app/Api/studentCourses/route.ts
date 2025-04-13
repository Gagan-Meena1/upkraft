// app/Api/studentCourses/route.js
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
// import Course from '@/models/courseName'; // Assuming this imports your courseName model
import mongoose from 'mongoose';
import jwt  from 'jsonwebtoken';
import courseName from '@/models/courseName';

export async function GET(request:NextRequest) {
  try {
    // Extract user ID from URL or query parameters
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
            const token = request.cookies.get("token")?.value;
            const decodedToken = token ? jwt.decode(token) : null;
            const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
           const instructor=await User.findById(instructorId);
           console.log("instructorId : ",instructorId);
           
    // Validate studentId format to prevent MongoDB errors
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }
    
    // Find the user by ID and only select needed fields
    const user = await User.findById(studentId).select('username email courses');
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get the course IDs from the user
    const courseIds = user.courses;
    
    // Check if user has any courses
    if (!courseIds || courseIds.length === 0) {
      return NextResponse.json({
        message: "User has no courses",
        studentId: user._id,
        username: user.username,
        email: user.email,
        courses: []
      });
    }
    
    // Fetch all courses for this user in a single query with needed fields only
    const courses = await courseName.find({ _id: { $in: courseIds } })
      .select('title description duration price curriculum');
    console.log(courses);
    
    return NextResponse.json({
      message: "User courses retrieved successfully",
      studentId: user._id,
      username: user.username,
      email: user.email,
      courses: courses
    });
    
  } catch (error:any) {
    console.error("Error fetching user courses:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}