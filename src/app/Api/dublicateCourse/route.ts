// app/api/tutors/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt  from 'jsonwebtoken';
import courseName from "@/models/courseName";
import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming JSON body
    await connect();
    const courseData = await request.json();
    const url = new URL(request.url);
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
      const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
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
        // const courses=await courseName.find({instructorId})
        // await User.findByIdAndUpdate(instructorId,{$addToSet:{courses:savednewCourse._id}},{new:true})
    // TODO: Replace with your actual database or service call
    // For example, if using Prisma:
    // const newCourse = await prisma.course.create({
    //   data: courseData
    // });

    // Simulated successful course creation
    console.log("22222222222222222222222222");

    return NextResponse.json({
      message: 'Course created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' }, 
      { status: 500 }
    );
  }
}