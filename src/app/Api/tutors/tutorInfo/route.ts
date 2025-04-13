// src/app/Api/classes/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import courseName from '@/models/courseName';
import jwt from 'jsonwebtoken'
// import { getServerSession } from 'next-auth/next'; // If using next-auth
await connect();

export async function GET(request: NextRequest) {
  try {
    console.log("1111111111111111111111111111111111111111111111111111111111111111111");

    const token = request.cookies.get("token")?.value;
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    console.log("decodedToken : ",decodedToken);
    console.log("instructorId : ",instructorId);
    
    const tutor=await User.findById(instructorId).select("-password");
    const courses=await courseName.find({instructorId:instructorId})
    

    console.log(tutor);
    console.log(courses);
    return NextResponse.json({
      message: 'Session sent successfully',
      tutor,
      courses
    }, { status: 201 });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}