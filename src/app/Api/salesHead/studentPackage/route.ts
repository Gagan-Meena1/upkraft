import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import CourseName from "@/models/courseName";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
    try {
        await connect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const search = (searchParams.get("search") || "").toLowerCase();

        // Filters
        const fSociety = (searchParams.get("society") || "").split(",").filter(Boolean);
        const fTutor = (searchParams.get("tutorName") || "").split(",").filter(Boolean);
        const fRm = (searchParams.get("rm") || "").split(",").filter(Boolean);
        const fSpoc = (searchParams.get("spoc") || "").split(",").filter(Boolean);
        const fType = searchParams.get("type") || "";
        const fRenewal = searchParams.get("renewalStatus") || "";
        const now = new Date();


        // 1. Fetch all students with necessary fields (Lean for performance)
        const students = await User.find({
            category: "Student",
            hideFromRenewalDashboard: { $ne: true }
        })
            .select("username email contact address city creditsPerCourse attendance instructorId studentSociety studentRM salesSPOC type")
            .populate({ path: "instructorId", select: "username", model: User })
            .populate({ path: "relationshipManager", select: "username", model: User })
            .lean() as any[];

        // 2. Flatten packages across all students
        let allPackages: any[] = [];

        for (const student of students) {
            // Apply student-level filters
            if (fSpoc.length && !fSpoc.includes(student.salesSPOC || "")) continue;
            if (fSociety.length && !fSociety.includes(student.studentSociety || student.address || "")) continue;
            if (fRm.length && !fRm.includes(student.studentRM || student.relationshipManager?.username || "")) continue;

            // Search filter (name, phone, email)
            if (search) {
                const matchName = (student.username || "").toLowerCase().includes(search);
                const matchEmail = (student.email || "").toLowerCase().includes(search);
                const matchPhone = (student.contact || "").toLowerCase().includes(search);
                if (!matchName && !matchEmail && !matchPhone) continue;
            }

            const creditsPerCourse = student.creditsPerCourse || [];

            // For each course, find the latest entry
            for (let ci = 0; ci < creditsPerCourse.length; ci++) {
                const courseEntry = creditsPerCourse[ci];
                const courseId = courseEntry.courseId?.toString();
                if (!courseId) continue;

                const startTimeEntries = courseEntry.startTime || [];
                if (startTimeEntries.length === 0) continue;

                // Find the latest entry in this course based on date or endDate
                let latestEntry = startTimeEntries[0];
                let latestIndex = 0;
                for (let si = 1; si < startTimeEntries.length; si++) {
                    const entryDate = new Date(startTimeEntries[si].endDate || startTimeEntries[si].date || 0);
                    const latestDate = new Date(latestEntry.endDate || latestEntry.date || 0);
                    if (entryDate > latestDate) {
                        latestEntry = startTimeEntries[si];
                        latestIndex = si;
                    }
                }
                // Find the earliest startTime across ALL courses for this student
                const earliestStartDate = (student.creditsPerCourse || []).reduce((earliest: Date | null, courseEntry: any) => {
                    const entries = courseEntry.startTime || [];
                    for (const entry of entries) {
                        const d = entry.date ? new Date(entry.date) : null;
                        if (d && (!earliest || d < earliest)) return d;
                    }
                    return earliest;
                }, null);

                // Add to flat list
                allPackages.push({
                    studentId: student._id.toString(),
                    studentName: student.username,
                    email: student.email,
                    contact: student.contact,
                    society: student.studentSociety || student.address || "",   // fallback to address if empty
                    rmName: student.studentRM || "",
                    tutorName: Array.isArray(student.instructorId)
                        ? student.instructorId.map((t: any) => t?.username).filter(Boolean).join(", ")
                        : "",
                    salesSPOC: student.salesSPOC || "",
                    renewalStatus: latestEntry.renewalStatus || "YTR",
                    notes: latestEntry.notes || "",
                    renewalNotes: latestEntry.renewalNotes || "",
                    type: student.type || "HOME TUTOR",
                    courseId,
                    latestEntry,
                    entryIndex: latestIndex,
                    courseEntryIndex: ci,
                    attendance: student.attendance || [],
                    creditsPerCourse: student.creditsPerCourse,
                    startDate: earliestStartDate ? earliestStartDate.toISOString() : "",

                });
            }
        }

        // Apply tutor name filter now that it's extracted
        if (fTutor.length) {
            allPackages = allPackages.filter(p => fTutor.includes(p.tutorName));
        }
        if (fRenewal) {
            allPackages = allPackages.filter(p => p.renewalStatus === fRenewal);
        }
        if (fType) {
            allPackages = allPackages.filter(p => p.type === fType);
        }

        // Card filter
        const cardFilter = searchParams.get("cardFilter") || "all";
        if (cardFilter !== "all") {
            allPackages = allPackages.filter(pkg => {
                const renewalStatus = pkg.renewalStatus || "YTR";

                // Calculate completion + daysLeft inline
                const classIds = (pkg.latestEntry.classIds || []).map((id: any) => id.toString());
                const attendanceMap = new Map<string, string>();
                for (const a of pkg.attendance) {
                    if (a.classId) attendanceMap.set(a.classId.toString(), a.status);
                }
                const completed = classIds.filter((id: string) => {
                    const s = attendanceMap.get(id);
                    return s === "present" || s === "absent";
                }).length;
                const completion = classIds.length > 0 ? (completed / classIds.length) * 100 : 0;
                const daysLeft = pkg.latestEntry.endDate
                    ? (() => {
                        const end = new Date(pkg.latestEntry.endDate);
                        end.setHours(0, 0, 0, 0);          // strip time from endDate
                        const today = new Date(now);
                        today.setHours(0, 0, 0, 0);        // strip time from now
                        return Math.floor((end.getTime() - today.getTime()) / 86400000);
                    })()
                    : 999;

                if (cardFilter === "dropped") return renewalStatus === "Dropped";
                if (cardFilter === "renewed") return renewalStatus === "Renewed";
                if (cardFilter === "completed") return completion >= 100 && renewalStatus !== "Renewed" && renewalStatus !== "Dropped";
                if (cardFilter === "overdue") return daysLeft < 0 && renewalStatus !== "Renewed" && renewalStatus !== "Dropped" && completion < 100;
                if (cardFilter === "urgent") return daysLeft >= 0 && daysLeft <= 7 && renewalStatus !== "Renewed" && renewalStatus !== "Dropped" && completion < 100;
                if (cardFilter === "soon") return daysLeft > 7 && daysLeft <= 20 && renewalStatus !== "Renewed" && renewalStatus !== "Dropped" && completion < 100;
                if (cardFilter === "ontrack") return daysLeft > 20 && renewalStatus !== "Renewed" && renewalStatus !== "Dropped" && completion < 100;
                return true;
            });
        }

        // ✅ Fix — nearest to today first (past or future)
        allPackages.sort((a, b) => {
            const nowMs = now.getTime();
            const distA = a.latestEntry.endDate
                ? Math.abs(new Date(a.latestEntry.endDate).getTime() - nowMs)
                : Infinity;
            const distB = b.latestEntry.endDate
                ? Math.abs(new Date(b.latestEntry.endDate).getTime() - nowMs)
                : Infinity;
            return distA - distB;
        });

        const totalItems = allPackages.length;
        const totalPages = Math.ceil(totalItems / limit);

        // 4. Paginate
        const paginatedPackages = allPackages.slice((page - 1) * limit, page * limit);

        // 5. Fetch Class and Course details ONLY for the paginated items
        const allClassIds = new Set<string>();
        const uniqueCourseIds = new Set<string>();

        for (const pkg of paginatedPackages) {
            uniqueCourseIds.add(pkg.courseId);
            for (const cId of (pkg.latestEntry.classIds || [])) {
                allClassIds.add(cId.toString());
            }
        }

        const [allClasses, courseNames] = await Promise.all([
            Class.find({
                _id: { $in: Array.from(allClassIds).map(id => new mongoose.Types.ObjectId(id)) }
            })
                .select("_id title startTime endTime status course")
                .sort({ startTime: 1 })
                .lean() as any,
            CourseName.find({
                _id: { $in: Array.from(uniqueCourseIds).map(id => new mongoose.Types.ObjectId(id)) }
            })
                .select("_id title courseName name category")
                .lean() as any
        ]);

        const classMap = new Map<string, any>();
        for (const cls of allClasses) {
            classMap.set(cls._id.toString(), cls);
        }

        const courseNameMap = new Map<string, string>();
        const courseCategoryMap = new Map<string, string>();
        for (const cn of courseNames) {
            courseNameMap.set(cn._id.toString(), cn.courseName || cn.title || cn.name || "Unknown");
            courseCategoryMap.set(cn._id.toString(), cn.category || "");
        }


        // 6. Assemble final data
        const finalData = paginatedPackages.map(pkg => {
            const attendanceMap = new Map<string, string>();
            for (const a of pkg.attendance) {
                if (a.classId) attendanceMap.set(a.classId.toString(), a.status || "marked");
            }

            const classIds = (pkg.latestEntry.classIds || []).map((id: any) => id.toString());
            const classes = classIds
                .map((id: string) => classMap.get(id))
                .filter(Boolean)
                .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

            const allClassCount = classIds.length;

            let completedClasses = 0;
            let cancelledClasses = 0;
            for (const cId of classIds) {
                const attStatus = attendanceMap.get(cId);

                // Check if canceled in attendance array
                if (attStatus === "canceled" || attStatus === "cancelled") {
                    cancelledClasses++;
                    continue;
                }

                // Or if not canceled in attendance, check if the class document itself is canceled
                const cls = classMap.get(cId);
                if (cls && (cls.status === "cancelled" || cls.status === "canceled")) {
                    cancelledClasses++;
                    continue;
                }

                // Completed class means having its entry in attendance array with present/absent
                if (attStatus === "present" || attStatus === "absent") {
                    completedClasses++;
                }
            }

            // Total = non-cancelled classes only
            const totalClasses = allClassCount - cancelledClasses;
            const remainingClasses = totalClasses - completedClasses;

            // Calculate days left using endDate directly, exactly as requested.
            let daysLeft = 0;
            let lastClassDateStr = pkg.latestEntry.endDate || "";
            if (pkg.latestEntry.endDate) {
                const end = new Date(pkg.latestEntry.endDate);
                end.setHours(0, 0, 0, 0);
                const today = new Date(now);
                today.setHours(0, 0, 0, 0);
                daysLeft = Math.floor((end.getTime() - today.getTime()) / 86400000);
            }

            const completion = totalClasses > 0 ? ((completedClasses / totalClasses) * 100).toFixed(2) : 0;
            const courseEntry = pkg.creditsPerCourse[pkg.courseEntryIndex];
            const paymentCycle = (courseEntry?.startTime || []).length;



            return {
                id: `${pkg.studentId}_${pkg.courseId}`,
                studentId: pkg.studentId,
                courseId: pkg.courseId,
                custName: pkg.studentName,
                studName: pkg.studentName,
                email: pkg.email,
                phone: pkg.contact,
                society: pkg.society,
                tutorName: pkg.tutorName,
                instrument: courseCategoryMap.get(pkg.courseId) || "",
                type: pkg.type,
                rm: pkg.rmName,
                spoc: pkg.salesSPOC,
                pkgAmount: pkg.latestEntry.amount || 0,
                pkgClasses: totalClasses,
                completed: completedClasses,
                totalPkg: totalClasses,
                completion: parseFloat(completion as string),
                remaining: remainingClasses,
                cancelled: cancelledClasses,
                lastClassDate: lastClassDateStr,
                daysLeft,
                reschCancel: cancelledClasses,
                renewalStatus: pkg.renewalStatus,
                renewalNotes: pkg.renewalNotes || "",
                renewalClasses: pkg.latestEntry.renewalClasses || 0,
                renewalFrequency: pkg.latestEntry.renewalFrequency || "",
                renewalAmount: pkg.latestEntry.renewalAmount || 0,
                notes: pkg.notes,
                paymentCycle,
                startDate: pkg.startDate,
                courseEntryIndex: pkg.courseEntryIndex,
                entryIndex: pkg.entryIndex,
            };
        });


        return NextResponse.json({
            success: true,
            data: finalData,
            pagination: {
                total: totalItems,
                page,
                limit,
                totalPages
            }
        });

    } catch (error: any) {
        console.error("Renewal dashboard API error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch data" },
            { status: 500 }
        );
    }
}
