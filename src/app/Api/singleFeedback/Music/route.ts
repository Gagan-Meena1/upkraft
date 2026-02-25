import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import Class from '@/models/Class';
import feedback from '@/models/feedback';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    try {
        await connect();
        
        const url = new URL(request.url);
        const classId = url.searchParams.get("classId");
        const userId = url.searchParams.get("userId");
        console.log("classId : ", classId);
        console.log("userId : ", userId);
        
        // Get token and verify instructor
        const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }
        
        const decodedToken = token ? jwt.decode(token) : null;
        const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        
        if (!instructorId) {
            return NextResponse.json({
                success: false,
                error: 'Invalid authentication token'
            }, { status: 401 });
        }
        
        // Validate required parameters
        if (!classId) {
            return NextResponse.json({
                success: false,
                error: 'class ID is required'
            }, { status: 400 });
        }

        // Build query object
        let query: any = { classId };
        
        // If userId is provided, add it to the query
        if (userId) {
            query.userId = userId;
        }

        // Query feedback data
        const feedbackData = await feedback.find(query)
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(1);
        // If no userId provided, get feedback for all users in the class
       

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


