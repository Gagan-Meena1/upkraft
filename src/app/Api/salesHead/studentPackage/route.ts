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
        const fSociety = searchParams.get("society") || "";
        const fTutor = searchParams.get("tutorName") || "";
        const fRm = searchParams.get("rm") || "";
        const fSpoc = searchParams.get("spoc") || "";
        const fType = searchParams.get("type") || "";
        const fRenewal = searchParams.get("renewalStatus") || "";

        // 1. Fetch all students with necessary fields (Lean for performance)
        const students = await User.find({
            category: "Student",
            hideFromRenewalDashboard: { $ne: true }
        })
            .select("username email contact address city creditsPerCourse attendance instructorId relationshipManager salesSPOC renewalStatus notes type")
            .populate({ path: "instructorId", select: "username", model: User })
            .populate({ path: "relationshipManager", select: "username", model: User })
            .lean() as any[];

        // 2. Flatten packages across all students
        let allPackages: any[] = [];

        for (const student of students) {
            // Apply student-level filters
            if (fSociety && student.address !== fSociety) continue; // Assuming society is address
            if (fSpoc && student.salesSPOC !== fSpoc) continue;
            if (fRenewal && student.renewalStatus !== fRenewal) continue;
            if (fRm && student.relationshipManager?.username !== fRm) continue;

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

                // Add to flat list
                allPackages.push({
                    studentId: student._id.toString(),
                    studentName: student.username,
                    email: student.email,
                    contact: student.contact,
                    society: student.address,
                    tutorName: Array.isArray(student.instructorId)
                        ? student.instructorId.map((t: any) => t?.username).filter(Boolean).join(", ")
                        : "", rmName: student.relationshipManager?.username || "",
                    salesSPOC: student.salesSPOC || "",
                    renewalStatus: student.renewalStatus || "Not Contacted",
                    notes: student.notes || "",
                    type: student.type || "HOME TUTOR",
                    courseId,
                    latestEntry,
                    entryIndex: latestIndex,
                    courseEntryIndex: ci,
                    attendance: student.attendance || [],
                    creditsPerCourse: student.creditsPerCourse
                });
            }
        }

        // Apply tutor name filter now that it's extracted
        if (fTutor) {
            allPackages = allPackages.filter(p => p.tutorName === fTutor);
        }
        if (fType) {
            allPackages = allPackages.filter(p => p.type === fType);
        }

        // 3. Sort by endDate (ascending: nearer/past dates first)
        allPackages.sort((a, b) => {
            const dateA = a.latestEntry.endDate ? new Date(a.latestEntry.endDate).getTime() : Infinity;
            const dateB = b.latestEntry.endDate ? new Date(b.latestEntry.endDate).getTime() : Infinity;
            return dateA - dateB;
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

        const now = new Date();

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

            const totalClasses = classIds.length;

            let completedClasses = 0;
            let reschCancel = 0;
            for (const cId of classIds) {
                const attStatus = attendanceMap.get(cId);

                // Completed class means having its entry in attendance array with present/absent
                if (attStatus === "present" || attStatus === "absent") {
                    completedClasses++;
                }

                // Check if canceled in attendance array
                if (attStatus === "canceled" || attStatus === "cancelled") {
                    reschCancel++;
                } else {
                    // Or if not canceled in attendance, check if the class document itself is canceled/rescheduled
                    const cls = classMap.get(cId);
                    if (cls && (cls.status === "rescheduled" || cls.status === "cancelled" || cls.status === "canceled")) {
                        reschCancel++;
                    }
                }
            }

            const remainingClasses = totalClasses - completedClasses;

            // Calculate days left using endDate directly, exactly as requested.
            let daysLeft = 0;
            let lastClassDateStr = pkg.latestEntry.endDate || "";
            if (pkg.latestEntry.endDate) {
                const diffTime = new Date(pkg.latestEntry.endDate).getTime() - now.getTime();
                daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
                lastClassDate: lastClassDateStr,
                daysLeft,
                reschCancel,
                renewalStatus: pkg.renewalStatus,
                notes: pkg.notes,
                paymentCycle
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
