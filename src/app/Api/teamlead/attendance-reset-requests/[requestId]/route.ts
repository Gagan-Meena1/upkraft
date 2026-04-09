import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import AttendanceResetRequest from "@/models/AttendanceResetRequest";
import User from "@/models/userModel";

await connect();

export async function PUT(request: NextRequest, { params }: { params: { requestId: string } }) {
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

        const { requestId } = params;
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
            // Delete actual attendance record via $pull
            await (User as any).updateOne(
                { _id: reqObj.student },
                { $pull: { attendance: { classId: reqObj.classItem } } }
            );
            reqObj.status = "approved";
            await reqObj.save();
            return NextResponse.json({ success: true, message: "Attendance reset successfully approved" });
        } else {
            reqObj.status = "rejected";
            await reqObj.save();
            return NextResponse.json({ success: true, message: "Attendance reset rejected" });
        }

    } catch (error) {
        console.error("TL Attendance Reset resolution error:", error);
        return NextResponse.json({ success: false, error: "Failed to resolve reset request" }, { status: 500 });
    }
}
