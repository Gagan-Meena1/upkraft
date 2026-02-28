import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import feedback from "@/models/feedback";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tutorId: string }> }
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
        const rmId =
            decoded && typeof decoded === "object" && "id" in decoded
                ? (decoded as { id: string }).id
                : null;

        if (!rmId) {
            return NextResponse.json(
                { success: false, error: "Invalid token" },
                { status: 401 }
            );
        }

        const rmUser = (await User.findById(rmId).select("category")) as any;
        if (
            !rmUser ||
            !["RelationshipManager", "Relationship Manager"].includes(
                String(rmUser.category)
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Only relationship managers can access this endpoint",
                },
                { status: 403 }
            );
        }

        const { tutorId } = await params;
        if (!tutorId) {
            return NextResponse.json(
                { success: false, error: "Tutor ID required" },
                { status: 400 }
            );
        }

        const tutor = (await User.findById(tutorId)
            .select("_id username email relationshipManager classes")
            .lean()) as any;

        if (!tutor) {
            return NextResponse.json(
                { success: false, error: "Tutor not found" },
                { status: 404 }
            );
        }

        const tutorRmId =
            tutor.relationshipManager == null
                ? ""
                : typeof tutor.relationshipManager === "object" && tutor.relationshipManager !== null && "_id" in tutor.relationshipManager
                    ? String((tutor.relationshipManager as any)._id)
                    : String(tutor.relationshipManager);

        if (tutorRmId !== rmId) {
            return NextResponse.json(
                { success: false, error: "This tutor is not assigned to you" },
                { status: 403 }
            );
        }

        const classIds = (tutor.classes || []).map((id: any) =>
            typeof id === "object" ? id._id : id
        );

        if (classIds.length === 0) {
            return NextResponse.json({
                success: true,
                tutor: { _id: tutor._id, username: tutor.username, email: tutor.email },
                feedbacks: [],
            });
        }

        const feedbacks = (await feedback
            .find({ classId: { $in: classIds } })
            .populate("userId", "username email")
            .populate({
                path: "classId",
                select: "title startTime endTime course",
                populate: {
                    path: "course",
                    select: "courseName title name"
                }
            })
            .sort({ createdAt: -1 })
            .lean()) as any[];

        const formattedFeedbacks = feedbacks.map((fb: any) => {
            const student = fb.userId || {};
            const classObj = fb.classId || {};
            const courseObj = classObj.course || {};

            return {
                _id: fb._id,
                createdAt: fb.createdAt,
                student: {
                    _id: student._id,
                    username: student.username || "Unknown",
                    email: student.email || "Unknown",
                },
                class: {
                    _id: classObj._id,
                    title: classObj.title || "Unknown",
                    startTime: classObj.startTime,
                    endTime: classObj.endTime,
                },
                course: {
                    _id: courseObj._id,
                    title: courseObj.courseName || courseObj.title || courseObj.name || "Unknown Course",
                },
                ratings: {
                    rhythm: fb.rhythm,
                    theoreticalUnderstanding: fb.theoreticalUnderstanding,
                    performance: fb.performance,
                    earTraining: fb.earTraining,
                    assignment: fb.assignment,
                    technique: fb.technique,
                    attendance: fb.attendance,
                    overallRating: fb.feedbackRating,
                    naFields: fb.naFields || []
                },
                personalFeedback: fb.personalFeedback || "",
                isEditable: fb.isEditable || false
            };
        });

        return NextResponse.json({
            success: true,
            tutor: { _id: tutor._id, username: tutor.username, email: tutor.email },
            feedbacks: formattedFeedbacks,
        });
    } catch (error: any) {
        console.error("Error fetching RM tutor feedbacks:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch tutor feedbacks",
            },
            { status: 500 }
        );
    }
}
