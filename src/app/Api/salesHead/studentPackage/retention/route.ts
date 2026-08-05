import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
    try {
        await connect();

        const now = new Date();
        const currentYear = now.getFullYear();

        // 1. Fetch all students
        const students = await User.find({ category: "Student", consider: { $ne: false } })
            .select("username creditsPerCourse consider")
            .lean() as any[];

        // 2. Collect ALL classIds from latest entries to batch-fetch
        const allClassIds = new Set<string>();
        const studentData: { studentId: string; firstClassDate: Date | null; classIds: string[]; consider: boolean }[] = [];

        for (const student of students) {
            const creditsPerCourse = student.creditsPerCourse || [];
            let earliestDate: Date | null = null;
            const studentClassIds: string[] = [];

            for (const courseEntry of creditsPerCourse) {
                const entries = courseEntry.startTime || [];
                if (entries.length === 0) continue;

                // Find earliest startTime date across all entries for first class month
                for (const entry of entries) {
                    if (entry.date) {
                        const d = new Date(entry.date);
                        if (!earliestDate || d < earliestDate) earliestDate = d;
                    }
                }

                // Get latest entry's classIds for active/churned status
                let latestEntry = entries[0];
                for (let i = 1; i < entries.length; i++) {
                    const entryDate = entries[i].date ? new Date(entries[i].date) : null;
                    const latestDate = latestEntry.date ? new Date(latestEntry.date) : null;
                    if (entryDate && latestDate && entryDate > latestDate) {
                        latestEntry = entries[i];
                    }
                }

                for (const cId of (latestEntry.classIds || [])) {
                    const idStr = cId.toString();
                    studentClassIds.push(idStr);
                    allClassIds.add(idStr);
                }
            }

            if (earliestDate) {
                studentData.push({
                    studentId: student._id.toString(),
                    firstClassDate: earliestDate,
                    classIds: studentClassIds,
                    consider: student.consider !== false,
                });
            }
        }

        // 3. Batch fetch all classes to get startTime for dynamic endDate
        const classDocs = await Class.find({
            _id: { $in: Array.from(allClassIds).map(id => new mongoose.Types.ObjectId(id)) }
        }).select("startTime").lean() as any[];

        const classStartTimeMap = new Map<string, Date>();
        for (const cls of classDocs) {
            if (cls.startTime) {
                classStartTimeMap.set(cls._id.toString(), new Date(cls.startTime));
            }
        }

        // 4. Compute dynamic endDate for each student and determine active/churned
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Build monthly cohort: Jan of current year to current month
        const months: { month: string; label: string; total: number; active: number; churned: number; retention: number }[] = [];
        const currentMonth = now.getMonth(); // 0-indexed

        for (let m = 0; m <= currentMonth; m++) {
            const monthKey = `${currentYear}-${String(m + 1).padStart(2, "0")}`;
            const monthLabel = new Date(currentYear, m, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            months.push({ month: monthKey, label: monthLabel, total: 0, active: 0, churned: 0, retention: 0 });
        }

        const monthMap = new Map(months.map(m => [m.month, m]));

        for (const sd of studentData) {
            const firstDate = new Date(sd.firstClassDate!);
            if (firstDate.getFullYear() !== currentYear) continue; // only current year

            const monthKey = `${currentYear}-${String(firstDate.getMonth() + 1).padStart(2, "0")}`;
            const bucket = monthMap.get(monthKey);
            if (!bucket) continue;

            // Compute dynamic endDate: max startTime from classIds
            let maxClassDate: Date | null = null;
            for (const cId of sd.classIds) {
                const st = classStartTimeMap.get(cId);
                if (st && (!maxClassDate || st > maxClassDate)) maxClassDate = st;
            }

            bucket.total++;
            if (maxClassDate && maxClassDate >= today) {
                bucket.active++;
            } else {
                bucket.churned++;
            }
        }

        // Calculate retention %
        for (const m of months) {
            m.retention = m.total > 0 ? parseFloat(((m.active / m.total) * 100).toFixed(1)) : 0;
        }

        return NextResponse.json({ success: true, data: months });
    } catch (error: any) {
        console.error("Retention stats error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
