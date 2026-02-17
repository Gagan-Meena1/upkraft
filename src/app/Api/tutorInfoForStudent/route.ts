import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import courseName from '@/models/courseName';
import jwt from 'jsonwebtoken';

await connect();

export async function GET(request: NextRequest) {
  try {
    console.log("=== Fetching courses for multiple tutors ===");

    const url = new URL(request.url);
    const tutorIdsParam = url.searchParams.get("tutorId"); // Changed from tutorId to tutorIds

    if (!tutorIdsParam) {
      return NextResponse.json(
        { message: 'tutorIds parameter is required' },
        { status: 400 }
      );
    }

    // Split comma-separated tutorIds and filter out empty strings
    const tutorIds = tutorIdsParam.split(',').filter(id => id.trim());

    if (tutorIds.length === 0) {
      return NextResponse.json(
        { message: 'No valid tutor IDs provided' },
        { status: 400 }
      );
    }

    console.log("[ tutorIds : ]", tutorIds);

    // Optional: Get current user from token (if needed for authorization)
    const token = request.cookies.get("token")?.value;
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
    console.log("decodedToken : ", decodedToken);
    console.log("instructorId : ", instructorId);

    // Fetch all tutors and filter by category "Tutor"
    const tutors = await User.find({
      _id: { $in: tutorIds },
      category: "Tutor" // ✅ Only fetch users with category "Tutor"
    }).select("-password");

    if (tutors.length === 0) {
      return NextResponse.json({
        message: 'No tutors found with the provided IDs',
        tutors: [],
        courses: []
      }, { status: 200 });
    }

    // Get only the valid tutor IDs (those that are actually tutors)
    const validTutorIds = tutors.map(tutor => tutor._id);

    console.log("Valid Tutor IDs:", validTutorIds);

    // Fetch courses for all valid tutors
    // This includes both instructorId and academyInstructorId
    const courses = await courseName.find({
      $or: [
        { instructorId: { $in: validTutorIds } },
        { academyInstructorId: { $in: validTutorIds } }
      ]
    });

    console.log(`Found ${courses.length} courses for ${tutors.length} tutors`);

    // ✅ Optional: Group courses by tutor for easier frontend consumption
    const tutorCoursesMap = tutors.map(tutor => {
      const tutorCourses = courses.filter(course => 
        course.instructorId.toString() === tutor._id.toString() ||
        (course.academyInstructorId && course.academyInstructorId.some(
          (id: any) => id.toString() === tutor._id.toString()
        ))
      );

      return {
        tutorId: tutor._id,
        tutorName: tutor.username,
        tutorEmail: tutor.email,
        tutorCity: tutor.city,
        tutorProfileImage: tutor.profileImage,
        courses: tutorCourses
      };
    });

    return NextResponse.json({
      message: 'Sessions sent successfully',
      tutors, // All tutor details
      courses, // All courses (flat array)
      tutorCoursesMap, // ✅ Grouped by tutor (easier to use)
      summary: {
        totalTutors: tutors.length,
        totalCourses: courses.length,
        requestedTutorIds: tutorIds.length,
        validTutorIds: validTutorIds.length
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}