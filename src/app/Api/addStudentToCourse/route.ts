import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import courseName from "@/models/courseName";
import Class from "@/models/Class";


connect();

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const { courseId, studentId, tutorId, credits, message, startDate, classIds: selectedClassIds = [] ,classType} = requestData;
    console.log("requestData:", requestData);

    let instructorId;
    if (tutorId) {
      instructorId = tutorId;
    } else {
      const token = req.cookies.get("token")?.value;
      const decodedToken = token ? jwt.decode(token) : null;
      instructorId = decodedToken && typeof decodedToken === "object" && "id" in decodedToken ? decodedToken.id : null;
    }

    if (!studentId) return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    if (!courseId) return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    if (!instructorId) return NextResponse.json({ error: "Instructor ID could not be determined" }, { status: 400 });

    // Fetch all in parallel
    const [student, instructor, course] = await Promise.all([
      User.findById(studentId),
      User.findById(instructorId),
      courseName.findById(courseId),
    ]);

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    if (!instructor) return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const courseClassIds = course.class || [];

    const startTimeEntry = startDate
      ? { date: new Date(startDate), message: message || "" ,classIds : selectedClassIds}
      : null;

    const existingEntry = student.creditsPerCourse?.find(
      (e: any) => e.courseId?.toString() === courseId
    );

    // ✅ Check if a startTime entry with the same date already exists
    const existingStartTimeEntry = existingEntry?.startTime?.find(
      (s: any) => new Date(s.date).toDateString() === new Date(startDate).toDateString()
    );

    // ── Build a single clean student update ───────────────────────────────────
    let studentUpdate: any;

    console.log("studentId : ", student._id, 
      "studentName : ",student.username,
    )

    // ✅ Most recent PAST startTime entry 
function getNearestPastEntryIndex(creditsPerCourse: any[], courseId: string): number {
  const entry = creditsPerCourse?.find(
    (e: any) => e.courseId?.toString() === courseId
  );

  console.log("[classType flow] Entry : ",entry);
  if (!entry?.startTime?.length) return -1;

  const now = new Date();

const pastEntries = entry.startTime
  .map((s: any, idx: number) => ({ date: s.date, idx }))  // sirf date aur idx rakho
  .filter((s: any) => {
    const entryDate = new Date(s.date);
    console.log("[classType flow] checking date:", entryDate, "<=", now, "→", entryDate <= now);
    return entryDate <= now;
  });

      console.log("[classType flow] PAST Entry : ",pastEntries);


  if (pastEntries.length === 0) return -1;

  // Sabse recent past entry
  pastEntries.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return pastEntries[0].idx; // startTime array ka index
}

if (!startDate && selectedClassIds.length > 0 && courseId) {
  
  console.log("=== [classType flow] startDate nahi aaya, classType logic chalega ===");
  console.log("[classType flow] courseId:", courseId);
  console.log("[classType flow] selectedClassIds:", selectedClassIds);
  console.log("[classType flow] classType:", classType);
  console.log("[classType flow] student.creditsPerCourse:", JSON.stringify(student.creditsPerCourse, null, 2));

  const nearestIdx = getNearestPastEntryIndex(
    student.creditsPerCourse,
    courseId
  );

  console.log("[classType flow] nearestIdx (startTime array index):", nearestIdx);

  if (nearestIdx !== -1) {
    const courseEntryIdx = student.creditsPerCourse.findIndex(
      (e: any) => e.courseId?.toString() === courseId
    );

    console.log("[classType flow] courseEntryIdx:", courseEntryIdx);

    if (courseEntryIdx !== -1) {
      const targetEntry = student.creditsPerCourse[courseEntryIdx].startTime[nearestIdx];
      console.log("[classType flow] target startTime entry:", JSON.stringify(targetEntry, null, 2));

      const existingClassIds = targetEntry.classIds || [];
      console.log("[classType flow] existingClassIds in entry:", existingClassIds);

      const toAdd: string[] = [];
      selectedClassIds.forEach((id: string) => {
        if (!existingClassIds.map((c: any) => c.toString()).includes(id.toString())) {
          student.creditsPerCourse[courseEntryIdx].startTime[nearestIdx].classIds.push(id);
          toAdd.push(id);
        } else {
          console.log("[classType flow] classId already exists, skipping:", id);
        }
      });
      console.log("[classType flow] classIds added to entry:", toAdd);

      if (classType === 'makeup') {
        const before = student.creditsPerCourse[courseEntryIdx].credits;
        student.creditsPerCourse[courseEntryIdx].credits += toAdd.length;
        const after = student.creditsPerCourse[courseEntryIdx].credits;
        console.log(`[classType flow] makeup — credits: ${before} → ${after}`);
      } else {
        console.log("[classType flow] regularClass — credits unchanged");
      }

      selectedClassIds.forEach((id: string) => {
        if (!student.classes.map((c: any) => c.toString()).includes(id.toString())) {
          student.classes.push(id);
        }
      });

      await student.save();
      console.log("[classType flow] student.save() done ✅");

      if (classType === 'makeup' && toAdd.length > 0) {
  await Class.updateMany(
    { _id: { $in: toAdd } },
    { $set: { classType: 'makeup' } }
  );
  console.log(`[classType flow] ${toAdd.length} classes marked as makeup ✅`);
}

      return NextResponse.json({
        success: true,
        message: `Classes assigned as ${classType ?? 'regularClass'}`,
        classesAdded: toAdd.length,
        classType,
        creditsPerCourse: student.creditsPerCourse,
      });
    } else {
      console.log("[classType flow] ❌ courseEntryIdx not found — course entry missing in creditsPerCourse");
    }
  } else {
    console.log("[classType flow] ❌ nearestIdx = -1 — no past startTime entry found for this course");
  }
}


 if (existingEntry) {
  if (existingStartTimeEntry) {
    // ✅ Same date entry exists → add classes to it + replace message
    studentUpdate = {
      $inc: { "creditsPerCourse.$.credits": credits || 0 },
      $addToSet: {
        courses: courseId,
        instructors: instructorId,
        classes: { $each: selectedClassIds },
      },
      // ✅ Add classIds to existing startTime entry + update message
      $push: {
        "creditsPerCourse.$.startTime.$[entry].classIds": { $each: selectedClassIds },
      },
      ...(message && {
        $set: {
          "creditsPerCourse.$.startTime.$[entry].message": message,
        },
      }),
    };

    const [finalStudent, finalInstructor] = await Promise.all([
      User.findOneAndUpdate(
        { _id: studentId, "creditsPerCourse.courseId": courseId },
        studentUpdate,
        {
          new: true,
          arrayFilters: [
            // ✅ Match the startTime entry by date
            {
              "entry.date": {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(startDate).setHours(23, 59, 59, 999)),
              },
            },
          ],
        }
      ),
      User.findByIdAndUpdate(
        instructorId,
        { $addToSet: { courses: courseId, students: studentId, classes: { $each: courseClassIds } } },
        { new: true }
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: "Classes added to existing entry",
      student: { id: finalStudent._id, name: finalStudent.name, email: finalStudent.email, courses: finalStudent.courses, classCount: finalStudent.classes?.length || 0, creditsPerCourse: finalStudent.creditsPerCourse },
      instructor: { id: finalInstructor._id, name: finalInstructor.name, courses: finalInstructor.courses, classCount: finalInstructor.classes?.length || 0 },
      courseId,
      classesAdded: selectedClassIds.length,
    });

  } else {
    // existing course entry but different date → push new startTime entry
    studentUpdate = {
      $inc: { "creditsPerCourse.$.credits": credits || 0 },
      $addToSet: {
        courses: courseId,
        instructors: instructorId,
        classes: { $each: selectedClassIds },
      },
      ...(startTimeEntry && {
        $push: { "creditsPerCourse.$.startTime": startTimeEntry },
      }),
    };

    const [finalStudent, finalInstructor] = await Promise.all([
      User.findOneAndUpdate(
        { _id: studentId, "creditsPerCourse.courseId": courseId },
        studentUpdate,
        { new: true }
      ),
      User.findByIdAndUpdate(
        instructorId,
        { $addToSet: { courses: courseId, students: studentId, classes: { $each: courseClassIds } } },
        { new: true }
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: "Course added successfully",
      student: { id: finalStudent._id, name: finalStudent.name, email: finalStudent.email, courses: finalStudent.courses, classCount: finalStudent.classes?.length || 0, creditsPerCourse: finalStudent.creditsPerCourse },
      instructor: { id: finalInstructor._id, name: finalInstructor.name, courses: finalInstructor.courses, classCount: finalInstructor.classes?.length || 0 },
      courseId,
      classesAdded: selectedClassIds.length,
    });
  }

} else {
      // No entry → $push new creditsPerCourse entry, $addToSet everything else
      studentUpdate = {
        $addToSet: {
          courses: courseId,
          instructors: instructorId,
          classes: { $each: selectedClassIds },
        },
        $push: {
          creditsPerCourse: {
            courseId,
            credits: credits || 0,
            startTime: startTimeEntry ? [startTimeEntry] : [],
          },
        },
      };

      const [finalStudent, finalInstructor] = await Promise.all([
        User.findByIdAndUpdate(studentId, studentUpdate, { new: true }),
        User.findByIdAndUpdate(
          instructorId,
          { $addToSet: { courses: courseId, students: studentId, classes: { $each: courseClassIds } } },
          { new: true }
        ),
      ]);

      return NextResponse.json({
        success: true,
        message: "Course added successfully",
        student: { id: finalStudent._id, name: finalStudent.name, email: finalStudent.email, courses: finalStudent.courses, classCount: finalStudent.classes?.length || 0, creditsPerCourse: finalStudent.creditsPerCourse },
        instructor: { id: finalInstructor._id, name: finalInstructor.name, courses: finalInstructor.courses, classCount: finalInstructor.classes?.length || 0 },
        courseId,
        classesAdded: selectedClassIds.length,
      });
    }

  } catch (error: any) {
    console.error("Error adding course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}