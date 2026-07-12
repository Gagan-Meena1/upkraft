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
            renewalNotes,
            renewalClasses,
            renewalFrequency,
            renewalAmount,
            notes,
            pkgAmount,
            hideFromRenewalDashboard,
            rm,
            courseEntryIndex,
            entryIndex,
        } = reqBody;

        if (!studentId) {
            return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        // Student-level fields
        const updateData: any = {};
        if (custName !== undefined) updateData.username = custName;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.contact = phone;
        if (society !== undefined) updateData.studentSociety = society;
        if (salesSPOC !== undefined) updateData.salesSPOC = salesSPOC;
        if (hideFromRenewalDashboard !== undefined) updateData.hideFromRenewalDashboard = hideFromRenewalDashboard;
        if (rm !== undefined) updateData.studentRM = rm;

        // Entry-level fields (renewalStatus, renewalNotes, notes live inside creditsPerCourse[].startTime[])
        if (renewalStatus !== undefined && courseEntryIndex !== undefined && entryIndex !== undefined) {
            updateData[`creditsPerCourse.${courseEntryIndex}.startTime.${entryIndex}.renewalStatus`] = renewalStatus;
        }
        if (renewalNotes !== undefined && courseEntryIndex !== undefined && entryIndex !== undefined) {
            updateData[`creditsPerCourse.${courseEntryIndex}.startTime.${entryIndex}.renewalNotes`] = renewalNotes;
        }
        if (notes !== undefined && courseEntryIndex !== undefined && entryIndex !== undefined) {
            updateData[`creditsPerCourse.${courseEntryIndex}.startTime.${entryIndex}.notes`] = notes;
        }
        if (pkgAmount !== undefined && courseEntryIndex !== undefined && entryIndex !== undefined) {
            updateData[`creditsPerCourse.${courseEntryIndex}.startTime.${entryIndex}.amount`] = pkgAmount;
        }
        if (renewalClasses !== undefined && courseEntryIndex !== undefined && entryIndex !== undefined) {
            updateData[`creditsPerCourse.${courseEntryIndex}.startTime.${entryIndex}.renewalClasses`] = renewalClasses;
        }
        if (renewalFrequency !== undefined && courseEntryIndex !== undefined && entryIndex !== undefined) {
            updateData[`creditsPerCourse.${courseEntryIndex}.startTime.${entryIndex}.renewalFrequency`] = renewalFrequency;
        }
        if (renewalAmount !== undefined && courseEntryIndex !== undefined && entryIndex !== undefined) {
            updateData[`creditsPerCourse.${courseEntryIndex}.startTime.${entryIndex}.renewalAmount`] = renewalAmount;
        }

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
