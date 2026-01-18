// app/api/tutors/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt  from 'jsonwebtoken';
import courseName from "@/models/courseName";
import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import mongoose from 'mongoose';
import { ca } from 'date-fns/locale';
import { sub } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming JSON body
    await connect();
    const courseData = await request.json();
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const tutorId = url.searchParams.get('tutorId');
    // Validate input (you'd want more robust validation)
    if (!courseData.title || !courseData.description) {
      return NextResponse.json(
        { error: 'Title and description are required' }, 
        { status: 400 }
      );
    }
    let instructorId;
    if (tutorId) {
      instructorId = tutorId;
    } else {
      const token = request.cookies.get("token")?.value;
      const decodedToken = token ? jwt.decode(token) : null;
      instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    }
       const user=await User.findById(instructorId);
       console.log("111111111111111111111111");

       console.log(courseData);

       const newCourse = new courseName({
        title: courseData.title,
        description: courseData.description,
        instructorId:instructorId,
        duration: courseData.duration,
        price: courseData.price,
        curriculum: courseData.curriculum,
        category: courseData.category,
        subCategory: courseData?.subCategory || '',
        maxStudentCount: courseData?.maxStudentCount ,
        credits: courseData?.credits || 0,
    });
        console.log(newCourse);
        const savednewCourse=await newCourse.save();
        const courses=await courseName.find({instructorId})
        await User.findByIdAndUpdate(instructorId,{$addToSet:{courses:savednewCourse._id}},{new:true})
    
    console.log("22222222222222222222222222");

    return NextResponse.json({
      message: 'Course created successfully',
      course: courses
    }, { status: 201 });

  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' }, 
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    connect();
    const url = new URL(request.url);
    const tutorId = url.searchParams.get('tutorId');
    
    // Get instructorId from token if tutorId is not provided
    let instructorId;
    if (tutorId) {
      instructorId = tutorId;
    } else {
      const token = request.cookies.get("token")?.value;
      const decodedToken = token ? jwt.decode(token) : null;
      instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    }

    // Ensure we have a valid instructorId
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' }, 
        { status: 400 }
      );
    }

    // Get courses where user is the main instructor OR courses in user's courses array
const instructor = await User.findById(instructorId).select('academyId category courses');

const courses = await courseName.find({
  $or: [
    { instructorId: instructorId },
    { _id: { $in: instructor?.courses || [] } }
  ]
});

    return NextResponse.json({
      message: 'Courses retrieved successfully',
      course: courses,
      academyId: instructor?.academyId || null,
      category: instructor?.category || null
    }, { status: 200 });

  } catch (error) {
    console.error('Course retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve courses' }, 
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'Course ID is required' },
        { status: 400 }
      );
    }
    
    // Find and delete the course
    const deletedCourse = await courseName.findByIdAndDelete(courseId);
    
    if (!deletedCourse) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Course is deleted'
    });
    
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}