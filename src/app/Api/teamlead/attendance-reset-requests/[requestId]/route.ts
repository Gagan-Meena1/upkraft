import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import AttendanceResetRequest from "@/models/AttendanceResetRequest";
import User from "@/models/userModel";
import Feedback from "@/models/feedback";
import FeedbackDance from "@/models/feedbackDance";
import FeedbackDrawing from "@/models/feedbackDrawing";
import FeedbackDrums from "@/models/feedbackDrums";
import FeedbackVocal from "@/models/feedbackVocal";
import FeedbackViolin from "@/models/feedbackViolin";
import Class from "@/models/Class";
await connect();

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ requestId: string }> }
) {
    try {
        const token = request.cookies.get("token")?.value || "";
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const decoded: any = jwt.decode(token);
        if (!decoded?.id) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const tlId = decoded.id;
        const tlUser = await (User as any).findById(tlId).select("category");
        if (!tlUser || !["teamlead", "team lead", "TeamLead"].includes(String(tlUser.category).toLowerCase().replace(/\s/g, ""))) {
            return NextResponse.json({ success: false, error: "Forbidden: Only Team Leads can resolve requests." }, { status: 403 });
        }

        const { requestId } = await params;  // ← awaited
        const body = await request.json();
        const { action } = body;

        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
        }

        const reqObj = await AttendanceResetRequest.findById(requestId);
        if (!reqObj) {
            return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
        }

        if (reqObj.status !== "pending") {
            return NextResponse.json({ success: false, error: "Request is already processed." }, { status: 400 });
        }

        if (action === "approve") {
            const studentId = reqObj.student;
            const classId = reqObj.classItem;
            const requestedChange = reqObj.requestedChange;
            const isClassLevel = reqObj.requestType === "class";
            const studentIds = isClassLevel ? reqObj.students : [reqObj.student];

            if (requestedChange === "present") {
                // Set attendance to present via PUT
                const baseUrl = request.nextUrl.origin;
                const attRes = await fetch(
                    `${baseUrl}/Api/attendance?studentId=${studentId}&classId=${classId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "present" })
                    }
                );
                const attData = await attRes.json();
                if (!attRes.ok || !attData.success) {
                    return NextResponse.json({ success: false, error: "Failed to update attendance to present" }, { status: 500 });
                }

            } else if (requestedChange === "absent") {
                // Pull attendance record and delete feedbacks
                await (User as any).updateOne(
                    { _id: studentId },
                    { $pull: { attendance: { classId: classId } } }
                );

                await Promise.all([
                    Feedback.deleteMany({ classId: classId, userId: studentId }),
                    FeedbackDance.deleteMany({ classId: classId, userId: studentId }),
                    FeedbackDrawing.deleteMany({ classId: classId, userId: studentId }),
                    FeedbackDrums.deleteMany({ classId: classId, userId: studentId }),
                    FeedbackVocal.deleteMany({ classId: classId, userId: studentId }),
                    FeedbackViolin.deleteMany({ classId: classId, userId: studentId })
                ]);

                // Then set to absent
                const baseUrl = request.nextUrl.origin;
                const attRes = await fetch(
                    `${baseUrl}/Api/attendance?studentId=${studentId}&classId=${classId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "absent" })
                    }
                );
                const attData = await attRes.json();
                if (!attRes.ok || !attData.success) {
                    return NextResponse.json({ success: false, error: "Failed to update attendance to absent" }, { status: 500 });
                }

            } else if (requestedChange === "cancelled") {
                const newAttendanceStatus = reqObj.creditDeduction === true ? "absent" : "canceled";
                const baseUrl = request.nextUrl.origin;

                for (const currentStudentId of studentIds) {
                    // Update attendance
                    const studentDoc = await (User as any).findById(currentStudentId).select("attendance").lean() as any;
                    const existingRecord = (studentDoc?.attendance || []).find(
                        (a: any) => a.classId?.toString() === classId.toString()
                    );
                    const isNewRecord = !existingRecord;

                    if (existingRecord) {
                        await (User as any).updateOne(
                            { _id: currentStudentId },
                            {
                                $set: {
                                    "attendance.$[elem].status": newAttendanceStatus,
                                    "attendance.$[elem].reasonForCancellation": reqObj.reasonForCancellation || ""
                                }
                            },
                            { arrayFilters: [{ "elem.classId": classId }] }
                        );
                    } else {
                        await (User as any).updateOne(
                            { _id: currentStudentId },
                            {
                                $push: {
                                    attendance: {
                                        classId,
                                        status: newAttendanceStatus,
                                        reasonForCancellation: reqObj.reasonForCancellation || ""
                                    }
                                }
                            }
                        );
                    }

                    // Delete feedbacks
                    await Promise.all([
                        Feedback.deleteMany({ classId, userId: currentStudentId }),
                        FeedbackDance.deleteMany({ classId, userId: currentStudentId }),
                        FeedbackDrawing.deleteMany({ classId, userId: currentStudentId }),
                        FeedbackDrums.deleteMany({ classId, userId: currentStudentId }),
                        FeedbackVocal.deleteMany({ classId, userId: currentStudentId }),
                        FeedbackViolin.deleteMany({ classId, userId: currentStudentId })
                    ]);

                    // Handle credit/package logic
                    const cancellationRes = await fetch(
                        `${baseUrl}/Api/teamlead/handleCancellation`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Cookie": request.headers.get("cookie") || ""
                            },
                            body: JSON.stringify({
                                studentId: currentStudentId.toString(),
                                classId: classId.toString(),
                                creditDeduction: reqObj.creditDeduction,
                                singleStudent: reqObj.singleStudent,
                                isNewRecord
                            })
                        }
                    );

                    const cancellationData = await cancellationRes.json();
                    if (!cancellationRes.ok || !cancellationData.success) {
                        console.error(`Failed package logic for student ${currentStudentId}:`, cancellationData.error);
                        // Don't block — continue with other students
                    }
                }

                // Mark class as canceled for class-level requests
                if (isClassLevel) {
                    await Class.updateOne(
                        { _id: classId },
                        { $set: { status: "canceled" } }
                    );
                } else if (reqObj.singleStudent) {
                    await Class.updateOne(
                        { _id: classId },
                        { $set: { status: "canceled" } }
                    );
                }
            }
            await AttendanceResetRequest.updateOne(
                { _id: requestId },
                { $set: { status: "approved" } }
            );
            return NextResponse.json({ success: true, message: "Attendance reset successfully approved" });

        } else {
            // ← same here
            await AttendanceResetRequest.updateOne(
                { _id: requestId },
                { $set: { status: "rejected" } }
            );
            return NextResponse.json({ success: true, message: "Attendance reset rejected" });
        }

    } catch (error) {
        console.error("TL Attendance Reset resolution error:", error);
        return NextResponse.json({ success: false, error: "Failed to resolve reset request" }, { status: 500 });
    }
}
