import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import ReassignRequest from "@/models/ReassignRequest";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ requestId: string }> }
) {
    try {
        await connect();

        const token = request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.decode(token);
        const userId = decoded && typeof decoded === "object" && "id" in decoded ? (decoded as { id: string }).id : null;

        if (!userId) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const user = await (User as any).findById(userId).select("category");
        if (!user || !["teamlead", "team lead", "TeamLead"].includes(String(user.category).toLowerCase().replace(/\s/g, ""))) {
            return NextResponse.json({ success: false, error: "Only team leads can access this endpoint" }, { status: 403 });
        }

        const { requestId } = await params;
        const body = await request.json();
        const { action } = body; // 'approve' or 'reject'

        if (!requestId || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ success: false, error: "Invalid request parameters" }, { status: 400 });
        }

        const reassignReq = await (ReassignRequest as any).findById(requestId);
        if (!reassignReq) {
            return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
        }

        if (reassignReq.status !== "pending") {
            return NextResponse.json({ success: false, error: "Request has already been processed" }, { status: 400 });
        }

        if (action === "approve") {
            const { student: studentId, oldTutor: oldTutorId, newTutor: newTutorId } = reassignReq;

            const [student, oldTutor, newTutor] = await Promise.all([
                (User as any).findById(studentId),
                (User as any).findById(oldTutorId),
                (User as any).findById(newTutorId)
            ]);

            if (!student || !oldTutor || !newTutor) {
                return NextResponse.json({ success: false, error: "Student or tutors not found" }, { status: 404 });
            }

            // PERFORM ACTUAL REASSIGNMENT (Logic from the old POST API)
            
            // 1. Remove oldTutorId from student.instructorId and add newTutorId
            student.instructorId = (student.instructorId || []).filter((id: any) => id.toString() !== oldTutorId.toString());
            if (!student.instructorId.some((id: any) => id.toString() === newTutorId.toString())) {
                student.instructorId.push(new mongoose.Types.ObjectId(newTutorId));
            }

            // 2. Remove student from oldTutor.students
            oldTutor.students = (oldTutor.students || []).filter((id: any) => id.toString() !== studentId.toString());

            // 3. Add studentId to newTutor.students
            if (!newTutor.students.some((id: any) => id.toString() === studentId.toString())) {
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

            reassignReq.status = "approved";
        } else {
            reassignReq.status = "rejected";
        }

        await reassignReq.save();

        return NextResponse.json({ success: true, message: `Request ${action}d successfully` });

    } catch (error: any) {
        console.error(`Error handling reassign request:`, error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to process request" },
            { status: 500 }
        );
    }
}
