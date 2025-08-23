// Import required modules
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import courseName from "@/models/courseName";

// Connect to database
connect();

export async function POST(req: NextRequest) {
  try {
    // Extract data from request body
    const requestData = await req.json();
    const { courseId, studentId, tutorId } = requestData;
    console.log("requestData:", requestData);

    // Determine instructor ID from request or token
    let instructorId;
    if (tutorId) {
      instructorId = tutorId;
    } else {
      const token = req.cookies.get("token")?.value;
      const decodedToken = token ? jwt.decode(token) : null;
      instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    }

    console.log("API Details:");
    console.log("URL:", req.url);
    console.log("courseId:", courseId);
    console.log("studentId:", studentId);
    console.log("instructorId:", instructorId);

    // Validate required data
    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if course exists and get its class IDs
    const course = await courseName.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get all class IDs for this course to remove them
    const classIdsToRemove = course.class || [];
    console.log("Classes to remove:", classIdsToRemove);

    // Remove course from student's courses array and remove course's classes
    await User.findByIdAndUpdate(
      studentId,
      {
        $pull: {
          courses: courseId,
          classes: { $in: classIdsToRemove }
        }
      }
    );

    // Get updated student data with remaining courses
    const updatedStudent = await User.findById(studentId);
    const remainingCourseIds = updatedStudent.courses || [];

    // Get all remaining course details to find valid instructor IDs
    const remainingCourses = await courseName.find({
      _id: { $in: remainingCourseIds }
    });

    // Extract all valid instructor IDs from remaining courses
    const validInstructorIds = [];
    remainingCourses.forEach(course => {
      if (course.instructorId) {
        validInstructorIds.push(course.instructorId.toString());
      }
    });

    // Remove duplicate instructor IDs
    const uniqueValidInstructorIds = [...new Set(validInstructorIds)];
    console.log("Valid instructor IDs from remaining courses:", uniqueValidInstructorIds);

    // Update student's instructors array to keep only valid ones
    await User.findByIdAndUpdate(
      studentId,
      {
        $set: {
          instructorId: uniqueValidInstructorIds
        }
      }
    );

    // // Remove student from instructor's arrays if instructorId is provided
    // if (instructorId) {
    //   // Check if this instructor still has other courses with this student
    //   const instructorCoursesWithStudent = remainingCourses.filter(
    //     course => course.instructorId && course.instructorId.toString() === instructorId.toString()
    //   );

    //   // If no remaining courses with this instructor, remove student from instructor's arrays
    //   if (instructorCoursesWithStudent.length === 0) {
    //     await User.findByIdAndUpdate(
    //       instructorId,
    //       {
    //         $pull: {
    //           students: studentId,
    //           courses: courseId,
    //           classes: { $in: classIdsToRemove }
    //         }
    //       }
    //     );
    //     console.log(`Removed student ${studentId} from instructor ${instructorId}`);
    //   } else {
    //     // Still have other courses together, just remove this specific course and its classes
    //     await User.findByIdAndUpdate(
    //       instructorId,
    //       {
    //         $pull: {
    //           courses: courseId,
    //           classes: { $in: classIdsToRemove }
    //         }
    //       }
    //     );
    //     console.log(`Removed course ${courseId} from instructor ${instructorId}, but kept student relationship`);
    //   }
    // }

    // Get final updated student data
    const finalUpdatedStudent = await User.findById(studentId);

    // Prepare response data
    const responseData = {
      success: true,
      message: "Course removed successfully",
      student: {
        id: finalUpdatedStudent._id,
        name: finalUpdatedStudent.name,
        email: finalUpdatedStudent.email,
        courses: finalUpdatedStudent.courses,
        instructorId: finalUpdatedStudent.instructorId,
        classes: finalUpdatedStudent.classes
      },
      removedCourse: {
        id: courseId,
        name: course.name,
        removedClasses: classIdsToRemove
      },
      remainingValidInstructors: uniqueValidInstructorIds
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("Error removing course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}