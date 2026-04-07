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
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const decoded: any = jwt.decode(token);
        if (!decoded?.id) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const rmId = decoded.id;
        const rmUser = await (User as any).findById(rmId).select("category");
        if (!rmUser || !["relationshipmanager", "relationship manager", "RelationshipManager"].includes(String(rmUser.category).toLowerCase().replace(/\s/g, ""))) {
            return NextResponse.json({ success: false, error: "Forbidden: Only Relationship Managers can request attendance reset." }, { status: 403 });
        }
        const body = await request.json();
        const { studentId, classId } = body;

        if (!studentId || !classId) {
            return NextResponse.json({ success: false, error: "studentId and classId are required" }, { status: 400 });
        }

        // Verify class and student exist
        const student = await (User as any).findById(studentId);
        const classItem = await Class.findById(classId);

        if (!student || !classItem) {
            return NextResponse.json({ success: false, error: "Student or Class not found" }, { status: 404 });
        }

        // Check if an existing pending request is active
        const existingReq = await AttendanceResetRequest.findOne({
            student: studentId,
            classItem: classId,
            status: "pending"
        });

        if (existingReq) {
            return NextResponse.json({ success: false, error: "Pending request already exists for this student and class." }, { status: 400 });
        }

        const newRequest = await AttendanceResetRequest.create({
            student: studentId,
            classItem: classId,
            relationshipManager: rmId,
            status: "pending"
        });

        return NextResponse.json({ success: true, data: newRequest }, { status: 201 });

    } catch (error) {
        console.error("Attendance Reset Request Error:", error);
        return NextResponse.json({ success: false, error: "Failed to submit attendance reset request." }, { status: 500 });
    }
}
