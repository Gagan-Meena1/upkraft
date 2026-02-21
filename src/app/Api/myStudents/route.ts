import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import courseName from '@/models/courseName';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

await connect();

export async function GET(request: NextRequest) {
  try {
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    let tutorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
    const url = new URL(request.url);
    const tutorIdParam = url.searchParams.get('tutorId');
    if (tutorIdParam) {
      tutorId = tutorIdParam;
    }
    
    const email = url.searchParams.get('email');
    console.log("tutorId:", tutorId);
    console.log("email:", email);
    
    if (!tutorId) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized - Please log in again"
      }, { status: 401 });
    }
    
    if (email) {
      const user = await User.findOne({
        email: { $regex: `^${email}$`, $options: 'i' },
        category: "Student"
      })
      .select('username email contact instructorId city profileImage assignment courses _id')
      .populate({
        path: 'courses',
        select: 'title category duration price courseQuality performanceScores instructorId',
        populate: [
          {
            path: 'instructorId',
            select: 'username email'
          },
          {
            path: 'performanceScores.userId',
            select: 'username email'
          }
        ]
      });
      
      // Check if student is already in tutor's list
      const isAlreadyAdded = user?.instructorId?.includes(tutorId);
      
      return NextResponse.json({
        success: true,
        user: user ? {
          username: user.username,
          email: user.email,
          contact: user.contact,
          city: user.city,
          profileImage: user.profileImage,
          assignment: user.assignment,
          _id: user._id,
          courses: user.courses,
          isAlreadyAdded
        } : null
      });
    }
    
  //   const tutor = await User.findById(tutorId);
  //   const tutorCourses = await courseName.find({ instructorId: tutorId });
  //   const courseIds = tutorCourses.map(course => course._id);
    
  //   const users = await User.find({
  //     category: "Student",
  //     $or: [
  //       { courses: { $in: courseIds } },
  //       { instructorId: tutorId }
  //     ]
  //   })
  //   .select('username email contact city profileImage assignment courses _id')
  //   .populate({
  //     path: 'courses',
  //     select: 'title category duration price courseQuality performanceScores instructorId',
  //     populate: [
  //       {
  //         path: 'instructorId',
  //         select: 'username email'
  //       },
  //       {
  //         path: 'performanceScores.userId',
  //         select: 'username email'
  //       }
  //     ]
  //   });
    
  //   if (!users || users.length === 0) {
  //     return NextResponse.json({ 
  //       success: true,
  //       message: 'No students found',
  //       filteredUsers: [],
  //       userCount: 0,
  //       academyId: tutor?.academyId || null
  //     });
  //   }
    
  //   const filteredUsers = users.map(user => ({
  //     _id: user._id,
  //     username: user.username,
  //     email: user.email,
  //     contact: user.contact,
  //     profileImage: user.profileImage,
  //     city: user.city,
  //     assignment: user.assignment,
  //     courses: user.courses,
  //   }));
    
  //   return NextResponse.json({
  //     success: true,
  //     message: filteredUsers.length > 0 ? 'Students fetched successfully' : 'No students found',
  //     filteredUsers,
  //     userCount: filteredUsers.length,
  //     academyId: tutor?.academyId || null,
  //     assignmentPending: tutor?.assignmentPending || 0
  const tutor = await User.findById(tutorId).select('academyId pendingAssignments');
const tutorCourses = await courseName.find({ instructorId: tutorId });
const courseIds = tutorCourses.map(course => course._id);

const users = await User.find({
  category: "Student",
  $or: [
    { courses: { $in: courseIds } },
    { instructorId: tutorId }
  ]
})
.select('username email contact city profileImage assignment courses _id')
.populate({
  path: 'courses',
  select: 'title category duration price courseQuality performanceScores instructorId',
  populate: [
    {
      path: 'instructorId',
      select: 'username email'
    },
    {
      path: 'performanceScores.userId',
      select: 'username email'
    }
  ]
});

if (!users || users.length === 0) {
  return NextResponse.json({ 
    success: true,
    message: 'No students found',
    filteredUsers: [],
    userCount: 0,
    academyId: tutor?.academyId || null
  });
}
  //   });
  const pendingAssignmentsMap = new Map();

if (tutor?.pendingAssignments && Array.isArray(tutor.pendingAssignments)) {
  tutor.pendingAssignments.forEach((pending: any) => {
    const studentId = pending.studentId.toString();
    const pendingCount = pending.assignmentIds?.length || 0;
    pendingAssignmentsMap.set(studentId, pendingCount);
  });
}

// Map users and add pendingAssignments count
const filteredUsers = users.map(user => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  contact: user.contact,
  profileImage: user.profileImage,
  city: user.city,
  assignment: user.assignment,
  courses: user.courses,
  pendingAssignments: pendingAssignmentsMap.get(user._id.toString()) || 0
}));

return NextResponse.json({
  success: true,
  message: filteredUsers.length > 0 ? 'Students fetched successfully' : 'No students found',
  filteredUsers,
  userCount: filteredUsers.length,
  academyId: tutor?.academyId || null
});
    
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch students. Please try again.'
    }, { status: 500 });
  }
  
}

export async function DELETE(request: NextRequest) {
  try {
    // Connect to database
     await connect();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    // Validate studentId
    if (!studentId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Student ID is required' 
        },
        { status: 400 }
      );
    }

    // Find and delete the student
    const deletedStudent = await User.findByIdAndDelete(studentId);

    if (!deletedStudent) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Student not found' 
        },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Student removed successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting student:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error. Failed to delete student.' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();

    // Get tutor ID from token
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    const tutorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;

    if (!tutorId) {
      console.log("tutorId not found");
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized - Tutor not found" 
      }, { status: 401 });
    }

    // Get student email from request body
    const { email } = await request.json();
    
    // Find the student
    const student = await User.findOne({ 
      email: { $regex: `^${email}$`, $options: 'i' } 
    });

    const instructor = await User.findById(tutorId);


    if (!student) {
      console.log("student not found");
      return NextResponse.json({ 
        success: false, 
        error: "Student not found" 
      }, { status: 404 });
    }

    // Check if tutor is already in student's instructorId array
    if (student.instructorId?.includes(tutorId)) {
      console.log("student is already in your list");
      return NextResponse.json({
        success: false,
        error: "Student is already in your list"
      });
    }

    // Add tutor to student's instructorId array
    await User.findByIdAndUpdate(
      student._id,
      { $push: { instructorId: tutorId } },
      { new: true }
    );

    if (instructor.category == "Academic") {
      await User.findByIdAndUpdate(
        student._id,
        { $set: { academyId: tutorId } },
        { new: true }
      );
    }

    await User.findByIdAndUpdate(
      tutorId,
      { $push: { students: student._id } },
      { new: true }
    );



    return NextResponse.json({
      success: true,
      message: "Student added to your list successfully",
      student: {
        _id: student._id,
        username: student.username,
        email: student.email,
        contact: student.contact
      }
    });

  } catch (error: any) {
    console.error("Error adding student:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to add student" 
    }, { status: 500 });
  }
}


