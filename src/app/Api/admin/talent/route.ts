// app/api/assignments/create/route.js
import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import talent from '@/models/talent'
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { log } from 'console';

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Parse the FormData
    const formData = await request.formData();
    
    // Extract data from the form
    const recommendation = formData.get('recommendation');
    const studentId = formData.get('studentId');
    const assignmentFile = formData.get('assignmentFile');
    
    // Validate required fields
    console.log("studentId : ", studentId);
    console.log("11111111111111111111111111111111111111111111111111111");
    
    if ( !recommendation  || !studentId ) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }
    console.log("2222222222222222222222222222222222222222222222222222222222");
    
    // Create assignment object (without file info initially)
    const assignmentData = {
      recommendation,
      studentId,
      
    };
    console.log("333333333333333333333333333333333333333333333333333333333");
    
    // Handle file upload if present
    if (assignmentFile instanceof File && assignmentFile.size > 0) {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'assignments');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Error creating uploads directory:', error);
      }
      console.log("444444444444444444444444444444444444444444444444");
      
      // Generate unique filename to prevent overwrites
      const fileName = `${Date.now()}-${assignmentFile.name}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Create buffer from file
      const fileBuffer = Buffer.from(await assignmentFile.arrayBuffer());
      console.log("55555555555555555555555555555555555555555555555555");
      
      // Write file to server
      await writeFile(filePath, fileBuffer);
      
      // Update assignment data with file info
      assignmentData.fileUrl = `/uploads/talent/${fileName}`;
      assignmentData.fileName = assignmentFile.name;
    }
    
    console.log("55555555555555555555555555555555555555555555555556");
    
    // Create new assignment in database
    const assignment = await talent.create(assignmentData);
    console.log("55555555555555555555555555555555555555555555555557");
    
    
    
    return NextResponse.json({
      success: true,
      data: assignment
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error in assignment creation:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error creating assignment'
    }, { status: 500 });
  }
}


export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // Get studentId from URL search parameters
    const { searchParams } = new URL(request.url);
    let studentId = searchParams.get('studentId');
    
   // Determine instructor ID from request or token
      let instructorId;
      if (!studentId) {
     
        const token = request.cookies.get("token")?.value;
        const decodedToken = token ? jwt.decode(token) : null;
        instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        studentId=instructorId;
      }
    console.log("studentId : ",studentId);
    
    // Validate if studentId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid Student ID format'
      }, { status: 400 });
    }
    
    // Find talent document by studentId
    const talentDocument = await talent.findOne({ 
      studentId: new mongoose.Types.ObjectId(studentId) 
    });
    
    if (!talentDocument) {
      return NextResponse.json({
        success: false,
        message: 'No talent document found for this student'
      }, { status: 404 });
    }
    console.log("talentDocument : ",talentDocument);
    
    return NextResponse.json({
      success: true,
      data: talentDocument
    }, { status: 200 });
    
  } catch (error:any) {
    console.error('Error fetching talent document:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error fetching talent document'
    }, { status: 500 });
  }
}