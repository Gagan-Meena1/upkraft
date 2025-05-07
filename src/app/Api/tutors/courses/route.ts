// app/api/tutor/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt  from 'jsonwebtoken';
import courseName from "@/models/courseName";
import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming JSON body
    connect();
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
        category: courseData.category
    });
        console.log(newCourse);
        const savednewCourse=await newCourse.save();
        const courses=await courseName.find({instructorId})
        await User.findByIdAndUpdate(instructorId,{$addToSet:{courses:savednewCourse._id}},{new:true})
    // TODO: Replace with your actual database or service call
    // For example, if using Prisma:
    // const newCourse = await prisma.course.create({
    //   data: courseData
    // });

    // Simulated successful course creation
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

    const courses = await courseName.find({ instructorId });

    return NextResponse.json({
      message: 'Courses retrieved successfully',
      course: courses
    }, { status: 200 });

  } catch (error) {
    console.error('Course retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve courses' }, 
      { status: 500 }
    );
  }
}