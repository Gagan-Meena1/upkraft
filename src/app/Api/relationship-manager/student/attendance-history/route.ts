import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
    try {
        await connect();

        const { studentId, startDate, endDate } = await request.json();
        if (!studentId) {
            return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        // Single DB call: fetch only attendance array
        const student = await (User as any).findById(studentId)
            .select("attendance")
            .lean() as any;

        if (!student) {
            return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
        }

        const attendance: any[] = student.attendance || [];
        if (attendance.length === 0) {
            return NextResponse.json({ success: true, records: [] });
        }

        // Collect all classIds from attendance
        const classIds = attendance
            .map((a: any) => a.classId)
            .filter(Boolean)
            .map((id: any) => new mongoose.Types.ObjectId(id.toString()));

        // Build date filter if provided
        const classQuery: any = { _id: { $in: classIds } };
        if (startDate || endDate) {
            classQuery.startTime = {};
            if (startDate) classQuery.startTime.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                classQuery.startTime.$lte = end;
            }
        }

        // Single DB call: fetch all class details
        const classes = await Class.find(classQuery)
            .select("_id title startTime endTime status reasonForReschedule reasonForCancelation")
            .sort({ startTime: -1 })
            .lean() as any[];

        // Build attendance lookup: classId -> attendance record
        const attendanceMap = new Map<string, any>();
        for (const a of attendance) {
            if (a.classId) {
                attendanceMap.set(a.classId.toString(), a);
            }
        }

        // Merge class details with attendance status
        const records = classes.map((cls: any) => {
            const attRecord = attendanceMap.get(cls._id.toString());
            return {
                classId: cls._id,
                title: cls.title,
                startTime: cls.startTime,
                endTime: cls.endTime,
                classStatus: cls.status,
                attendanceStatus: attRecord?.status || "not_marked",
                reasonForCancellation: attRecord?.reasonForCancellation || cls.reasonForCancelation || "",
                reasonForReschedule: cls.reasonForReschedule || "",
            };
        });

        return NextResponse.json({ success: true, records });

    } catch (error: any) {
        console.error("Attendance history error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch attendance history" },
            { status: 500 }
        );
    }
}
