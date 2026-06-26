import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import courseName from "@/models/courseName";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
    try {
        await connect();

        const token = request.cookies.get("token")?.value || "";
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const decoded: any = jwt.decode(token);
        if (!decoded?.id) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const body = await request.json();
        const { studentId, startDate, endDate } = body;

        if (!studentId || !startDate || !endDate) {
            return NextResponse.json({ success: false, error: "studentId, startDate and endDate are required" }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        // Include full end day
        end.setHours(23, 59, 59, 999);

        // Get student's class IDs
        const student = await (User as any).findById(studentId).select("classes").lean() as any;
        if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });

        const classIds = student.classes || [];

        // Find classes in range
        const classes = await Class.find({
            _id: { $in: classIds },
            startTime: { $gte: start, $lte: end },
            status: { $nin: ["canceled"] }
        })
            .populate("course", "courseName title name")
            .lean() as any[];

        if (classes.length === 0) {
            return NextResponse.json({ success: true, cancelledCount: 0, classes: [] });
        }

        // Return preview data grouped by course
        return NextResponse.json({
            success: true,
            classes: classes.map((cls: any) => ({
                _id: cls._id,
                title: cls.title,
                startTime: cls.startTime,
                endTime: cls.endTime,
                course: {
                    _id: cls.course?._id,
                    name: cls.course?.courseName || cls.course?.title || cls.course?.name || "Unknown"
                }
            }))
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connect();

        const token = request.cookies.get("token")?.value || "";
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const decoded: any = jwt.decode(token);
        if (!decoded?.id) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const body = await request.json();
        const { classIds } = body;

        if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
            return NextResponse.json({ success: false, error: "classIds array is required" }, { status: 400 });
        }

        const result = await Class.updateMany(
            { _id: { $in: classIds.map((id: string) => new mongoose.Types.ObjectId(id)) } },
            { $set: { status: "canceled" } }
        );

        return NextResponse.json({
            success: true,
            cancelledCount: result.modifiedCount,
            message: `${result.modifiedCount} classes cancelled successfully`
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}