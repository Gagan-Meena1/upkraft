import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import feedbackViolin from '@/models/feedbackViolin';
import jwt from 'jsonwebtoken'

await connect();

export async function POST(request: NextRequest) {
    try {
      const url = new URL(request.url);
      const classId = url.searchParams.get("classId");
      const courseId = url.searchParams.get("courseId");
      const studentId = url.searchParams.get("studentId");
      
      // Validate IDs
      if (!classId || !courseId || !studentId) {
        return NextResponse.json({ 
          success: false, 
          error: 'Missing required parameters' 
        }, { status: 400 });
      }
      console.log("classId : ", classId);
      console.log("studentId : ", studentId);
      
      // Get token and instructor ID
      const token = request.cookies.get("token")?.value;
      const decodedToken = token ? jwt.decode(token) : null;
      const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
      
      // Parse JSON body instead of FormData
      const data = await request.json();
      
      // Extract fields from JSON
      const {
        postureAndInstrumentHold,
        bowingTechnique,
        intonationAndPitchAccuracy,
        toneQualityAndSoundProduction,
        rhythmMusicalityAndExpression,
        progressAndPracticeHabits,
        personalFeedback
      } = data;
      console.log("data : ", data);
      
      // Create feedback document
      const feedbackData = {
        userId: studentId,
        classId: classId,
        postureAndInstrumentHold: Number(postureAndInstrumentHold),
        bowingTechnique: Number(bowingTechnique),
        intonationAndPitchAccuracy: Number(intonationAndPitchAccuracy),
        toneQualityAndSoundProduction: Number(toneQualityAndSoundProduction),
        rhythmMusicalityAndExpression: Number(rhythmMusicalityAndExpression),
        progressAndPracticeHabits: Number(progressAndPracticeHabits),
        personalFeedback
      };
      
      const newFeedback = await feedbackViolin.create(feedbackData);
      const savedNewFeedback = await newFeedback.save();
      console.log("savedNewFeedback : ", savedNewFeedback);

      const updatedClass = await Class.findByIdAndUpdate(
              classId,
              { feedbackId: newFeedback._id },
              { new: true } // Return the updated document
            );
      
            if (!updatedClass) {
              return NextResponse.json({
                success: false,
                message: 'Class not found'
              }, { status: 404 });
            }
      
      return NextResponse.json({
        success: true,
        message: 'Violin feedback submitted successfully',
        data: newFeedback
      }, { status: 201 });
      
    } catch (error: any) {
      console.error('Error submitting violin feedback:', error);
      return NextResponse.json({
        success: false,
        message: error.message || 'Failed to submit drawing feedback',
        error: error.stack
      }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const courseId = url.searchParams.get("courseId");
        
        // Get token and verify instructor
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }
        
        const decodedToken = token ? jwt.decode(token) : null;
        const studentId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        
        if (!studentId) {
            return NextResponse.json({
                success: false,
                error: 'Invalid authentication token'
            }, { status: 401 });
        }
        
        // Validate required parameters
        if (!courseId) {
            return NextResponse.json({
                success: false,
                error: 'Course ID is required'
            }, { status: 400 });
        }
        
        // First, find all classes that belong to the specified course
        const classes = await Class.find({ course: courseId });
        
        if (!classes || classes.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No classes found for the specified course'
            }, { status: 404 });
        }
        
        // Extract class IDs
        const classIds = classes.map(cls => cls._id);
        
        // Construct query for finding feedback
        const query: any = { classId: { $in: classIds } };
        
        // Add studentId to query if provided
        if (studentId) {
            query.userId = studentId;
        }
        
        // Find feedback for all classes in the course
        const feedbackData = await feedbackViolin.find(query);
        const feedbackAllStudent = await feedbackViolin.find({ classId: { $in: classIds } });
        
        return NextResponse.json({
            success: true,
            count: feedbackData.length,
            data: feedbackData,
            feedbackAllStudent: feedbackAllStudent
        }, { status: 200 });
        
    } catch (error: any) {
        console.error('Error fetching violin feedback:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch violin feedback',
            error: error.stack
        }, { status: 500 });
    }
}