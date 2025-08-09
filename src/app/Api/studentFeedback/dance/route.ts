import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import feedbackDance from '@/models/feedbackDance';
import jwt from 'jsonwebtoken'
// import { getServerSession } from 'next-auth/next'; // If using next-auth
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
      console.log("classId : ",classId);
      console.log("studentId : ",studentId);
      
      // Get token and instructor ID
      const token = request.cookies.get("token")?.value;
      const decodedToken = token ? jwt.decode(token) : null;
      const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
      
      // Parse JSON body instead of FormData
      const data = await request.json();
      
      // Extract fields from JSON
      const {
        musicality,
        performance,
        technique,
        retention,
        effort,
        feedback: personalFeedback
      } = data;
      console.log("data : ",data);
      
      // Create feedback document
      const feedbackData = {
        userId: studentId,
        classId: classId,
        musicality: Number(musicality),
        retention: Number(retention),
        effort: Number(effort),
        performance: Number(performance),
        technique: Number(technique),
        personalFeedback
      };
      
      const newFeedback = await feedbackDance.create(feedbackData);
     const savednewFeedback= await newFeedback.save();
      console.log(" savednewFeedback : ",savednewFeedback);

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
        message: 'Feedback submitted successfully',
        data: newFeedback
      }, { status: 201 });
      
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      return NextResponse.json({
        success: false,
        message: error.message || 'Failed to submit feedback',
        error: error.stack
      }, { status: 500 });
    }
  }
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const courseId = url.searchParams.get("courseId");
        // const studentId = url.searchParams.get("studentId");
        
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
        const feedbackData = await feedbackDance.find(query)
            // .populate('userId', 'username email') // Populate student details
            // .populate('classId', 'title startTime') // Populate class details
            // .lean();
            const feedbackAllStudent=await feedbackDance.find({ classId: { $in: classIds } })
        
        return NextResponse.json({
            success: true,
            count: feedbackData.length,
            data: feedbackData,
            feedbackAllStudent:feedbackAllStudent
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