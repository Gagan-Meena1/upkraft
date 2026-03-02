import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

await connect();

export async function GET(request: NextRequest) {
    try {
        const referer = request.headers.get("referer") || "";
        let refererPath = "";
        try { if (referer) refererPath = new URL(referer).pathname; } catch (e) { }
        const isTutorContext =
            refererPath.startsWith("/tutor") ||
            (request.nextUrl?.pathname?.startsWith("/Api/tutor") ?? false);

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

        const searchParams = request.nextUrl.searchParams;

        // ── Batch mode: ?studentIds=id1,id2,id3 ──────────────────────────────
        const studentIdsParam = searchParams.get("studentIds");
        if (studentIdsParam) {
            const ids = studentIdsParam
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean);

            if (ids.length === 0) {
                return NextResponse.json({ success: true, data: {} }, { status: 200 });
            }

            // Single DB query using $in — one round-trip regardless of student count
            const records = await User.find(
                { _id: { $in: ids } },
                { _id: 1, attendance: 1 }   // project only what we need
            ).lean();

            // Build map: studentId → attendance[]
            const attendanceByStudent: Record<string, any[]> = {};
            for (const record of records) {
                attendanceByStudent[record._id.toString()] = record.attendance ?? [];
            }

            // Ensure every requested ID has an entry (even if student wasn't found)
            for (const id of ids) {
                if (!attendanceByStudent[id]) {
                    attendanceByStudent[id] = [];
                }
            }

            return NextResponse.json(
                { success: true, data: attendanceByStudent },
                { status: 200 }
            );
        }

        // ── Single mode (backward-compatible): ?studentId=xxx ────────────────
        const studentId =
            searchParams.get("studentId") || (jwt.decode(token) as any)?.id;

        if (!studentId) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const attendanceRecords = await User.findById(studentId)
            .select('attendance')
            .lean();

        if (!attendanceRecords) {
            return NextResponse.json(
                { message: 'Attendance records not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: { attendance: (attendanceRecords as any).attendance } },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching attendance data:', error);
        return NextResponse.json(
            { message: 'Internal Server Error', error },
            { status: 500 }
        );
    }
}