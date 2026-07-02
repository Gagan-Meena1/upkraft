import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import courseName from "@/models/courseName";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
    try {
        await connect();

        const token = request.cookies.get("token")?.value || "";
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const decoded: any = jwt.decode(token);
        if (!decoded?.id) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const body = await request.json();
        const { studentId, startDate, endDate } = body;

        if (!studentId || !startDate || !endDate) {
            return NextResponse.json({ success: false, error: "studentId, startDate and endDate are required" }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        // Include full end day
        end.setHours(23, 59, 59, 999);

        // Get student's class IDs
        const student = await (User as any).findById(studentId).select("classes").lean() as any;
        if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });

        const classIds = student.classes || [];

        // Find classes in range
        const classes = await Class.find({
            _id: { $in: classIds },
            startTime: { $gte: start, $lte: end },
            status: { $nin: ["canceled"] }
        })
            .populate("course", "courseName title name")
            .lean() as any[];

        if (classes.length === 0) {
            return NextResponse.json({ success: true, cancelledCount: 0, classes: [] });
        }

        // Return preview data grouped by course
        return NextResponse.json({
            success: true,
            classes: classes.map((cls: any) => ({
                _id: cls._id,
                title: cls.title,
                startTime: cls.startTime,
                endTime: cls.endTime,
                course: {
                    _id: cls.course?._id,
                    name: cls.course?.courseName || cls.course?.title || cls.course?.name || "Unknown"
                }
            }))
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
export async function PUT(request: NextRequest) {
    try {
        await connect();

        const token = request.cookies.get("token")?.value || "";
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const decoded: any = jwt.decode(token);
        if (!decoded?.id) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const body = await request.json();
        const { classIds, studentId, creditDeduction, reasonForCancellation } = body;

        if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
            return NextResponse.json({ success: false, error: "classIds array is required" }, { status: 400 });
        }
        if (!studentId) {
            return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        const newAttendanceStatus = creditDeduction ? "absent" : "canceled";

        // ─── 1. Fetch everything we need in parallel ───────────────────────────
        const [student, cancelledClasses] = await Promise.all([
            (User as any).findById(studentId).lean() as any,
            Class.find({
                _id: { $in: classIds.map((id: string) => new mongoose.Types.ObjectId(id)) }
            }).lean() as any[]
        ]);

        if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });

        // ─── 2. Build attendance $set in memory ────────────────────────────────
        const existingAttendance: any[] = student.attendance || [];
        const attendanceSetFields: Record<string, any> = {};
        const attendanceToPush: any[] = [];

        for (const classId of classIds) {
            const idx = existingAttendance.findIndex(
                (a: any) => a.classId?.toString() === classId
            );
            if (idx !== -1) {
                attendanceSetFields[`attendance.${idx}.status`] = newAttendanceStatus;
                attendanceSetFields[`attendance.${idx}.reasonForCancellation`] = reasonForCancellation || "";
            } else {
                attendanceToPush.push({
                    classId: new mongoose.Types.ObjectId(classId),
                    status: newAttendanceStatus,
                    reasonForCancellation: reasonForCancellation || ""
                });
            }
        }

        // ─── 3. Build creditsPerCourse $set in memory ──────────────────────────
        // Group cancelled classes by courseId
        const classByCourse = new Map<string, any[]>();
        for (const cls of cancelledClasses) {
            const courseId = cls.course?.toString();
            if (!courseId) continue;
            if (!classByCourse.has(courseId)) classByCourse.set(courseId, []);
            classByCourse.get(courseId)!.push(cls);
        }

        const creditsPerCourse: any[] = student.creditsPerCourse || [];
        const creditSetFields: Record<string, any> = {};

        // Track new classes to add to student.classes array
        const newClassIdsToAdd: mongoose.Types.ObjectId[] = [];

        for (const [courseId, classes] of classByCourse.entries()) {
            // Find matching creditsPerCourse entry index
            const courseEntryIdx = creditsPerCourse.findIndex(
                (e: any) => e.courseId?.toString() === courseId
            );
            if (courseEntryIdx === -1) continue;

            const courseEntry = creditsPerCourse[courseEntryIdx];
            const startTimeEntries: any[] = courseEntry.startTime || [];

            // Sort cancelled classes by startTime ascending so we process in order
            const sortedClasses = [...classes].sort(
                (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );

            for (const cls of sortedClasses) {
                const classId = cls._id.toString();

                // Find active package entry — one that contains this classId
                let activeEntryIdx = startTimeEntries.findIndex(
                    (e: any) => (e.classIds || []).some((cId: any) => cId.toString() === classId)
                );

                // Fallback to most recent entry by date
                if (activeEntryIdx === -1 && startTimeEntries.length > 0) {
                    activeEntryIdx = startTimeEntries.reduce((bestIdx, entry, idx) => {
                        return new Date(entry.date) > new Date(startTimeEntries[bestIdx].date)
                            ? idx : bestIdx;
                    }, 0);
                }

                if (activeEntryIdx === -1) continue;

                // Use in-memory updated endDate (from previous iterations of this loop)
                const endDateKey = `creditsPerCourse.${courseEntryIdx}.startTime.${activeEntryIdx}.endDate`;
                const currentEndDate: Date = creditSetFields[endDateKey]
                    ? new Date(creditSetFields[endDateKey])
                    : new Date(startTimeEntries[activeEntryIdx].endDate || new Date());

                if (creditDeduction) {
                    // ── WITH DEDUCTION: decrement credits ──
                    const creditsKey = `creditsPerCourse.${courseEntryIdx}.credits`;
                    // Track running credit value in memory
                    if (creditSetFields[creditsKey] === undefined) {
                        creditSetFields[creditsKey] = (courseEntry.credits ?? 0) - 1;
                    } else {
                        creditSetFields[creditsKey] -= 1;
                    }

                } else {
                    // ── WITHOUT DEDUCTION: find next class based on package's distinct weekdays ──

                    // Fetch all classes in the active package entry
                    const packageClassIds = (startTimeEntries[activeEntryIdx].classIds || []).map(
                        (id: any) => new mongoose.Types.ObjectId(id)
                    );

                    const packageClasses = await Class.find({
                        _id: { $in: packageClassIds }
                    }).select("startTime endTime").lean() as any[];

                    // Find distinct weekdays and time per weekday
                    const weekdaySet = new Set<number>();
                    const weekdayToClassTime = new Map<number, { startHour: number; startMin: number; duration: number }>();

                    for (const pkgCls of packageClasses) {
                        const d = new Date(pkgCls.startTime);
                        const weekday = d.getUTCDay();
                        weekdaySet.add(weekday);
                        if (!weekdayToClassTime.has(weekday)) {
                            const endD = new Date(pkgCls.endTime);
                            weekdayToClassTime.set(weekday, {
                                startHour: d.getUTCHours(),
                                startMin: d.getUTCMinutes(),
                                duration: endD.getTime() - d.getTime()
                            });
                        }
                    }

                    const distinctWeekdays = Array.from(weekdaySet).sort((a, b) => a - b);

                    if (distinctWeekdays.length === 0) continue; // skip if no weekdays found

                    // Find earliest date after currentEndDate matching any package weekday
                    const searchFrom = new Date(currentEndDate);
                    searchFrom.setUTCDate(searchFrom.getUTCDate() + 1);
                    searchFrom.setUTCHours(0, 0, 0, 0);

                    let targetDate: Date | null = null;
                    let targetWeekday: number = -1;

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

                    if (!targetDate || targetWeekday === -1) continue; // skip if no target date found

                    // Look for existing class of same course on targetDate
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
                        // Create new class using time from package class on same weekday
                        const timeInfo = weekdayToClassTime.get(targetWeekday);
                        if (!timeInfo) continue;

                        const newStartDate = new Date(targetDate);
                        newStartDate.setUTCHours(timeInfo.startHour, timeInfo.startMin, 0, 0);
                        const newEndDate = new Date(newStartDate.getTime() + timeInfo.duration);

                        const newClass = await Class.create({
                            title: cls.title,
                            description: cls.description,
                            course: new mongoose.Types.ObjectId(courseId),
                            instructor: cls.instructor,
                            startTime: newStartDate,
                            endTime: newEndDate,
                            status: "scheduled",
                            classType: "makeup"
                        });

                        // Add to student's and tutor's classes
                        newClassIdsToAdd.push(newClass._id);

                        if (cls.instructor) {
                            await (User as any).updateOne(
                                { _id: cls.instructor },
                                { $addToSet: { classes: newClass._id } }
                            );
                        }

                        nextClassId = newClass._id;
                        nextClassDate = newStartDate;
                    }

                    // Update endDate in memory for next iteration of same course
                    creditSetFields[endDateKey] = nextClassDate;

                    // Track classId to add to package entry
                    const classIdsKey = `creditsPerCourse.${courseEntryIdx}.startTime.${activeEntryIdx}.classIds`;
                    if (!creditSetFields[`__push__${classIdsKey}`]) {
                        creditSetFields[`__push__${classIdsKey}`] = [];
                    }
                    creditSetFields[`__push__${classIdsKey}`].push(nextClassId);

                    // Track for student's classes array
                    newClassIdsToAdd.push(nextClassId);
                }
            }
        }

        // ─── 4. Build final update operations ──────────────────────────────────

        // Separate out the __push__ keys from $set fields
        const pushToClassIds: Record<string, mongoose.Types.ObjectId[]> = {};
        const cleanSetFields: Record<string, any> = {};

        for (const [key, val] of Object.entries(creditSetFields)) {
            if (key.startsWith("__push__")) {
                pushToClassIds[key.replace("__push__", "")] = val;
            } else {
                cleanSetFields[key] = val;
            }
        }

        // Merge attendance $set fields
        const finalSetFields = { ...attendanceSetFields, ...cleanSetFields };

        // Build $push for classIds arrays
        // MongoDB doesn't support $push to multiple array paths in one op,
        // so we do one updateOne per unique classIds path (rare — only when no class found)
        const updateOps: Promise<any>[] = [];

        // Main update — attendance + credits
        const mainUpdate: any = {};
        if (Object.keys(finalSetFields).length > 0) mainUpdate.$set = finalSetFields;
        if (attendanceToPush.length > 0) {
            mainUpdate.$push = {
                attendance: { $each: attendanceToPush }
            };
        }
        if (newClassIdsToAdd.length > 0) {
            if (!mainUpdate.$addToSet) mainUpdate.$addToSet = {};
            mainUpdate.$addToSet.classes = { $each: newClassIdsToAdd };
        }

        if (Object.keys(mainUpdate).length > 0) {
            updateOps.push(
                (User as any).updateOne({ _id: studentId }, mainUpdate)
            );
        }

        // Push new classIds into package entries
        for (const [path, ids] of Object.entries(pushToClassIds)) {
            updateOps.push(
                (User as any).updateOne(
                    { _id: studentId },
                    { $addToSet: { [path]: { $each: ids } } }
                )
            );
        }

        // Run main update + any classIds pushes (these are separate paths, safe to parallel)
        await Promise.all(updateOps);

        return NextResponse.json({
            success: true,
            cancelledCount: classIds.length,
            attendanceStatus: newAttendanceStatus,
            message: `${classIds.length} classes cancelled. Attendance marked as "${newAttendanceStatus}".`
        });

    } catch (error: any) {
        console.error("Bulk cancel error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}