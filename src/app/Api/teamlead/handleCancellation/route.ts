import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import Class from "@/models/Class";
import Course from "@/models/courseName";
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
        const { studentId, classId, creditDeduction, singleStudent, isNewRecord } = body;

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

        const currentEndDate = activeEntry.endDate ? new Date(activeEntry.endDate) : new Date();

        if (creditDeduction === true && !singleStudent && isNewRecord) {
            // --- WITH DEDUCTION: decrement credits on this package entry (only for new records) ---
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

        } else if (creditDeduction === true && !singleStudent && !isNewRecord) {
            // --- WITH DEDUCTION but existing record: skip credit deduction ---
            return NextResponse.json({
                success: true,
                message: "Attendance updated (existing record — no credit deducted)"
            });

        } else {
            // ── WITHOUT DEDUCTION: find next class based on package's distinct weekdays ──

            // 1. Fetch all classes in the active package entry
            const packageClassIds = (activeEntry.classIds || []).map(
                (id: any) => new mongoose.Types.ObjectId(id)
            );

            const packageClasses = await Class.find({
                _id: { $in: packageClassIds }
            }).select("startTime endTime").lean() as any[];

            // 2. Find distinct weekdays from package classes
            const weekdaySet = new Set<number>();
            const weekdayToClassTime = new Map<number, { startHour: number; startMin: number; duration: number }>();

            for (const cls of packageClasses) {
                const d = new Date(cls.startTime);
                const weekday = d.getUTCDay();
                weekdaySet.add(weekday);
                // Store time for this weekday — last one wins, but all classes
                // on same weekday should have same time
                if (!weekdayToClassTime.has(weekday)) {
                    const endD = new Date(cls.endTime);
                    weekdayToClassTime.set(weekday, {
                        startHour: d.getUTCHours(),
                        startMin: d.getUTCMinutes(),
                        duration: endD.getTime() - d.getTime()
                    });
                }
            }

            const distinctWeekdays = Array.from(weekdaySet).sort((a, b) => a - b);

            if (distinctWeekdays.length === 0) {
                return NextResponse.json({
                    success: false,
                    error: "No weekdays found in package classes"
                }, { status: 400 });
            }

            // 3. Find the earliest date after currentEndDate that matches any package weekday
            const searchFrom = new Date(currentEndDate);
            searchFrom.setUTCDate(searchFrom.getUTCDate() + 1); // start from day after endDate
            searchFrom.setUTCHours(0, 0, 0, 0);

            let targetDate: Date | null = null;
            let targetWeekday: number = -1;

            // Walk forward day by day until we hit a matching weekday (max 7 days)
            for (let i = 0; i < 7; i++) {
                const candidate = new Date(searchFrom);
                candidate.setUTCDate(searchFrom.getUTCDate() + i);
                const candidateWeekday = candidate.getUTCDay();
                if (distinctWeekdays.includes(candidateWeekday)) {
                    targetDate = candidate;
                    targetWeekday = candidateWeekday;
                    break;
                }
            }

            if (!targetDate || targetWeekday === -1) {
                return NextResponse.json({
                    success: false,
                    error: "Could not determine target date for new class"
                }, { status: 500 });
            }

            // 4. Look for existing scheduled class of same course on targetDate
            const targetDayStart = new Date(targetDate);
            targetDayStart.setUTCHours(0, 0, 0, 0);
            const targetDayEnd = new Date(targetDate);
            targetDayEnd.setUTCHours(23, 59, 59, 999);

            const existingClass = await Class.findOne({
                course: new mongoose.Types.ObjectId(courseId),
                startTime: { $gte: targetDayStart, $lte: targetDayEnd },
                status: { $in: ["scheduled", "rescheduled"] }
            }).lean() as any;

            let nextClassId: mongoose.Types.ObjectId;
            let nextClassDate: Date;

            if (existingClass) {
                nextClassId = existingClass._id;
                nextClassDate = new Date(existingClass.startTime);
            } else {
                // 5. Create new class — copy time from a package class on the same weekday
                const timeInfo = weekdayToClassTime.get(targetWeekday);
                if (!timeInfo) {
                    return NextResponse.json({
                        success: false,
                        error: "Could not find time info for target weekday"
                    }, { status: 500 });
                }

                const newStartDate = new Date(targetDate);
                newStartDate.setUTCHours(timeInfo.startHour, timeInfo.startMin, 0, 0);
                const newEndDate = new Date(newStartDate.getTime() + timeInfo.duration);

                const newClass = await Class.create({
                    title: cancelledClass.title,
                    description: cancelledClass.description,
                    course: new mongoose.Types.ObjectId(courseId),
                    instructor: cancelledClass.instructor,
                    startTime: newStartDate,
                    endTime: newEndDate,
                    status: "scheduled",
                    classType: "makeup"
                });

                // Add to student's and tutor's classes arrays
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

                // Add the new class to its course's class array
                await Course.updateOne(
                    { _id: new mongoose.Types.ObjectId(courseId) },
                    { $addToSet: { class: newClass._id } }
                );

                nextClassId = newClass._id;
                nextClassDate = newStartDate;
            }

            // Update package entry — add classId and extend endDate
            await (User as any).updateOne(
                { _id: studentId },
                {
                    $addToSet: {
                        [`creditsPerCourse.${courseEntryIndex}.startTime.${activeEntryIndex}.classIds`]:
                            new mongoose.Types.ObjectId(nextClassId.toString())
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
                { $addToSet: { classes: new mongoose.Types.ObjectId(nextClassId.toString()) } }
            );

            return NextResponse.json({
                success: true,
                message: "Package extended with a new class",
                newClassId: nextClassId,
                newEndDate: nextClassDate,
                targetWeekday,
                distinctWeekdays
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