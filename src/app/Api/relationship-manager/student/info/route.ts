import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import courseName from "@/models/courseName";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
    try {
        await connect();

        const { studentId } = await request.json();
        if (!studentId) {
            return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        // Single DB call: fetch student with all needed fields
        const student = await (User as any).findById(studentId)
            .select("username email contact address city creditsPerCourse attendance")
            .lean() as any;

        if (!student) {
            return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
        }

        // Build contact info immediately
        const contactInfo = {
            username: student.username || "",
            email: student.email || "",
            contact: student.contact || "",
            address: student.address || "",
            city: student.city || "",
        };

        const creditsPerCourse: any[] = student.creditsPerCourse || [];
        const attendance: any[] = student.attendance || [];
        const now = new Date();

        // Build attendance lookup map: classId -> status (O(n) once)
        const attendanceByClassId = new Map<string, string>();
        for (const a of attendance) {
            if (a.classId) {
                attendanceByClassId.set(a.classId.toString(), a.status);
            }
        }

        // Determine which courseIds to show:
        // 1. All courses where any entry has endDate > today
        // 2. Fallback: the single most recent course by latest startTime.date
        const activeCourseEntries: { courseId: string; entry: any; entryIndex: number; courseEntryIndex: number }[] = [];
        let fallbackEntry: { courseId: string; entry: any; entryIndex: number; courseEntryIndex: number } | null = null;
        let fallbackDate = new Date(0);

        for (let ci = 0; ci < creditsPerCourse.length; ci++) {
            const courseEntry = creditsPerCourse[ci];
            const courseId = courseEntry.courseId?.toString();
            if (!courseId) continue;

            const startTimeEntries: any[] = courseEntry.startTime || [];
            let hasActiveEntry = false;

            for (let si = 0; si < startTimeEntries.length; si++) {
                const entry = startTimeEntries[si];
                const endDate = entry.endDate ? new Date(entry.endDate) : null;

                if (endDate && endDate > now) {
                    activeCourseEntries.push({ courseId, entry, entryIndex: si, courseEntryIndex: ci });
                    hasActiveEntry = true;
                }
            }

            // Track fallback: most recent entry by date across all courses
            if (!hasActiveEntry) {
                for (let si = 0; si < startTimeEntries.length; si++) {
                    const entry = startTimeEntries[si];
                    const entryDate = entry.date ? new Date(entry.date) : new Date(0);
                    if (entryDate > fallbackDate) {
                        fallbackDate = entryDate;
                        fallbackEntry = { courseId, entry, entryIndex: si, courseEntryIndex: ci };
                    }
                }
            }
        }

        // If no active entries found, use fallback
        const entriesToProcess = activeCourseEntries.length > 0
            ? activeCourseEntries
            : (fallbackEntry ? [fallbackEntry] : []);

        if (entriesToProcess.length === 0) {
            return NextResponse.json({
                success: true,
                contactInfo,
                packages: [],
            });
        }

        // Collect all unique classIds across all entries + all unique courseIds
        const allClassIds = new Set<string>();
        const uniqueCourseIds = new Set<string>();

        for (const e of entriesToProcess) {
            uniqueCourseIds.add(e.courseId);
            for (const cId of (e.entry.classIds || [])) {
                allClassIds.add(cId.toString());
            }
        }

        // Parallel: fetch all classes + all course names in 2 DB calls
        const [allClasses, courseNames] = await Promise.all([
            Class.find({
                _id: { $in: Array.from(allClassIds).map(id => new mongoose.Types.ObjectId(id)) }
            })
                .select("_id title startTime endTime status course")
                .sort({ startTime: 1 })
                .lean() as any,
            courseName.find({
                _id: { $in: Array.from(uniqueCourseIds).map(id => new mongoose.Types.ObjectId(id)) }
            })
                .select("_id title courseName name category")
                .lean() as any
        ]);

        // Build class lookup map: classId -> class doc
        const classMap = new Map<string, any>();
        for (const cls of allClasses) {
            classMap.set(cls._id.toString(), cls);
        }

        // Build course name lookup: courseId -> name
        const courseNameMap = new Map<string, string>();
        for (const cn of courseNames) {
            courseNameMap.set(cn._id.toString(), cn.courseName || cn.title || cn.name || "Unknown");
        }

        // Build course category lookup: courseId -> category (for instrument)
        const courseCategoryMap = new Map<string, string>();
        for (const cn of courseNames) {
            courseCategoryMap.set(cn._id.toString(), cn.category || "");
        }

        // Process each entry to build package info
        const packages = entriesToProcess.map((e) => {
            const classIds: string[] = (e.entry.classIds || []).map((id: any) => id.toString());
            const classes = classIds
                .map(id => classMap.get(id))
                .filter(Boolean)
                .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

            const totalClasses = classIds.length;

            // Completed = attendance record exists for that classId (any status)
            let completedClasses = 0;
            for (const cId of classIds) {
                if (attendanceByClassId.has(cId)) {
                    completedClasses++;
                }
            }

            const remainingClasses = totalClasses - completedClasses;

            // Last class: latest class that has an attendance record, sorted desc
            let lastClass: any = null;
            for (let i = classes.length - 1; i >= 0; i--) {
                const cls = classes[i];
                if (attendanceByClassId.has(cls._id.toString())) {
                    lastClass = {
                        title: cls.title,
                        startTime: cls.startTime,
                        _id: cls._id,
                    };
                    break;
                }
            }

            // Next class: first future class (startTime > now) with status scheduled or rescheduled
            let nextClass: any = null;
            for (const cls of classes) {
                if (
                    new Date(cls.startTime) > now &&
                    ["scheduled", "rescheduled"].includes(cls.status)
                ) {
                    nextClass = {
                        title: cls.title,
                        startTime: cls.startTime,
                        _id: cls._id,
                    };
                    break;
                }
            }

            // End date: startTime of the last class in the entry
            const endDate = classes.length > 0
                ? classes[classes.length - 1].startTime
                : e.entry.endDate || null;

            // Payment cycle: total number of entries in this courseId
            const courseEntry = creditsPerCourse[e.courseEntryIndex];
            const paymentCycle = (courseEntry?.startTime || []).length;

            return {
                courseId: e.courseId,
                courseName: courseNameMap.get(e.courseId) || "Unknown",
                instrument: courseCategoryMap.get(e.courseId) || "",
                totalClasses,
                completedClasses,
                remainingClasses,
                lastClass,
                nextClass,
                endDate,
                packageEndDate: e.entry.endDate || null,
                paymentCycle,
            };
        });

        return NextResponse.json({
            success: true,
            contactInfo,
            packages,
        });

    } catch (error: any) {
        console.error("Student info error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch student info" },
            { status: 500 }
        );
    }
}
