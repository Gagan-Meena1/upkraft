import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import DeletePackageRequest from "@/models/DeletePackageRequest";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {
        await connect();

        const token = request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.decode(token);
        const tutorId = decoded && typeof decoded === "object" && "id" in decoded ? (decoded as { id: string }).id : null;

        if (!tutorId) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const tutor = await User.findById(tutorId).select("category");
        if (!tutor || (tutor.category !== "Tutor" && tutor.category !== "tutor" && tutor.category !== "TUTOR")) {
            return NextResponse.json({ success: false, error: "Only tutors can access this endpoint" }, { status: 403 });
        }

        const body = await request.json();
        const { studentId, courseId, packageId, startDate, endDate, numberOfClasses } = body;

        if (!studentId || !courseId || !packageId || !startDate || !numberOfClasses) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Check if there's already a pending request for this package
        const existingRequest = await DeletePackageRequest.findOne({
            packageId,
            status: "pending"
        });

        if (existingRequest) {
            return NextResponse.json({ success: false, error: "A delete request for this package is already pending" }, { status: 400 });
        }

        const newRequest = new DeletePackageRequest({
            studentId,
            tutorId,
            courseId,
            packageId,
            startDate,
            endDate,
            numberOfClasses,
            status: "pending"
        });

        await newRequest.save();

        return NextResponse.json({
            success: true,
            message: "Delete package request sent to Team Lead successfully"
        });
    } catch (error: any) {
        console.error("Delete package request error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
