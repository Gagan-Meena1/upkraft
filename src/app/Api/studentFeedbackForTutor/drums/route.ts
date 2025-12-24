import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import feedbackDrums from '@/models/feedbackDrums';
import jwt from 'jsonwebtoken'
// import { getServerSession } from 'next-auth/next'; // If using next-auth
await connect();

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const courseId = url.searchParams.get("courseId");
        const studentId = url.searchParams.get("studentId");
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
        const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        
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
        const feedbackData = await feedbackDrums.find(query)
            // .populate('userId', 'username email') // Populate student details
            // .populate('classId', 'title startTime') // Populate class details
            // .lean();
            const feedbackAllStudent=await feedbackDrums.find({ classId: { $in: classIds } })
        
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
        const feedbackData = await feedbackDrums.find({
            classId: { $in: classIds },
            userId: studentId
        }).exec();

        // Optionally, get all feedback for these classes (not just for this student)
        const feedbackAllStudent = await feedbackDrums.find({
            classId: { $in: classIds }
        }).exec();

        return NextResponse.json({
            success: true,
            count: feedbackData.length,
            data: feedbackData,
            feedbackAllStudent
        }, { status: 200 });

    } catch (error: any) {
        console.error('[API/studentFeedbackForTutor/drums][POST] Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch feedback',
            error: error.stack
        }, { status: 500 });
    }
}
