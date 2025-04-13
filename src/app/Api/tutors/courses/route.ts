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

    // Validate input (you'd want more robust validation)
    if (!courseData.title || !courseData.description) {
      return NextResponse.json(
        { error: 'Title and description are required' }, 
        { status: 400 }
      );
    }
        const token = request.cookies.get("token")?.value;
        const decodedToken = token ? jwt.decode(token) : null;
        const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;

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
      // Parse the incoming JSON body
      connect();
    //   const courseData = await request.json();
  
      // Validate input (you'd want more robust validation)
    //   if (!courseData.title || !courseData.description) {
    //     return NextResponse.json(
    //       { error: 'Title and description are required' }, 
    //       { status: 400 }
    //     );
    //   }
          const token = request.cookies.get("token")?.value;
          const decodedToken = token ? jwt.decode(token) : null;
          const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
  
         const user=await User.findById(instructorId);
        //  console.log("111111111111111111111111");
  
    //      console.log(courseData);
  
    //      const newCourse = new courseName({
    //       title: courseData.title,
    //       description: courseData.description,
    //       instructorId:instructorId,
    //       duration: courseData.duration,
    //       price: courseData.price,
    //       curriculum: courseData.curriculum
    //   });
    //       console.log(newCourse);
        //   const savednewCourse=await newCourse.save();
          const courses=await courseName.find({instructorId})
  
      // TODO: Replace with your actual database or service call
      // For example, if using Prisma:
      // const newCourse = await prisma.course.create({
      //   data: courseData
      // });
  
      // Simulated successful course creation
      console.log(courses);
      
      // console.log("22222222222222222222222222");
  
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