import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import Class from "@/models/Class";
import AttendanceResetRequest from "@/models/AttendanceResetRequest";
import mongoose from "mongoose";

await connect();

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value || "";
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const decoded: any = jwt.decode(token);
        if (!decoded?.id) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const tlId = decoded.id;
        const tlUser = await (User as any).findById(tlId).select("category");
        if (!tlUser || !["teamlead", "team lead", "TeamLead"].includes(
            String(tlUser.category).toLowerCase().replace(/\s/g, "")
        )) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { studentId, classId, creditDeduction, singleStudent } = body;

        if (!studentId || !classId) {
            return NextResponse.json({ success: false, error: "studentId and classId are required" }, { status: 400 });
        }

        // 1. Fetch the cancelled class to get courseId and time details
        const cancelledClass = await Class.findById(classId).lean() as any;
        if (!cancelledClass) {
            return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
        }

        const courseId = cancelledClass.course?.toString();
        if (!courseId) {
            return NextResponse.json({ success: false, error: "Class has no associated course" }, { status: 400 });
        }

        // 2. Fetch student
        const student = await (User as any).findById(studentId);
        if (!student) {
            return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
        }

        // 3. Find the matching creditsPerCourse entry for this courseId
        const courseEntry = student.creditsPerCourse?.find(
            (entry: any) => entry.courseId?.toString() === courseId
        );

        if (!courseEntry) {
            return NextResponse.json({
                success: false,
                error: "No creditsPerCourse entry found for this course"
            }, { status: 404 });
        }

        // 4. Find the active package — startTime sub-entry with the latest `date`
        //    that also contains this classId in its classIds array
        const startTimeEntries: any[] = courseEntry.startTime || [];

        // Find entry that contains this classId
        let activeEntryIndex = -1;
        let activeEntry: any = null;

        for (let i = 0; i < startTimeEntries.length; i++) {
            const entry = startTimeEntries[i];
            const hasClass = (entry.classIds || []).some(
                (cId: any) => cId.toString() === classId
            );
            if (hasClass) {
                if (!activeEntry || new Date(entry.date) > new Date(activeEntry.date)) {
                    activeEntry = entry;
                    activeEntryIndex = i;
                }
            }
        }

        // Fallback: if classId not found in any entry, pick the most recent entry by date
        if (!activeEntry && startTimeEntries.length > 0) {
            startTimeEntries.forEach((entry, i) => {
                if (!activeEntry || new Date(entry.date) > new Date(activeEntry.date)) {
                    activeEntry = entry;
                    activeEntryIndex = i;
                }
            });
        }

        if (!activeEntry || activeEntryIndex === -1) {
            return NextResponse.json({
                success: false,
                error: "No active package entry found"
            }, { status: 404 });
        }

        // 5. Find indices in the student document for targeted $set
        const courseEntryIndex = student.creditsPerCourse.findIndex(
            (entry: any) => entry.courseId?.toString() === courseId
        );

        if (creditDeduction === true && !singleStudent) {
            // --- WITH DEDUCTION: decrement credits on this package entry ---
            await (User as any).updateOne(
                { _id: studentId },
                {
                    $inc: {
                        [`creditsPerCourse.${courseEntryIndex}.credits`]: -1,
                        credits: -1
                    }
                }
            );

            return NextResponse.json({
                success: true,
                message: "Credit deducted from active package"
            });

        } else {
            // --- WITHOUT DEDUCTION: find next class after endDate, add to package ---
            const currentEndDate = activeEntry.endDate ? new Date(activeEntry.endDate) : new Date();

            // Get the weekday of the cancelled class (0=Sun, 1=Mon, ... 6=Sat)
            const cancelledWeekday = new Date(cancelledClass.startTime).getUTCDay();

            // Fetch all scheduled classes of this course after endDate, sorted ascending
            const candidateClasses = await Class.find({
                course: new mongoose.Types.ObjectId(courseId),
                startTime: { $gt: currentEndDate },
                status: { $in: ["scheduled", "rescheduled"] }
            })
                .sort({ startTime: 1 })
                .lean() as any[];

            // Pick the first one that falls on the same weekday as the cancelled class
            const nextClass = candidateClasses.find(
                (cls: any) => new Date(cls.startTime).getUTCDay() === cancelledWeekday
            ) || null;

            let nextClassId: string;
            let nextClassDate: Date;

            if (nextClass) {
                nextClassId = nextClass._id.toString();
                nextClassDate = new Date(nextClass.startTime);
            } else {
                // No class found — create one copying details from the cancelled class
                // Calculate the same time of day (HH:mm) but on the day after currentEndDate
                const cancelledStart = new Date(cancelledClass.startTime);
                const cancelledEnd = new Date(cancelledClass.endTime);

                // Duration in ms
                const duration = cancelledEnd.getTime() - cancelledStart.getTime();

                // Find next occurrence of the same weekday after currentEndDate
                const newStartDate = new Date(currentEndDate);
                newStartDate.setUTCDate(newStartDate.getUTCDate() + 1); // start from day after endDate
                // Advance until we hit the same weekday as the cancelled class
                while (newStartDate.getUTCDay() !== cancelledWeekday) {
                    newStartDate.setUTCDate(newStartDate.getUTCDate() + 1);
                }
                newStartDate.setUTCHours(
                    cancelledStart.getUTCHours(),
                    cancelledStart.getUTCMinutes(),
                    0, 0
                );
                const newEndDate = new Date(newStartDate.getTime() + duration);

                const newClass = await Class.create({
                    title: cancelledClass.title,
                    description: cancelledClass.description,
                    course: new mongoose.Types.ObjectId(courseId),
                    instructor: cancelledClass.instructor,
                    startTime: newStartDate,
                    endTime: newEndDate,
                    status: "scheduled",
                    classType: cancelledClass.classType || "makeup",
                });

                // Add to student's classes array too
                await (User as any).updateOne(
                    { _id: studentId },
                    { $addToSet: { classes: newClass._id } }
                );
                if (cancelledClass.instructor) {
                    await (User as any).updateOne(
                        { _id: cancelledClass.instructor },
                        { $addToSet: { classes: newClass._id } }
                    );
                }

                nextClassId = newClass._id.toString();
                nextClassDate = newStartDate;
            }

            // Add nextClassId to the classIds of the active package entry
            // and update endDate to the new class's date
            await (User as any).updateOne(
                { _id: studentId },
                {
                    $addToSet: {
                        [`creditsPerCourse.${courseEntryIndex}.startTime.${activeEntryIndex}.classIds`]:
                            new mongoose.Types.ObjectId(nextClassId)
                    },
                    $set: {
                        [`creditsPerCourse.${courseEntryIndex}.startTime.${activeEntryIndex}.endDate`]:
                            nextClassDate
                    }
                }
            );

            // Also add to student's classes array if not already there
            await (User as any).updateOne(
                { _id: studentId },
                { $addToSet: { classes: new mongoose.Types.ObjectId(nextClassId) } }
            );

            return NextResponse.json({
                success: true,
                message: "Package extended with a new class",
                newClassId: nextClassId,
                newEndDate: nextClassDate
            });
        }

    } catch (error: any) {
        console.error("Handle cancellation error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to handle cancellation"
        }, { status: 500 });
    }
}