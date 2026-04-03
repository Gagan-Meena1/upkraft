import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import ReassignRequest from "@/models/ReassignRequest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
    try {
        await connect();

        const token = (() => {
            const referer = request.headers.get("referer") || "";
            let refererPath = "";
            try { if (referer) refererPath = new URL(referer).pathname; } catch (e) { }
            const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
            return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
        })();

        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.decode(token);
        const rmId = decoded && typeof decoded === "object" && "id" in decoded ? (decoded as { id: string }).id : null;

        if (!rmId) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const rmUser = await (User as any).findById(rmId).select("category");
        if (!rmUser || !["RelationshipManager", "Relationship Manager"].includes(String(rmUser.category))) {
            return NextResponse.json({ success: false, error: "Only relationship managers can access this endpoint" }, { status: 403 });
        }

        const body = await request.json();
        const { studentId, oldTutorId, newTutorId } = body;

        if (!studentId || !oldTutorId || !newTutorId) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Verify that the new and old tutors are assigned to this RM
        const [oldTutor, newTutor] = await Promise.all([
            (User as any).findOne({ _id: oldTutorId, relationshipManager: rmId }),
            (User as any).findOne({ _id: newTutorId, relationshipManager: rmId })
        ]);

        // if (!oldTutor || !newTutor) {
        //     return NextResponse.json({ success: false, error: "One or both tutors are not assigned to you or do not exist" }, { status: 403 });
        // }

        const student = await (User as any).findById(studentId);
        if (!student) {
            return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
        }

        // Check if there is already a pending request for this student and old tutor
        const existingRequest = await (ReassignRequest as any).findOne({
            student: studentId,
            oldTutor: oldTutorId,
            status: "pending"
        });

        if (existingRequest) {
            return NextResponse.json({ success: false, error: "A reassignment request for this student is already pending approval" }, { status: 400 });
        }

        // Create a new reassign request
        await (ReassignRequest as any).create({
            student: studentId,
            oldTutor: oldTutorId,
            newTutor: newTutorId,
            relationshipManager: rmId,
            status: "pending"
        });

        return NextResponse.json({ success: true, message: "Reassignment request sent to team lead for approval" });
    } catch (error: any) {
        console.error("Error reassigning student:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to reassign student" }, { status: 500 });
    }
}
