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
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
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

    // Get studentIds from request body
    const body = await request.json();
    const { studentIds } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
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

    // Validate all studentIds format
    const invalidStudentIds = studentIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidStudentIds.length > 0) {
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

      // 2. Check if maxStudentCount would be exceeded
    const currentEnrolledCount = course.studentEnrolledCount || 0;
    const maxStudentCount = course.maxStudentCount || 0;

    const newStudentIds = studentIds.filter(id => 
      !course.students.some(existingId => existingId.toString() === id.toString())
    );
    
    if (newStudentIds.length === 0) {
      return NextResponse.json(
        { error: 'All selected students are already enrolled in this course' },
        { status: 400 }
      );
    }

    const newEnrolledCount = currentEnrolledCount + newStudentIds.length;

    if (maxStudentCount > 0 && newEnrolledCount > maxStudentCount) {
      const remainingSeats = maxStudentCount - currentEnrolledCount;
      return NextResponse.json(
        { 
          error: `Cannot enroll ${newStudentIds.length} students. Only ${remainingSeats} seat(s) remaining. Course capacity: ${maxStudentCount}` 
        },
        { status: 400 }
      );
    }

    // 2. Verify all students exist and belong to the academy
    const students = await User.find({
      _id: { $in: studentIds },
      category: 'Student',
      academyId: academyId
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'Some students not found or do not belong to your academy' },
        { status: 404 }
      );
    }

    // 3. Add students to course (avoid duplicates)
    const updatedCourse = await CourseName.findByIdAndUpdate(
      courseId,
      {
        $addToSet: { students: { $each: studentIds } },
        $inc: { studentEnrolledCount: newStudentIds.length } // Increment by number of NEW students

      },
      { new: true }
    );

      // 4. Get tutor IDs from the course
    const tutorIds = course.academyInstructorId || [];

    // 5. Add course to each student's courses array AND add tutors to instructorId array
    const updatePromises = studentIds.map(studentId =>
      User.findByIdAndUpdate(
        studentId,
        {
          $push: { 
            courses: courseId,
            instructorId: { $each: tutorIds }
          },
          $inc: { credits: course.credits }
        },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${studentIds.length} student(s) to the course`,
      data: {
        courseId: updatedCourse._id,
        courseTitle: updatedCourse.title,
        totalStudents: updatedCourse.students.length,
        newlyAssignedCount: studentIds.length
      }
    });

  } catch (error) {
    console.error('Error assigning students to course:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to assign students to course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connect();

    // Extract academy ID from token for authorization
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
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

    // Get studentIds from request body
    const body = await request.json();
    const { studentIds } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
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

    // Validate all studentIds format
    const invalidStudentIds = studentIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidStudentIds.length > 0) {
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

    // 2. Count how many students are actually enrolled (to avoid negative count)
    const actuallyEnrolledStudents = studentIds.filter(id =>
      course.students.some(existingId => existingId.toString() === id.toString())
    );

    if (actuallyEnrolledStudents.length === 0) {
      return NextResponse.json(
        { error: 'None of the selected students are enrolled in this course' },
        { status: 400 }
      );
    }

    // 2. Get tutor IDs from the course
    const tutorIds = course.academyInstructorId || [];

    // 3. Remove students from course (THIS WAS MISSING!)
    const updatedCourse = await CourseName.findByIdAndUpdate(
      courseId,
      {
        $pull: { students: { $in: studentIds } },
        $inc: { studentEnrolledCount: -actuallyEnrolledStudents.length } // Decrement by number of students removed

      },
      { new: true }
    );

    // 4. Remove course from each student's courses array AND remove tutors from instructorId array (only one occurrence each)
    const updatePromises = studentIds.map(async (studentId) => {
      const student = await User.findById(studentId);
      if (!student) return;

      // Remove only one occurrence of each tutor from instructorId array
      let updatedInstructorIds = [...student.instructorId];
      
      tutorIds.forEach(tutorId => {
        const index = updatedInstructorIds.findIndex(id => id.toString() === tutorId.toString());
        if (index !== -1) {
          updatedInstructorIds.splice(index, 1);
        }
      });

      // Update student: remove course and update instructorId
      await User.findByIdAndUpdate(
        studentId,
        {
          $pull: { courses: courseId },
          instructorId: updatedInstructorIds,
          $inc: { credits: -course.credits }
        },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${studentIds.length} student(s) from the course`,
      data: {
        courseId: updatedCourse._id,
        courseTitle: updatedCourse.title,
        totalStudents: updatedCourse.students.length,
        removedCount: studentIds.length
      }
    });

  } catch (error) {
    console.error('Error removing students from course:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to remove students from course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}