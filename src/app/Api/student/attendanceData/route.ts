import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User  from '@/models/userModel';

await connect();

export async function GET(request: NextRequest) {
    try {
       const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No token provided' },
                { status: 401 }
            );
        }
        const { searchParams } = new URL(request.url);
        let studentId = searchParams.get('studentId');
        if (!studentId) {
            return NextResponse.json({ message: 'Student ID is required' }, { status: 400 });
        }
        const attendanceRecords = await User.findById(studentId).select('attendance');
        if (!attendanceRecords) {
            return NextResponse.json({ message: 'Attendance records not found' }, { status: 404 });
        }
        return NextResponse.json({ attendance: attendanceRecords.attendance }, { status: 200 });
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 });
    }
}