import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

const ALLOWED_CATEGORIES = ["saleshead", "admin"];

export async function PUT(request: NextRequest) {
    try {
        // Auth: check category from token (no DB call)
        const token = request.cookies.get("token")?.value || "";
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        const decoded: any = jwt.decode(token);
        if (!decoded?.id) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }
        const normalizedCategory = String(decoded.category || "").toLowerCase().replace(/\s/g, "");
        if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

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
            dropReason,
            classesPaid,
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
        if (dropReason !== undefined && courseEntryIndex !== undefined && entryIndex !== undefined) {
            updateData[`creditsPerCourse.${courseEntryIndex}.startTime.${entryIndex}.dropReason`] = dropReason;
        }
        if (classesPaid !== undefined && courseEntryIndex !== undefined && entryIndex !== undefined) {
            updateData[`creditsPerCourse.${courseEntryIndex}.startTime.${entryIndex}.classesPaid`] = classesPaid;
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
