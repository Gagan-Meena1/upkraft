import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import jwt from "jsonwebtoken";

await connect();

interface MonthlyCount {
    month: string;   // "2026-08"
    label: string;   // "Aug 2026"
    count: number;
}

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthLabel(key: string): string {
    const [year, month] = key.split("-");
    return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

function toMonthKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const decoded = jwt.decode(token);
        const userId = decoded && typeof decoded === "object" && "id" in decoded ? decoded.id : null;
        if (!userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // 1. Pull every student's attendance array
        const allStudents = await User.find({ category: "Student" })
            .select("_id attendance")
            .lean();

        // 2. Collect every present/absent attendance RECORD — one entry per
        //    student per class. No dedup: a group class with 10 students all
        //    marked present/absent counts as 10 here, not 1.
        const attendanceRecords: { classId: string }[] = [];
        const referencedClassIdSet = new Set<string>();

        for (const stu of allStudents) {
            for (const att of stu.attendance || []) {
                if (!att.classId) continue;
                if (att.status === "present" || att.status === "absent") {
                    const classIdStr = att.classId.toString();
                    attendanceRecords.push({ classId: classIdStr });
                    referencedClassIdSet.add(classIdStr);
                }
            }
        }

        // 3. Fetch startTime for every referenced class (fetched once, deduped
        //    by classId — just for lookup, not for counting)
        const classDocs = await Class.find({
            _id: { $in: [...referencedClassIdSet] },
        })
            .select("_id startTime")
            .lean();

        const classStartMap = new Map<string, Date>();
        for (const cls of classDocs) {
            if (cls.startTime) classStartMap.set(cls._id.toString(), cls.startTime);
        }

        // 4. Group by month — one tally per attendance record, not per class
        const monthCounts = new Map<string, number>();
        let totalClasses = 0;
        for (const record of attendanceRecords) {
            const startTime = classStartMap.get(record.classId);
            if (!startTime) continue; // no matching Class doc — skip, can't bucket it
            const key = toMonthKey(new Date(startTime));
            monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
            totalClasses++;
        }

        const monthlyClasses: MonthlyCount[] = [...monthCounts.entries()]
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, count]) => ({ month, label: monthLabel(month), count }));

        return NextResponse.json({ success: true, totalClasses, monthlyClasses });
    } catch (error: any) {
        console.error("Error in monthlyClasses API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}