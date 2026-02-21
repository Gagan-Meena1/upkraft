import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import feedback from '@/models/feedback';
import jwt from 'jsonwebtoken';
import classQuality from '@/models/classQuality'
// import { getServerSession } from 'next-auth/next'; // If using next-auth
await connect();

export async function POST(request: NextRequest) {
    try {
      const url = new URL(request.url);
      const classId = url.searchParams.get("classId");
      const courseId = url.searchParams.get("courseId");
      const tutorId = url.searchParams.get("tutorId");
      
      // Validate IDs
      if (!classId || !courseId || !tutorId) {
        return NextResponse.json({ 
          success: false, 
          error: 'Missing required parameters' 
        }, { status: 400 });
      }
      
      // Parse JSON body instead of FormData
      const data = await request.json();
      
      // Extract fields from JSON
      const {
        classDuration,
        sessionFocusAreaStatedClearly,
        ContentDeliveredAligningToDriveSessionFocusArea,
        studentEngagement,
        studentPracticallyDemonstratedProgressOnConcept,
        tutorCommunicationTonality,
        KeyPerformance,
        personalFeedback
      } = data;
      
      console.log(" tutorId : ", tutorId);
      console.log(" classId : ", classId);
      
      // Prepare data object
      const classQualityData = {
        instructorId: tutorId,
        class: classId,
        classDuration: Number(classDuration),
        sessionFocusAreaStatedClearly: Number(sessionFocusAreaStatedClearly),
        ContentDeliveredAligningToDriveSessionFocusArea: Number(ContentDeliveredAligningToDriveSessionFocusArea),
        studentEngagement: Number(studentEngagement),
        studentPracticallyDemonstratedProgressOnConcept: Number(studentPracticallyDemonstratedProgressOnConcept),
        KeyPerformance: Number(KeyPerformance),
        tutorCommunicationTonality: Number(tutorCommunicationTonality),
        personalFeedback
      };
      
      // Find existing record with the same instructorId and classId
      const existingFeedback = await classQuality.findOne({ 
        instructorId: tutorId,
        class: classId
      });
      
      let result;
      
      if (existingFeedback) {
        // Update existing record
        result = await classQuality.findByIdAndUpdate(
          existingFeedback._id,
          classQualityData,
          { new: true } // Return the updated document
        );
        
        return NextResponse.json({
          success: true,
          message: 'Feedback updated successfully',
          data: result
        }, { status: 200 });
      } else {
        // Create new record
        result = await classQuality.create(classQualityData);
        
        return NextResponse.json({
          success: true,
          message: 'Feedback submitted successfully',
          data: result
        }, { status: 201 });
      }
    } catch (error) {
      console.error('Error processing feedback:', error);
      return NextResponse.json({
        success: false,
        message: 'Error processing feedback',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
}
export async function GET(request: NextRequest) {
    try {
        await connect();
        
        const url = new URL(request.url);
        const courseId = url.searchParams.get("courseId");
        const tutorId = url.searchParams.get("tutorId");
        console.log("courseId : ", courseId);
        console.log("tutord : ", tutorId);
        
        // Get token and verify instructor
        // const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
        // if (!token) {
        //     return NextResponse.json({
        //         success: false,
        //         error: 'Authentication required'
        //     }, { status: 401 });
        // }
        
        // const decodedToken = token ? jwt.decode(token) : null;
        // const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        
        // if (!instructorId) {
        //     return NextResponse.json({
        //         success: false,
        //         error: 'Invalid authentication token'
        //     }, { status: 401 });
        // }
        
        // Validate required parameters
        if (!courseId) {
            return NextResponse.json({
                success: false,
                error: 'Course ID is required'
            }, { status: 400 });
        }
        
        // First, find all classes that belong to the specified course
        const classes = await Class.find({ course: courseId }).exec();
        
        if (!classes || classes.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No classes found for the specified course'
            }, { status: 404 });
        }
        console.log("classes : ",classes);
        
        // Extract class IDs
        const classIds = classes.map(cls => cls._id);
        
        // Construct query for finding feedback
        const query: Record<string, any> = { class: { $in: classIds } };
        
        // Add studentId to query if provided
        // if (tutorId) {
        //     query.instructorId = tutorId;
        // }
        
        // Find feedback for specific student if studentId is provided
        const feedbackData = await classQuality.find(query).exec();
        console.log("feedbackData : ",feedbackData);
        
        // Get feedback for all students in these classes
        
        return NextResponse.json({
            success: true,
            count: feedbackData.length,
            data: feedbackData,
        }, { status: 200 });
        
    } catch (error: any) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch feedback',
            error: error.stack
        }, { status: 500 });
    }
}