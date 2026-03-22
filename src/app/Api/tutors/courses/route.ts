// app/api/tutors/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import courseName from "@/models/courseName";
import { connect } from '@/dbConnection/dbConfic'
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
      const token = (() => {
        const referer = request.headers.get("referer") || "";
        let refererPath = "";
        try { if (referer) refererPath = new URL(referer).pathname; } catch (e) { }
        const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
        return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
      })();
      const decodedToken = token ? jwt.decode(token) : null;
      instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    }
    const user = await User.findById(instructorId);

    const newCourse = new courseName({
      title: courseData.title,
      description: courseData.description,
      instructorId: instructorId,
      duration: courseData.duration,
      price: courseData.price,
      curriculum: courseData.curriculum,
      category: courseData.category,
      subCategory: courseData?.subCategory || '',
      maxStudentCount: courseData?.maxStudentCount,
      credits: courseData?.credits || 0,
      tag: courseData?.tag || '',

    });
    const savednewCourse = await newCourse.save();
    const courses = await courseName.find({ instructorId })
    await User.findByIdAndUpdate(instructorId, { $addToSet: { courses: savednewCourse._id } }, { new: true })


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
    await connect();

    const url = new URL(request.url);
    const tutorId = url.searchParams.get("tutorId");
    const searchQuery = url.searchParams.get("search") || "";
    const page = Number(url.searchParams.get("page"));
    const pageLength = Number(url.searchParams.get("pageLength"));
    const startedFrom = url.searchParams.get("startedFrom") || ""; // e.g. "26-02-2025"

    // Get instructorId
    let instructorId;
    if (tutorId) {
      instructorId = tutorId;
    } else {
      const token = (() => {
        const referer = request.headers.get("referer") || "";
        let refererPath = "";
        try { if (referer) refererPath = new URL(referer).pathname; } catch (e) { }
        const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
        return (isTutorContext && request.cookies.get("impersonate_token")?.value)
          ? request.cookies.get("impersonate_token")?.value
          : request.cookies.get("token")?.value;
      })();
      const decodedToken = token ? jwt.decode(token) : null;
      instructorId =
        decodedToken && typeof decodedToken === "object" && "id" in decodedToken
          ? decodedToken.id
          : null;
    }

    if (!instructorId) {
      return NextResponse.json({ error: "Instructor ID is required" }, { status: 400 });
    }

    const instructor = await User.findById(instructorId).select(
      "academyId category courses creditsPerCourse"
    );

    // Base query
    const query: any = {
      $or: [
        { instructorId: instructorId },
        { _id: { $in: instructor?.courses || [] } },
      ],
    };

    // Search filter
    if (searchQuery.trim()) {
      query.$and = [{ title: { $regex: searchQuery.trim(), $options: "i" } }];
    }

    // startedFrom filter — format expected: "DD-MM-YYYY"
    // startedFrom filter — handles both "YYYY-MM-DD" (native date input) and "DD-MM-YYYY"
    if (startedFrom.trim()) {
      let parsedDate: Date;

      if (/^\d{4}-\d{2}-\d{2}$/.test(startedFrom.trim())) {
        // YYYY-MM-DD format (native <input type="date">)
        parsedDate = new Date(`${startedFrom.trim()}T00:00:00.000Z`);
      } else if (/^\d{2}-\d{2}-\d{4}$/.test(startedFrom.trim())) {
        // DD-MM-YYYY format
        const [day, month, year] = startedFrom.trim().split("-");
        parsedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      } else {
        parsedDate = new Date(NaN); // invalid, will be skipped
      }

      if (!isNaN(parsedDate.getTime())) {
        if (!query.$and) query.$and = [];
        query.$and.push({ createdAt: { $gte: parsedDate } });
      }
    }

    let coursesQuery = courseName.find(query);
    let paginationMeta = null;

    if (
      Number.isInteger(page) && Number.isInteger(pageLength) &&
      page > 0 && pageLength > 0
    ) {
      const skip = (page - 1) * pageLength;
      coursesQuery = coursesQuery.skip(skip).limit(pageLength);

      const totalCount = await courseName.countDocuments(query);
      paginationMeta = {
        page,
        pageLength,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLength),
      };
    }

    const courses = await coursesQuery;

    return NextResponse.json(
      {
        message: "Courses retrieved successfully",
        course: courses,
        academyId: instructor?.academyId || null,
        category: instructor?.category || null,
        creditsPerCourse: instructor?.creditsPerCourse || [],
        ...(paginationMeta && { pagination: paginationMeta }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Course retrieval error:", error);
    return NextResponse.json({ error: "Failed to retrieve courses" }, { status: 500 });
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