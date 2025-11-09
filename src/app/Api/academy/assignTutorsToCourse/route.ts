import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import CourseName from '@/models/courseName'; 
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connect();

    // Extract academy ID from token for authorization
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const decodedToken = jwt.decode(token);
    const academyId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken 
      ? decodedToken.id 
      : null;

    if (!academyId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get courseId from query params
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get tutorIds from request body
    const body = await request.json();
    const { tutorIds } = body;

    if (!tutorIds || !Array.isArray(tutorIds) || tutorIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate courseId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    // Validate all tutorIds format
    const invalidtutorIds = tutorIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidtutorIds.length > 0) {
      return NextResponse.json(
        { error: 'Invalid student ID format(s)' },
        { status: 400 }
      );
    }

    // 1. Find the course and verify it exists
    const course = await CourseName.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // 2. Verify all tutors exist and belong to the academy
    const tutors = await User.find({
      _id: { $in: tutorIds },
      category: 'Tutor',
      academyId: academyId
    });

    if (tutors.length !== tutorIds.length) {
      return NextResponse.json(
        { error: 'Some tutors not found or do not belong to your academy' },
        { status: 404 }
      );
    }

    // 3. Add tutors to course (avoid duplicates)
    const updatedCourse = await CourseName.findByIdAndUpdate(
      courseId,
      {
        $addToSet: { academyInstructorId: { $each: tutorIds } }
      },
      { new: true }
    );

      // 4. Get all students enrolled in this course
    const studentIds = course.students || [];

    if (studentIds.length > 0) {
      // 5. Add tutorIds to each student's instructorId array (avoid duplicates)
      await User.updateMany(
        {
          _id: { $in: studentIds },
          category: 'Student'
        },
        {
          $addToSet: { instructorId: { $each: tutorIds } }
        }
      );
    }

    // 6. Add course to each tutor's courses array (avoid duplicates)
    const updatePromises = tutorIds.map(tutorId =>
      User.findByIdAndUpdate(
        tutorId,
        {
          $addToSet: { courses: courseId }
        },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${tutorIds.length} student(s) to the course`,
      data: {
        courseId: updatedCourse._id,
        courseTitle: updatedCourse.title,
        totaltutors: updatedCourse.academyInstructorId.length,
        newlyAssignedCount: tutorIds.length
      }
    });

  } catch (error) {
    console.error('Error assigning tutors to course:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to assign tutors to course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}