import { NextResponse, NextRequest } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { connect } from '@/dbConnection/dbConfic';
import courseName from '@/models/courseName';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken'
// import { getServerSession } from 'next-auth/next'; // If using next-auth
await connect();
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tutorId = url.searchParams.get('tutorId');
    console.log("tutorId : ",tutorId);
    
    let instructorId;
        if (tutorId) {
          instructorId = tutorId;
        } else {
          const token = request.cookies.get("token")?.value;
          const decodedToken = token ? jwt.decode(token) : null;
          instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        }
    
    const courses=await courseName.find({instructorId:instructorId});
    
    const users = await User.find({
      category: "Student", // Only return students
      $or: [
        { courses: { $in: courses } }, // Students with at least one course from the list
        { instructorId: instructorId }   // Students with the instructor ID
      ]
    });       if(!users) {
      console.error('Error finding users:');
    }
  //  console.log(users);
   
    const filteredUsers = users.map(user => {
        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          contact: user.contact
          // Add any other fields you want to include
        };
      });
   
    

    // console.log(filteredUsers);
    return NextResponse.json({
      message: 'Session sent successfully',
      filteredUsers
    }, { status: 201 });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Connect to database
     await connect();

    // Get the studentId from the URL search params
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


