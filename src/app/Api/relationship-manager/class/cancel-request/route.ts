import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import AttendanceResetRequest from "@/models/AttendanceResetRequest";
import User from "@/models/userModel";
import Class from "@/models/Class";

await connect();

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value || "";
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const decoded: any = jwt.decode(token);
        if (!decoded?.id) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const rmId = decoded.id;
        const rmUser = await (User as any).findById(rmId).select("category");
        if (!rmUser || !["relationshipmanager", "relationship manager", "RelationshipManager"].includes(
            String(rmUser.category).toLowerCase().replace(/\s/g, "")
        )) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { classId, creditDeduction, reasonForCancellation } = body;

        if (!classId) {
            return NextResponse.json({ success: false, error: "classId is required" }, { status: 400 });
        }
        if (!reasonForCancellation?.trim()) {
            return NextResponse.json({ success: false, error: "Reason for cancellation is required" }, { status: 400 });
        }

        // Fetch class to get all students
        const classDoc = await Class.findById(classId).lean() as any;
        if (!classDoc) {
            return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
        }

        // Get all students in this class
        const studentsInClass = await (User as any).find({
            classes: classId,
            category: { $in: ["Student", "student"] }
        }).select("_id").lean() as any[];

        if (studentsInClass.length === 0) {
            return NextResponse.json({ success: false, error: "No students found in this class" }, { status: 400 });
        }

        const studentIds = studentsInClass.map((s: any) => s._id);
        const isSingleStudent = studentIds.length === 1;

        // Check if a pending request already exists for this class
        const existingReq = await AttendanceResetRequest.findOne({
            classItem: classId,
            requestType: "class",
            status: "pending"
        });

        if (existingReq) {
            return NextResponse.json({
                success: false,
                error: "A pending cancellation request already exists for this class"
            }, { status: 400 });
        }

        const newRequest = await AttendanceResetRequest.create({
            student: null,
            students: studentIds,
            classItem: classId,
            relationshipManager: rmId,
            status: "pending",
            requestedChange: "cancelled",
            creditDeduction: isSingleStudent ? null : (creditDeduction ?? false),
            singleStudent: isSingleStudent,
            reasonForCancellation: reasonForCancellation.trim(),
            requestType: "class"
        });

        return NextResponse.json({ success: true, data: newRequest }, { status: 201 });

    } catch (error: any) {
        console.error("Class cancel request error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}