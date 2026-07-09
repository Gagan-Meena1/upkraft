import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";

export async function PUT(request: NextRequest) {
    try {
        await connect();

        const reqBody = await request.json();
        const {
            studentId,
            custName,
            email,
            phone,
            society,
            salesSPOC,
            renewalStatus,
            notes,
            hideFromRenewalDashboard,
        } = reqBody;

        if (!studentId) {
            return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        const updateData: any = {};
        if (custName !== undefined) updateData.username = custName;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.contact = phone;
        if (society !== undefined) updateData.address = society;
        if (salesSPOC !== undefined) updateData.salesSPOC = salesSPOC;
        if (renewalStatus !== undefined) updateData.renewalStatus = renewalStatus;
        if (notes !== undefined) updateData.notes = notes;
        if (hideFromRenewalDashboard !== undefined) updateData.hideFromRenewalDashboard = hideFromRenewalDashboard;


        const updatedUser = await User.findByIdAndUpdate(
            studentId,
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Student updated successfully" });
    } catch (error: any) {
        console.error("Error updating student package details:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update details" },
            { status: 500 }
        );
    }
}
