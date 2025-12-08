import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import feedbackDrawing from '@/models/feedbackDrawing';
import jwt from 'jsonwebtoken'
import courseName from '@/models/courseName';
import User  from '@/models/userModel';
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
             
      // Get token and instructor ID
      const token = request.cookies.get("token")?.value;
      const decodedToken = token ? jwt.decode(token) : null;
      const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
             
      // Parse JSON body instead of FormData
      const data = await request.json();
             
      // Extract fields from JSON
      const {
        observationalSkills,
        lineQuality,
        proportionPerspective,
        valueShading,
        compositionCreativity,
        personalFeedback
      } = data;

      const {attendanceStatus} = data;

      const user= await User.findById(studentId);
     // Check if attendance record exists for this class
    const attendanceIndex = user.attendance.findIndex(
      (att) => att.classId.toString() === classId
    );

    if (attendanceIndex !== -1) {
      // Update existing attendance record
      user.attendance[attendanceIndex].status = status;
    } else {
      // Create new attendance record
      user.attendance.push({
        classId: classId,
        status: attendanceStatus
      });
    }

    // Save the updated user
    await user.save();
             
      // Create feedback document
      const feedbackData = {
        userId: studentId,
        classId: classId,
        observationalSkills: Number(observationalSkills),
        lineQuality: Number(lineQuality),
        proportionPerspective: Number(proportionPerspective),
        valueShading: Number(valueShading),
        compositionCreativity: Number(compositionCreativity),
        feedback: personalFeedback
      };
             
      const newFeedback = await feedbackDrawing.create(feedbackData);
      
      // Update the Class document with the feedback ID
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
              // Step 1: Get all classes for this course
      const course = await courseName.findById(courseId).populate('class');
      
      if (!course) {
        return NextResponse.json({
          success: false,
          message: 'Course not found'
        }, { status: 404 });
      }

      // Step 2: Get all class IDs for this course
      const classIds = course.class.map((cls: any) => cls._id);

      // Step 3: Get all feedbacks for this student across all classes in this course
      const studentFeedbacks = await feedbackDrawing.find({
        userId: studentId,
        classId: { $in: classIds }
      });

    // Step 4: Calculate average score
      if (studentFeedbacks.length > 0) {
        const totalScores = studentFeedbacks.reduce((acc, fb) => {
          // Convert string values to numbers, defaulting to 0 if invalid
          const observationalSkillsScore = Number(fb.observationalSkills) || 0;
          const lineQualityScore = Number(fb.lineQuality) || 0;
          const proportionPerspectiveScore = Number(fb.proportionPerspective) || 0;
          const valueShadingScore = Number(fb.valueShading) || 0;
          const compositionCreativityScore = Number(fb.compositionCreativity) || 0;
          
          return acc + 
            observationalSkillsScore + 
            lineQualityScore + 
            proportionPerspectiveScore + 
            valueShadingScore + 
            compositionCreativityScore;
        }, 0);

        // Average across all metrics and all feedbacks
        const averageScore = totalScores / (studentFeedbacks.length * 6);

        // Step 5: Update or add the performance score in the course
        const existingScoreIndex = course.performanceScores.findIndex(
          (score: any) => score.userId.toString() === studentId.toString()
        );

        if (existingScoreIndex !== -1) {
          // Update existing score
          course.performanceScores[existingScoreIndex].score = averageScore;
          course.performanceScores[existingScoreIndex].date = new Date();
        } else {
          // Add new score
          course.performanceScores.push({
            userId: studentId,
            score: averageScore,
            date: new Date()
          });
        }

        await course.save();
      }
      return NextResponse.json({
        success: true,
        message: 'Drawing Feedback submitted successfully and class updated',
        data: {
          feedback: newFeedback,
          updatedClass: updatedClass
        }
      }, { status: 201 });
           
    } catch (error: any) {
      console.error('Error submitting Drawing feedback:', error);
      return NextResponse.json({
        success: false,
        message: error.message || 'Failed to submit Drawing feedback',
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
        const feedbackData = await feedbackDrawing.find(query)
            // .populate('userId', 'username email') // Populate student details
            // .populate('classId', 'title startTime') // Populate class details
            // .lean();
            const feedbackAllStudent=await feedbackDrawing.find({ classId: { $in: classIds } })
        
        return NextResponse.json({
            success: true,
            count: feedbackData.length,
            data: feedbackData,
            feedbackAllStudent:feedbackAllStudent
        }, { status: 200 });
        
    } catch (error: any) {
        console.error('Error fetching Drawing feedback:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch Drawing feedback',
            error: error.stack
        }, { status: 500 });
    }
}