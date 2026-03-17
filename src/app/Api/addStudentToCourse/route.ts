import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import courseName from "@/models/courseName";

connect();

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const { courseId, studentId, tutorId, credits, message, startDate, classIds: selectedClassIds = [] } = requestData;
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