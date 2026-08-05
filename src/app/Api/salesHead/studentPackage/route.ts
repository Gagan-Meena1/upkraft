import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import CourseName from "@/models/courseName";
import mongoose from "mongoose";

// Helper: compute dynamic endDate from classIds using a classId→startTime map
function getDynamicEndDate(
    classIds: any[],
    classStartTimeMap: Map<string, Date>
): Date | null {
    let maxDate: Date | null = null;
    for (const cId of classIds) {
        const st = classStartTimeMap.get(cId.toString());
        if (st && (!maxDate || st > maxDate)) maxDate = st;
    }
    return maxDate;
}

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

        // ── Dynamic endDate: bulk fetch classId→startTime for ALL packages ──
        const allPkgClassIds = new Set<string>();
        for (const pkg of allPackages) {
            for (const cId of (pkg.latestEntry.classIds || [])) {
                allPkgClassIds.add(cId.toString());
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

        // Attach dynamic endDate + daysLeft to each package
        for (const pkg of allPackages) {
            const classIds = pkg.latestEntry.classIds || [];
            const dynEnd = getDynamicEndDate(classIds, classStartTimeMap);
            pkg._dynamicEndDate = dynEnd;
            if (dynEnd) {
                const end = new Date(dynEnd);
                end.setHours(0, 0, 0, 0);
                const today = new Date(now);
                today.setHours(0, 0, 0, 0);
                pkg._daysLeft = Math.floor((end.getTime() - today.getTime()) / 86400000);
            } else {
                pkg._daysLeft = 999;
            }
        }

        // Card filter — uses dynamic daysLeft
        const cardFilter = searchParams.get("cardFilter") || "all";
        if (cardFilter !== "all") {
            allPackages = allPackages.filter(pkg => {
                const renewalStatus = pkg.renewalStatus || "YTR";
                const daysLeft = pkg._daysLeft;

                if (cardFilter === "dropped") return renewalStatus === "Dropped";
                if (cardFilter === "renewed") return renewalStatus === "Renewed";
                if (cardFilter === "overdue") return daysLeft <= 0 && renewalStatus !== "Renewed" && renewalStatus !== "Dropped";
                if (cardFilter === "urgent") return daysLeft >= 0 && daysLeft <= 7 && renewalStatus !== "Renewed" && renewalStatus !== "Dropped";
                if (cardFilter === "soon") return daysLeft > 7 && daysLeft <= 20 && renewalStatus !== "Renewed" && renewalStatus !== "Dropped";
                if (cardFilter === "ontrack") return daysLeft > 20 && renewalStatus !== "Renewed" && renewalStatus !== "Dropped";
                return true;
            });
        }

        // Sort by dynamic endDate ascending (earliest end date first)
        allPackages.sort((a, b) => {
            const endA = a._dynamicEndDate
                ? new Date(a._dynamicEndDate).getTime()
                : Infinity;
            const endB = b._dynamicEndDate
                ? new Date(b._dynamicEndDate).getTime()
                : Infinity;
            return endA - endB;
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
            let absentClasses = 0;
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
                    if (attStatus === "absent") {
                        absentClasses++;
                    }
                }
            }

            // Total = non-cancelled classes only
            const totalClasses = allClassCount - cancelledClasses;
            const remainingClasses = totalClasses - completedClasses;

            // Dynamic endDate: use last class's startTime from sorted classes array
            const dynamicEndDate = classes.length > 0
                ? classes[classes.length - 1].startTime
                : (pkg._dynamicEndDate || pkg.latestEntry.endDate || "");

            let daysLeft = 0;
            if (dynamicEndDate) {
                const end = new Date(dynamicEndDate);
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
                lastClassDate: dynamicEndDate,
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
                absent: absentClasses,
                dropReason: pkg.latestEntry.dropReason || "",
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
