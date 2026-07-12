import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
    try {
        await connect();

        const { searchParams } = new URL(request.url);
        const search = (searchParams.get("search") || "").toLowerCase();
        const fSociety = searchParams.get("society") || "";
        const fTutor = searchParams.get("tutorName") || "";
        const fRm = searchParams.get("rm") || "";
        const fSpoc = searchParams.get("spoc") || "";
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

        const counts = { total: 0, overdue: 0, urgent: 0, soon: 0, ontrack: 0, completed: 0, renewed: 0 };

        for (const student of students) {
            // Collect dropdown values
            if (student.address) societies.add(student.address);
            if (student.salesSPOC) spocNames.add(student.salesSPOC);
            if (student.relationshipManager?.username) rmNames.add(student.relationshipManager.username);
            if (Array.isArray(student.instructorId)) {
                student.instructorId.forEach((t: any) => { if (t?.username) tutorNames.add(t.username); });
            }

            // Apply filters
            if (fSociety && student.studentSociety !== fSociety) continue;
            if (fSpoc && student.salesSPOC !== fSpoc) continue;
            if (fRm && student.studentRM !== fRm) continue;
            if (fTutor) {
                const names = Array.isArray(student.instructorId)
                    ? student.instructorId.map((t: any) => t?.username).filter(Boolean)
                    : [];
                if (!names.includes(fTutor)) continue;
            }
            if (search) {
                const matchName = (student.username || "").toLowerCase().includes(search);
                const matchEmail = (student.email || "").toLowerCase().includes(search);
                const matchPhone = (student.contact || "").toLowerCase().includes(search);
                if (!matchName && !matchEmail && !matchPhone) continue;
            }

            // For each student, get latest package endDate
            const creditsPerCourse = student.creditsPerCourse || [];
            for (const courseEntry of creditsPerCourse) {
                const startTimeEntries = courseEntry.startTime || [];
                if (!startTimeEntries.length) continue;

                let latestEntry = startTimeEntries[0];
                for (let i = 1; i < startTimeEntries.length; i++) {
                    if (new Date(startTimeEntries[i].endDate || 0) > new Date(latestEntry.endDate || 0)) {
                        latestEntry = startTimeEntries[i];
                    }
                }

                const classIds = latestEntry.classIds || [];
                const totalClasses = classIds.length;
                const attendanceMap = new Map<string, string>();
                for (const a of (student.attendance || [])) {
                    if (a.classId) attendanceMap.set(a.classId.toString(), a.status);
                }
                const completedClasses = classIds.filter((id: any) => {
                    const s = attendanceMap.get(id.toString());
                    return s === "present" || s === "absent";
                }).length;

                const completion = totalClasses > 0 ? (completedClasses / totalClasses) * 100 : 0;
                const daysLeft = latestEntry.endDate
                    ? (() => {
                        const end = new Date(latestEntry.endDate);
                        end.setHours(0, 0, 0, 0);
                        const today = new Date(now);
                        today.setHours(0, 0, 0, 0);
                        return Math.floor((end.getTime() - today.getTime()) / 86400000);
                    })()
                    : 999;
                const renewalStatus = latestEntry.renewalStatus || "Not Contacted";

                if (fRenewal && renewalStatus !== fRenewal) continue;

                counts.total++;
                if (renewalStatus === "Renewed") counts.renewed++;
                else if (completion >= 100) counts.completed++;
                else if (daysLeft <= 0) counts.overdue++;           // ← past end date
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