import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import feedback from '@/models/feedback';
import jwt from 'jsonwebtoken';
// import { getServerSession } from 'next-auth/next'; // If using next-auth

export async function GET(request: NextRequest) {
    try {
        console.log("[API/studentFeedbackForTutor] Received GET request.");
        await connect();
        
        const url = new URL(request.url);
        const courseId = url.searchParams.get("courseId");
        const studentId = url.searchParams.get("studentId");
        console.log("[API/studentFeedbackForTutor] Parsed query params:", { courseId, studentId });
        
        // Get token and verify instructor
        const token = request.cookies.get("token")?.value;
        if (!token) {
            console.warn("[API/studentFeedbackForTutor] Authentication token not found.");
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }
        
        const decodedToken = token ? jwt.decode(token) : null;
        const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        
        if (!instructorId) {
            console.warn("[API/studentFeedbackForTutor] Invalid authentication token, instructorId not found.");
            return NextResponse.json({
                success: false,
                error: 'Invalid authentication token'
            }, { status: 401 });
        }
        
        // Validate required parameters
        if (!courseId) {
            console.warn("[API/studentFeedbackForTutor] Course ID is required but not provided.");
            return NextResponse.json({
                success: false,
                error: 'Course ID is required'
            }, { status: 400 });
        }
        
        // First, find all classes that belong to the specified course
        console.log("[API/studentFeedbackForTutor] Finding classes for courseId:", courseId);
        const classes = await Class.find({ course: courseId }).exec();
        
        if (!classes || classes.length === 0) {
            console.warn("[API/studentFeedbackForTutor] No classes found for courseId:", courseId);
            return NextResponse.json({
                success: false,
                error: 'No classes found for the specified course'
            }, { status: 404 });
        }
        console.log(`[API/studentFeedbackForTutor] Found ${classes.length} classes.`);
        
        // Extract class IDs
        const classIds = classes.map(cls => cls._id);
        
        // Construct query for finding feedback
        const query: Record<string, any> = { classId: { $in: classIds } };
        
        // Add studentId to query if provided
        if (studentId) {
            query.userId = studentId;
        }
        console.log("[API/studentFeedbackForTutor] Constructed feedback query:", query);
        
        // Find feedback for specific student if studentId is provided
        const feedbackData = await feedback.find(query).exec();
        console.log(`[API/studentFeedbackForTutor] Found ${feedbackData.length} feedback documents for the student.`);
        
        // Get feedback for all students in these classes
        const feedbackAllStudent = await feedback.find({ classId: { $in: classIds } }).exec();
        console.log(`[API/studentFeedbackForTutor] Found ${feedbackAllStudent.length} total feedback documents for the course.`);
        
        const responsePayload = {
            success: true,
            count: feedbackData.length,
            data: feedbackData,
            feedbackAllStudent
        };
        console.log("[API/studentFeedbackForTutor] Sending successful response.");
        
        return NextResponse.json(responsePayload, { status: 200 });
        
    } catch (error: any) {
        console.error('[API/studentFeedbackForTutor] An error occurred:', { errorMessage: error.message, stack: error.stack });
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch feedback',
            error: error.stack
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connect();
        const { courseIds, studentId } = await request.json();

        if (!Array.isArray(courseIds) || !studentId) {
            return NextResponse.json({
                success: false,
                error: 'courseIds (array) and studentId are required'
            }, { status: 400 });
        }

        // Find all classes for the given courses
        const classes = await Class.find({ course: { $in: courseIds } }).exec();
        if (!classes || classes.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No classes found for the specified courses'
            }, { status: 404 });
        }

        const classIds = classes.map(cls => cls._id);

        // Find feedback for the student in these classes
        const feedbackData = await feedback.find({
            classId: { $in: classIds },
            userId: studentId
        }).exec();

        // Optionally, get all feedback for these classes (not just for this student)
        const feedbackAllStudent = await feedback.find({
            classId: { $in: classIds }
        }).exec();

        return NextResponse.json({
            success: true,
            count: feedbackData.length,
            data: feedbackData,
            feedbackAllStudent
        }, { status: 200 });

    } catch (error: any) {
        console.error('[API/studentFeedbackForTutor][POST] Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch feedback',
            error: error.stack
        }, { status: 500 });
    }
}
