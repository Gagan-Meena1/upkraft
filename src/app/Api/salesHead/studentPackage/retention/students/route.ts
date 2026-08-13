import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
    try {
        await connect();

        const { searchParams } = new URL(request.url);
        const month = searchParams.get("month"); // e.g. "2026-01"
        if (!month) {
            return NextResponse.json({ success: false, error: "month parameter required" }, { status: 400 });
        }

        const [yearStr, monthStr] = month.split("-");
        const year = parseInt(yearStr);
        const monthIndex = parseInt(monthStr) - 1; // 0-indexed
        const monthStart = new Date(year, monthIndex, 1);
        const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch all students
        const students = await User.find({ category: "Student", consider: { $ne: false } })
            .select("username contact email studentSociety creditsPerCourse consider")
            .lean() as any[];

        // Find students whose first class date falls in the given month
        const matchingStudents: any[] = [];
        const allClassIds = new Set<string>();

        for (const student of students) {
            const creditsPerCourse = student.creditsPerCourse || [];
            let earliestDate: Date | null = null;
            const studentClassIds: string[] = [];

            for (const courseEntry of creditsPerCourse) {
                const entries = courseEntry.startTime || [];
                if (entries.length === 0) continue;

                // Find earliest date across ALL entries
                for (const entry of entries) {
                    if (entry.date) {
                        const d = new Date(entry.date);
                        if (!earliestDate || d < earliestDate) earliestDate = d;
                    }
                }

                // Get latest entry's classIds for dynamic endDate
                let latestEntry = entries[0];
                for (let i = 1; i < entries.length; i++) {
                    const entryDate = entries[i].date ? new Date(entries[i].date) : null;
                    const latestDate = latestEntry.date ? new Date(latestEntry.date) : null;
                    if (entryDate && latestDate && entryDate > latestDate) {
                        latestEntry = entries[i];
                    }
                }
                if (latestEntry.show === false) continue;

                for (const cId of (latestEntry.classIds || [])) {
                    const idStr = cId.toString();
                    studentClassIds.push(idStr);
                    allClassIds.add(idStr);
                }
            }

            // Check if first class date falls in the requested month
            if (earliestDate && earliestDate >= monthStart && earliestDate <= monthEnd) {
                matchingStudents.push({
                    studentId: student._id.toString(),
                    name: student.username,
                    phone: student.contact || "",
                    email: student.email || "",
                    society: student.studentSociety || "",
                    firstClassDate: earliestDate.toISOString(),
                    classIds: studentClassIds,
                    consider: student.consider !== false,
                });
            }
        }

        // Batch fetch classes for dynamic endDate
        const classDocs = await Class.find({
            _id: { $in: Array.from(allClassIds).map(id => new mongoose.Types.ObjectId(id)) }
        }).select("startTime").lean() as any[];

        const classStartTimeMap = new Map<string, Date>();
        for (const cls of classDocs) {
            if (cls.startTime) {
                classStartTimeMap.set(cls._id.toString(), new Date(cls.startTime));
            }
        }

        // Compute dynamic endDate and status for each matching student
        const result = matchingStudents.map(s => {
            let maxClassDate: Date | null = null;
            for (const cId of s.classIds) {
                const st = classStartTimeMap.get(cId);
                if (st && (!maxClassDate || st > maxClassDate)) maxClassDate = st;
            }

            let status: "active" | "churned" = "churned";
            if (maxClassDate) {
                const bufferedEnd = new Date(maxClassDate);
                bufferedEnd.setDate(bufferedEnd.getDate() + 14);
                status = bufferedEnd >= today ? "active" : "churned";
            }

            return {
                studentId: s.studentId,
                name: s.name,
                phone: s.phone,
                email: s.email,
                society: s.society,
                firstClassDate: s.firstClassDate,
                dynamicEndDate: maxClassDate ? maxClassDate.toISOString() : null,
                status,
                consider: s.consider,
            };
        });

        // Sort: active first, then by name
        result.sort((a, b) => {
            if (a.status !== b.status) return a.status === "active" ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error("Retention students error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
