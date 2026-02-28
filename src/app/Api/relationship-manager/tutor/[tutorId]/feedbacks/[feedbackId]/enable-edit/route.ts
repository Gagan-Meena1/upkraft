import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import feedback from "@/models/feedback";
import jwt from "jsonwebtoken";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ tutorId: string; feedbackId: string }> }
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

        const { tutorId, feedbackId } = await params;
        if (!tutorId || !feedbackId) {
            return NextResponse.json(
                { success: false, error: "Tutor ID and Feedback ID are required" },
                { status: 400 }
            );
        }

        const tutor = (await User.findById(tutorId)
            .select("_id relationshipManager")
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

        const updatedFeedback = await feedback.findByIdAndUpdate(
            feedbackId,
            { $set: { isEditable: true } },
            { new: true, strict: false }
        );

        if (!updatedFeedback) {
            return NextResponse.json(
                { success: false, error: "Feedback not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Edit enabled successfully",
            feedback: updatedFeedback
        });
    } catch (error: any) {
        console.error("Error enabling feedback edit:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to enable feedback edit",
            },
            { status: 500 }
        );
    }
}
