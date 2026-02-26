import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import feedback from '@/models/feedback';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

await connect();

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get("userId");
        
        // Priority 1: impersonation token (RSM acting as tutor — web only)
        // Priority 2: session cookie (web browser)
        // Priority 3: Bearer token in Authorization header (React Native mobile app)
        const referer = request.headers.get("referer") || "";
        let refererPath = "";
        try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
        const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
        const impersonateToken = request.cookies.get("impersonate_token")?.value;
        const authHeader = request.headers.get("Authorization") || "";
        const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        const token = (isTutorContext && impersonateToken)
            ? impersonateToken
            : (request.cookies.get("token")?.value || bearerToken || "");

        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }
        
        // Decode token to verify user
        const decodedToken = jwt.decode(token);
        const authenticatedUserId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        
        if (!authenticatedUserId) {
            return NextResponse.json({
                success: false,
                error: 'Invalid authentication token'
            }, { status: 401 });
        }
        
        // Determine which user to fetch feedback for
        const targetUserId = userId || authenticatedUserId;
        
        // Fetch user to get their classes
        const user = await User.findById(targetUserId).select('classes username email');
        
        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }
        
        // Check if user has any classes
        if (!user.classes || user.classes.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'User has no classes enrolled',
                data: { averageScore: null }
            }, { status: 200 });
        }
        
        // Build query to fetch feedback for user's classes
        const query: any = {
            userId: targetUserId,
            classId: { $in: user.classes }
        };
        
        // Fetch all feedback matching the query
        const feedbackData = await feedback.find(query)
            .populate('userId', 'username email')
            .populate('classId', 'title startTime')
            .sort({ createdAt: -1 })
            .lean();
        
        if (!feedbackData || feedbackData.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No feedback found',
                data: { averageScore: null }
            }, { status: 200 });
        }
        
        // Calculate average score across all feedback entries
        const totalScores = feedbackData.reduce((acc, fb) => {
            const rhythmScore = Number(fb.rhythm) || 0;
            const theoreticalScore = Number(fb.theoreticalUnderstanding) || 0;
            const performanceScore = Number(fb.performance) || 0;
            const earTrainingScore = Number(fb.earTraining) || 0;
            const assignmentScore = Number(fb.assignment) || 0;
            const techniqueScore = Number(fb.technique) || 0;
            
            return acc + 
                rhythmScore + 
                theoreticalScore + 
                performanceScore + 
                earTrainingScore + 
                assignmentScore + 
                techniqueScore;
        }, 0);
        
        // Calculate average across all metrics and all feedback entries
        // Total metrics = 6 (rhythm, theoretical, performance, earTraining, assignment, technique)
        const averageScore = totalScores / (feedbackData.length * 6);
        
        // Calculate individual metric averages (optional, but useful)
        const metricAverages = {
            rhythm: feedbackData.reduce((acc, fb) => acc + (Number(fb.rhythm) || 0), 0) / feedbackData.length,
            theoreticalUnderstanding: feedbackData.reduce((acc, fb) => acc + (Number(fb.theoreticalUnderstanding) || 0), 0) / feedbackData.length,
            performance: feedbackData.reduce((acc, fb) => acc + (Number(fb.performance) || 0), 0) / feedbackData.length,
            earTraining: feedbackData.reduce((acc, fb) => acc + (Number(fb.earTraining) || 0), 0) / feedbackData.length,
            assignment: feedbackData.reduce((acc, fb) => acc + (Number(fb.assignment) || 0), 0) / feedbackData.length,
            technique: feedbackData.reduce((acc, fb) => acc + (Number(fb.technique) || 0), 0) / feedbackData.length
        };
        
        return NextResponse.json({
            success: true,
            data: { averageScore: parseFloat(averageScore.toFixed(1)) },
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