import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connect();

        // Fetch all students
        const students = await User.find({ category: "Student" });

        if (!students.length) {
            return NextResponse.json(
                { success: false, message: "No students found in the database" },
                { status: 404 }
            );
        }

        const results = [];

        for (const user of students) {

            // Skip if no creditsPerCourse
            if (!user.creditsPerCourse || user.creditsPerCourse.length === 0) {
                results.push({
                    userId: user._id,
                    username: user.username,
                    skipped: true,
                    reason: "No creditsPerCourse found"
                });
                continue;
            }

            // Collect all classIds where status is present or absent
            const eligibleClassIds = user.attendance
                .filter(a => a.status === "present" || a.status === "absent")
                .map(a => a.classId.toString());

            // Skip if no eligible attendance
            if (eligibleClassIds.length === 0) {
                results.push({
                    userId: user._id,
                    username: user.username,
                    skipped: true,
                    reason: "No present/absent attendance records"
                });
                continue;
            }

            // For each creditsPerCourse entry, count matches and deduct
            user.creditsPerCourse = user.creditsPerCourse.map(courseEntry => {
                const allClassIdsInCourse = courseEntry.startTime
                    .flatMap(st => st.classIds.map(id => id.toString()));

                const matchCount = eligibleClassIds.filter(id =>
                    allClassIdsInCourse.includes(id)
                ).length;

                if (matchCount > 0) {
                    const deduction = Math.min(matchCount, courseEntry.credits);
                    courseEntry.credits = courseEntry.credits - deduction;
                }

                return courseEntry;
            });

            // Throws and stops everything if save fails
            await user.save();

            results.push({
                userId: user._id,
                username: user.username,
                skipped: false,
                updatedCreditsPerCourse: user.creditsPerCourse,
            });
        }

        return NextResponse.json({
            success: true,
            message: "Credit deduction completed",
            totalStudentsProcessed: results.filter(r => !r.skipped).length,
            totalStudentsSkipped: results.filter(r => r.skipped).length,
            results
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Internal server error",
            },
            { status: 500 }
        );
    }
}
