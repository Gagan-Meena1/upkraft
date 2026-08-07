import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
    try {
        await connect();

        // Fetch all students with creditsPerCourse data
        const students = await User.find({ 
            category: "Student",
            hideFromRenewalDashboard: { $ne: true }
        })
            .select("username contact email studentSociety creditsPerCourse")
            .lean() as any[];

        // Aggregate drop reasons from all creditsPerCourse entries
        const reasonMap = new Map<string, { count: number; students: any[] }>();

        for (const student of students) {
            const creditsPerCourse = student.creditsPerCourse || [];

            for (const courseEntry of creditsPerCourse) {
                const startTimeEntries = courseEntry.startTime || [];
                if (startTimeEntries.length === 0) continue;

                // Find the latest entry in this course based on startDate (date field)
                let latestEntry = startTimeEntries[0];
                for (let si = 1; si < startTimeEntries.length; si++) {
                    const entryDate = new Date(startTimeEntries[si].date || 0);
                    const latestDate = new Date(latestEntry.date || 0);
                    if (entryDate > latestDate) {
                        latestEntry = startTimeEntries[si];
                    }
                }

                if (latestEntry.renewalStatus === "Dropped") {
                    let reason = (latestEntry.dropReason || "").trim();
                    if (!reason) {
                        reason = "No reason specified";
                    }

                    if (!reasonMap.has(reason)) {
                        reasonMap.set(reason, { count: 0, students: [] });
                    }

                    const bucket = reasonMap.get(reason)!;
                    bucket.count++;
                    bucket.students.push({
                        studentId: student._id.toString(),
                        name: student.username || "",
                        phone: student.contact || "",
                        email: student.email || "",
                        society: student.studentSociety || "",
                        notes: latestEntry.notes || "",
                        renewalNotes: latestEntry.renewalNotes || "",
                        dropReason: latestEntry.dropReason || "",
                    });
                }
            }
        }

        // Convert to array and calculate percentages
        const totalDropped = Array.from(reasonMap.values()).reduce((sum, r) => sum + r.count, 0);

        const composition = Array.from(reasonMap.entries())
            .map(([reason, data]) => ({
                reason,
                count: data.count,
                percentage: totalDropped > 0 ? parseFloat(((data.count / totalDropped) * 100).toFixed(1)) : 0,
                students: data.students,
            }))
            .sort((a, b) => b.count - a.count); // Sort by count descending

        return NextResponse.json({
            success: true,
            data: {
                totalDropped,
                composition,
            },
        });
    } catch (error: any) {
        console.error("Drop composition error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
