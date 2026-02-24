import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

await connect();

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        const token =
            authHeader?.replace('Bearer ', '') ??
            request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No token provided' },
                { status: 401 }
            );
        }

        const decoded = jwt.decode(token) as any;
        const studentId = decoded?.id;

        if (!studentId) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const attendanceRecords = await User.findById(studentId).select('attendance');
        if (!attendanceRecords) {
            return NextResponse.json({ message: 'Attendance records not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { attendance: attendanceRecords.attendance } }, { status: 200 });
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 });
    }
}
