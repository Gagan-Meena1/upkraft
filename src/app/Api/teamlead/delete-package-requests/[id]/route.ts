import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import DeletePackageRequest from "@/models/DeletePackageRequest";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
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

        const teamLead = await User.findById(userId).select("category");
        if (!teamLead || !["teamlead", "team lead", "TeamLead"].includes(String(teamLead.category).toLowerCase().replace(/\s/g, ""))) {
            return NextResponse.json({ success: false, error: "Only team leads can access this endpoint" }, { status: 403 });
        }

        const { id: requestId } = await params;
        const body = await request.json();
        const { action } = body;

        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
        }

        const pkgRequest = await DeletePackageRequest.findById(requestId);
        if (!pkgRequest) {
            return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
        }

        if (pkgRequest.status !== "pending") {
            return NextResponse.json({ success: false, error: "Request already processed" }, { status: 400 });
        }

        if (action === "reject") {
            pkgRequest.status = "rejected";
            await pkgRequest.save();
            return NextResponse.json({ success: true, message: "Request rejected successfully" });
        }

        // Action is "approve"
        const student = await User.findById(pkgRequest.studentId);
        if (!student) {
            return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
        }

        // 1. Find the specific course in creditsPerCourse
        const courseIndex = student.creditsPerCourse.findIndex(
            (c: any) => c.courseId && c.courseId.toString() === pkgRequest.courseId.toString()
        );

        if (courseIndex === -1) {
            return NextResponse.json({ success: false, error: "Course not found in student profile" }, { status: 404 });
        }

        const courseEntry = student.creditsPerCourse[courseIndex];
        
        // 2. Find the specific package (startTime array entry)
        const packageIndex = courseEntry.startTime.findIndex(
            (entry: any) => {
                // If the packageId is an ObjectId string from the DB, compare _id
                if (entry._id && entry._id.toString() === pkgRequest.packageId) return true;
                // Otherwise fallback to comparing by date (if packageId was generated using date timestamp)
                if (new Date(entry.date).getTime().toString() === pkgRequest.packageId) return true;
                return false;
            }
        );

        if (packageIndex === -1) {
            return NextResponse.json({ success: false, error: "Package entry not found in student profile" }, { status: 404 });
        }

        const packageEntry = courseEntry.startTime[packageIndex];
        const classIdsToRemove = (packageEntry.classIds || []).map((id: any) => id.toString());

        // 3. Remove all these classIds from the user's main classes array
        student.classes = student.classes.filter(
            (cId: any) => !classIdsToRemove.includes(cId.toString())
        );

        // 4. Delete the package entry from startTime
        courseEntry.startTime.splice(packageIndex, 1);

        // If startTime is now empty, you could theoretically remove the course entirely, but we'll leave it empty to keep history
        
        await student.save();

        pkgRequest.status = "done";
        await pkgRequest.save();

        return NextResponse.json({ success: true, message: "Package deleted successfully" });
    } catch (error: any) {
        console.error("Delete package action error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
