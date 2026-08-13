import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
    try {
        await connect();

        const { searchParams } = new URL(request.url);
        const search = (searchParams.get("search") || "").toLowerCase();
        const fSociety = (searchParams.get("society") || "").split(",").filter(Boolean);
        const fTutor = (searchParams.get("tutorName") || "").split(",").filter(Boolean);
        const fRm = (searchParams.get("rm") || "").split(",").filter(Boolean);
        const fSpoc = (searchParams.get("spoc") || "").split(",").filter(Boolean);
        const fType = searchParams.get("type") || "";
        const fRenewal = searchParams.get("renewalStatus") || "";

        const students = await User.find({
            category: "Student",
            hideFromRenewalDashboard: { $ne: true }
        })
            .select("username email contact address creditsPerCourse attendance instructorId relationshipManager salesSPOC type")
            .populate({ path: "instructorId", select: "username", model: User })
            .populate({ path: "relationshipManager", select: "username", model: User })
            .lean() as any[];

        const now = new Date();

        // Collect dropdown options
        const societies = new Set<string>();
        const tutorNames = new Set<string>();
        const rmNames = new Set<string>();
        const spocNames = new Set<string>();

        const counts = { total: 0, overdue: 0, urgent: 0, soon: 0, ontrack: 0, renewed: 0, dropped: 0 };

        for (const student of students) {
            // Collect dropdown values
            if (student.address) societies.add(student.address);
            if (student.salesSPOC) spocNames.add(student.salesSPOC);
            if (student.relationshipManager?.username) rmNames.add(student.relationshipManager.username);
            if (Array.isArray(student.instructorId)) {
                student.instructorId.forEach((t: any) => { if (t?.username) tutorNames.add(t.username); });
            }

            // Apply filters
            if (fSociety.length && !fSociety.includes(student.studentSociety || student.address || "")) continue;
            if (fSpoc.length && !fSpoc.includes(student.salesSPOC || "")) continue;
            if (fRm.length && !fRm.includes(student.studentRM || student.relationshipManager?.username || "")) continue;
            if (fTutor.length) {
                const names = Array.isArray(student.instructorId)
                    ? student.instructorId.map((t: any) => t?.username).filter(Boolean)
                    : [];
                if (!fTutor.some((f: string) => names.includes(f))) continue;
            }
        }

        // Bulk fetch classId→startTime for all packages to compute dynamic endDate
        const allPkgClassIds = new Set<string>();
        for (const student of students) {
            // Apply same filters to collect classIds only for matching students
            if (fSociety.length && !fSociety.includes(student.studentSociety || student.address || "")) continue;
            if (fSpoc.length && !fSpoc.includes(student.salesSPOC || "")) continue;
            if (fRm.length && !fRm.includes(student.studentRM || student.relationshipManager?.username || "")) continue;
            if (fTutor.length) {
                const names = Array.isArray(student.instructorId)
                    ? student.instructorId.map((t: any) => t?.username).filter(Boolean)
                    : [];
                if (!fTutor.some((f: string) => names.includes(f))) continue;
            }
            if (search) {
                const matchName = (student.username || "").toLowerCase().includes(search);
                const matchEmail = (student.email || "").toLowerCase().includes(search);
                const matchPhone = (student.contact || "").toLowerCase().includes(search);
                if (!matchName && !matchEmail && !matchPhone) continue;
            }

            for (const courseEntry of (student.creditsPerCourse || [])) {
                const startTimeEntries = courseEntry.startTime || [];
                if (!startTimeEntries.length) continue;

                // Find latest entry (same logic as counting loop)
                let latestEntry = startTimeEntries[0];
                for (let i = 1; i < startTimeEntries.length; i++) {
                    const entryDate = new Date(startTimeEntries[i].date || 0);
                    const latestDate = new Date(latestEntry.date || 0);
                    if (entryDate > latestDate) latestEntry = startTimeEntries[i];
                }
                if (latestEntry.show === false) continue;
                for (const cId of (latestEntry.classIds || [])) {
                    allPkgClassIds.add(cId.toString());
                }
            }
        }

        const classStartTimeDocs = await Class.find({
            _id: { $in: Array.from(allPkgClassIds).map(id => new mongoose.Types.ObjectId(id)) }
        })
            .select("_id startTime")
            .lean() as any[];

        const classStartTimeMap = new Map<string, Date>();
        for (const doc of classStartTimeDocs) {
            classStartTimeMap.set(doc._id.toString(), new Date(doc.startTime));
        }

        // Second pass: count stats using dynamic endDate
        for (const student of students) {
            // Apply same filters
            if (fSociety.length && !fSociety.includes(student.studentSociety || student.address || "")) continue;
            if (fSpoc.length && !fSpoc.includes(student.salesSPOC || "")) continue;
            if (fRm.length && !fRm.includes(student.studentRM || student.relationshipManager?.username || "")) continue;
            if (fTutor.length) {
                const names = Array.isArray(student.instructorId)
                    ? student.instructorId.map((t: any) => t?.username).filter(Boolean)
                    : [];
                if (!fTutor.some((f: string) => names.includes(f))) continue;
            }
            if (search) {
                const matchName = (student.username || "").toLowerCase().includes(search);
                const matchEmail = (student.email || "").toLowerCase().includes(search);
                const matchPhone = (student.contact || "").toLowerCase().includes(search);
                if (!matchName && !matchEmail && !matchPhone) continue;
            }

            const creditsPerCourse = student.creditsPerCourse || [];
            for (const courseEntry of creditsPerCourse) {
                const startTimeEntries = courseEntry.startTime || [];
                if (!startTimeEntries.length) continue;

                let latestEntry = startTimeEntries[0];
                for (let i = 1; i < startTimeEntries.length; i++) {
                    const entryDate = new Date(startTimeEntries[i].date || 0);
                    const latestDate = new Date(latestEntry.date || 0);
                    if (entryDate > latestDate) latestEntry = startTimeEntries[i];
                }
                if (latestEntry.show === false) continue;

                // Compute dynamic endDate from classIds
                const classIds = latestEntry.classIds || [];
                let dynamicEndDate: Date | null = null;
                for (const cId of classIds) {
                    const st = classStartTimeMap.get(cId.toString());
                    if (st && (!dynamicEndDate || st > dynamicEndDate)) dynamicEndDate = st;
                }

                const daysLeft = dynamicEndDate
                    ? (() => {
                        const end = new Date(dynamicEndDate);
                        end.setHours(0, 0, 0, 0);
                        const today = new Date(now);
                        today.setHours(0, 0, 0, 0);
                        return Math.floor((end.getTime() - today.getTime()) / 86400000);
                    })()
                    : 999;
                const renewalStatus = latestEntry.renewalStatus || "YTR";

                if (fRenewal && renewalStatus !== fRenewal) continue;

                counts.total++;
                if (renewalStatus === "Dropped") counts.dropped++;
                else if (renewalStatus === "Renewed") counts.renewed++;
                else if (daysLeft <= 0) counts.overdue++;
                else if (daysLeft <= 7) counts.urgent++;
                else if (daysLeft <= 20) counts.soon++;
                else counts.ontrack++;
            }
        }

        return NextResponse.json({
            success: true,
            counts,
            options: {
                societies: [...societies].sort(),
                tutorNames: [...tutorNames].sort(),
                rmNames: [...rmNames].sort(),
                spocNames: [...spocNames].sort(),
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}