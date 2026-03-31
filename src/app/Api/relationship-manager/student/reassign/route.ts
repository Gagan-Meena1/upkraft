import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
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

        // Use mongoose session if replica set is available, but for simplicity we'll just update sequentially
        
        // 1. Remove oldTutorId from student.instructorId and add newTutorId
        student.instructorId = (student.instructorId || []).filter((id: any) => id.toString() !== oldTutorId);
        if (!student.instructorId.some((id: any) => id.toString() === newTutorId)) {
            student.instructorId.push(new mongoose.Types.ObjectId(newTutorId));
        }

        // 2. Remove student from oldTutor.students
        oldTutor.students = (oldTutor.students || []).filter((id: any) => id.toString() !== studentId);

        // 3. Add studentId to newTutor.students
        if (!newTutor.students.some((id: any) => id.toString() === studentId)) {
            newTutor.students.push(new mongoose.Types.ObjectId(studentId));
        }

        // 4. Inherit courses: Add the assigned courses from old tutor to new tutor
        const studentCourseIds = student.courses || [];
        const oldTutorCourseIds = oldTutor.courses || [];
        const commonCourseIds = studentCourseIds.filter((courseId: any) => 
            oldTutorCourseIds.some((oldId: any) => oldId.toString() === courseId.toString())
        );
        
        commonCourseIds.forEach((courseId: any) => {
            if (!newTutor.courses.some((id: any) => id.toString() === courseId.toString())) {
                newTutor.courses.push(courseId);
            }
        });

        await Promise.all([
            student.save(),
            oldTutor.save(),
            newTutor.save()
        ]);

        return NextResponse.json({ success: true, message: "Student reassigned successfully" });
    } catch (error: any) {
        console.error("Error reassigning student:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to reassign student" }, { status: 500 });
    }
}
