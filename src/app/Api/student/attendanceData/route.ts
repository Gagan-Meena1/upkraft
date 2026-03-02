import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

await connect();

export async function GET(request: NextRequest) {
    try {
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
            return NextResponse.json(
                { error: 'Unauthorized - No token provided' },
                { status: 401 }
            );
        }

        const studentId = request.nextUrl.searchParams.get("studentId") || (jwt.decode(token) as any)?.id;

        const decoded = jwt.decode(token) as any;

        if (!studentId) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const attendanceRecords = await User.findById(studentId).select('attendance');
        if (!attendanceRecords) {
            return NextResponse.json({ message: 'Attendance records not found' }, { status: 404 });
        }
        console.log('Fetched attendance records:', attendanceRecords);

        return NextResponse.json({ success: true, data: { attendance: attendanceRecords.attendance } }, { status: 200 });
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 });
    }
}
