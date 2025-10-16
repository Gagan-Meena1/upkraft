// app/api/courses/performance-score/route.js
import { NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import mongoose from 'mongoose';
import courseName from '@/models/courseName';   
export async function POST(request) {
  try {
    await connect();
    console.log('🚀 Starting performance score submission...');
    
    const body = await request.json();
    const { courseId, studentId, score } = body;
    
    console.log('📊 Received data:', { courseId, studentId, score });
    
    // Validate required fields
    if (!courseId) {
      return NextResponse.json({ 
        error: 'Course ID is required' 
      }, { status: 400 });
    }
    
    if (!studentId) {
      return NextResponse.json({ 
        error: 'Student ID is required' 
      }, { status: 400 });
    }
    
    if (score === undefined || score === null) {
      return NextResponse.json({ 
        error: 'Performance score is required' 
      }, { status: 400 });
    }
    
 
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ 
        error: 'Invalid course ID format' 
      }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ 
        error: 'Invalid student ID format' 
      }, { status: 400 });
    }
    
    // Find the course
    const course = await courseName.findById(courseId);
    if (!course) {
      console.log(`❌ Course not found: ${courseId}`);
      return NextResponse.json({ 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Found course: "${course.title}"`);
    
    // Check if student already has a performance score for this course
    const existingScoreIndex = course.performanceScores.findIndex(
      ps => ps.userId.toString() === studentId
    );
    
    const performanceEntry = {
      userId: new mongoose.Types.ObjectId(studentId),
      score: score,
      date: new Date()
    };
    
    if (existingScoreIndex !== -1) {
      // Update existing score
      course.performanceScores[existingScoreIndex] = performanceEntry;
      console.log(`🔄 Updated existing performance score for student ${studentId}`);
    } else {
      // Add new score
      course.performanceScores.push(performanceEntry);
      console.log(`➕ Added new performance score for student ${studentId}`);
    }
    
    // Save the updated course
    const updatedCourse = await course.save();
    console.log('💾 Performance score saved successfully');
    
    // Get the saved performance score for response
    const savedScore = updatedCourse.performanceScores.find(
      ps => ps.userId.toString() === studentId
    );
    
    return NextResponse.json({
      success: true,
      message: existingScoreIndex !== -1 ? 'Performance score updated successfully' : 'Performance score added successfully',
      data: {
        courseId: courseId,
        courseName: course.title,
        studentId: studentId,
        performanceScore: {
          score: savedScore.score,
          date: savedScore.date,
          id: savedScore._id
        },
        totalStudentsWithScores: updatedCourse.performanceScores.length,
        isUpdate: existingScoreIndex !== -1
      }
    });
    
  } catch (error) {
    console.error('💥 Server error:', error);
    return NextResponse.json(
      { 
        error: 'Server error while saving performance score',
        details: error?.message || 'Unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}