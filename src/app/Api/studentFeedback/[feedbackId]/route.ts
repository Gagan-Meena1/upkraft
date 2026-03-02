import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import feedback from "@/models/feedback";
import jwt from "jsonwebtoken";
import Class from "@/models/Class";
import User from "@/models/userModel";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ feedbackId: string }> }
) {
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
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.decode(token);
        const tutorId =
            decoded && typeof decoded === "object" && "id" in decoded
                ? (decoded as { id: string }).id
                : null;

        if (!tutorId) {
            return NextResponse.json(
                { success: false, error: "Invalid token" },
                { status: 401 }
            );
        }

        const { feedbackId } = await params;
        if (!feedbackId) {
            return NextResponse.json(
                { success: false, error: "Feedback ID is required" },
                { status: 400 }
            );
        }

        const existingFeedback = await feedback.findById(feedbackId).populate("classId").lean() as any;

        if (!existingFeedback) {
            return NextResponse.json(
                { success: false, error: "Feedback not found" },
                { status: 404 }
            );
        }

        // Verify this feedback belongs to a class taught by this tutor
        if (!existingFeedback.classId || String(existingFeedback.classId.instructor) !== tutorId) {
            return NextResponse.json(
                { success: false, error: "You are not authorized to edit this feedback" },
                { status: 403 }
            );
        }

        if (!existingFeedback.isEditable) {
            return NextResponse.json(
                { success: false, error: "This feedback is not editable. Please ask your Relationship Manager to enable editing." },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { rhythm, theoreticalUnderstanding, performance, earTraining, assignment, technique, personalFeedback, naFields, attendanceStatus } = body;

        // Calculate overall rating logic similar to POST
        const feedbackRating =
            (Number(rhythm || 0) +
                Number(theoreticalUnderstanding || 0) +
                Number(performance || 0) +
                Number(earTraining || 0) +
                Number(assignment || 0) +
                Number(technique || 0)) / 6;

        const updateData: any = {
            isEditable: false, // After edit, disable again
            feedbackRating
        };

        if (rhythm !== undefined) updateData.rhythm = String(rhythm);
        if (theoreticalUnderstanding !== undefined) updateData.theoreticalUnderstanding = String(theoreticalUnderstanding);
        if (performance !== undefined) updateData.performance = String(performance);
        if (earTraining !== undefined) updateData.earTraining = String(earTraining);
        if (assignment !== undefined) updateData.assignment = String(assignment);
        if (technique !== undefined) updateData.technique = String(technique);
        if (personalFeedback !== undefined) updateData.personalFeedback = personalFeedback;
        if (naFields !== undefined) updateData.naFields = naFields;
        if (attendanceStatus !== undefined) {
            updateData.attendance = attendanceStatus === "Absent" ? 0 : 1;

            // Sync with User's attendance record
            const user = await User.findById(existingFeedback.userId);
            if (user) {
                const classIdStr = existingFeedback.classId._id ? existingFeedback.classId._id.toString() : existingFeedback.classId.toString();
                const attendanceIndex = user.attendance.findIndex(
                    (att: any) => att.classId.toString() === classIdStr
                );

                const dbStatus = attendanceStatus === "Absent" ? "absent" : "present";

                if (attendanceIndex !== -1) {
                    user.attendance[attendanceIndex].status = dbStatus;
                } else {
                    user.attendance.push({
                        classId: existingFeedback.classId._id || existingFeedback.classId,
                        status: dbStatus
                    });
                }
                await user.save();
            }
        }

        const updatedFeedback = await feedback.findByIdAndUpdate(
            feedbackId,
            { $set: updateData },
            { new: true, strict: false }
        );

        return NextResponse.json({
            success: true,
            message: "Feedback updated successfully",
            data: updatedFeedback
        });

    } catch (error: any) {
        console.error("Error updating feedback:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to update feedback",
            },
            { status: 500 }
        );
    }
}
