
import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import courseName from "@/models/courseName";
import feedback from "@/models/feedback";
import feedbackDance from "@/models/feedbackDance";
import feedbackDrawing from "@/models/feedbackDrawing";
import feedbackDrums from "@/models/feedbackDrums";
import feedbackVocal from "@/models/feedbackVocal";
import feedbackViolin from "@/models/feedbackViolin";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    let tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      const token = (() => {
        const referer = request.headers.get("referer") || "";
        let refererPath = "";
        try { if (referer) refererPath = new URL(referer).pathname; } catch (e) { }
        const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
        return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
      })();
      if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

      const decodedToken = jwt.decode(token);
      if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      tutorId = decodedToken.id;
    }

    // Fetch tutor, students, and courses in parallel
    const [tutor, students] = await Promise.all([
      User.findById(tutorId).select("courses").lean(),
      User.find({
        instructorId: tutorId,
        category: "Student"
      }).select("_id courses attendance").lean()
    ]);

    if (!tutor || !tutor.courses || tutor.courses.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    if (!students.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const tutorCourseIds = tutor.courses.map(c => c.toString());

    // Fetch all courses the tutor teaches
    const courses = await courseName.find({
      _id: { $in: tutorCourseIds }
    }).select("_id class category").lean();

    if (!courses.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Build maps for O(1) lookups
    const classToCategoryMap = new Map();
    const classToCourseMap = new Map();
    const allClassIds = [];

    courses.forEach(course => {
      const courseIdStr = course._id.toString();
      course.class.forEach(classId => {
        const classIdStr = classId.toString();
        classToCategoryMap.set(classIdStr, course.category);
        classToCourseMap.set(classIdStr, courseIdStr);
        allClassIds.push(classId);
      });
    });

    if (!allClassIds.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Fetch all past classes
    const pastClasses = await Class.find({
      _id: { $in: allClassIds },
      endTime: { $lt: new Date() },
      status: { $ne: 'canceled' }
    }).select("_id").lean();

    if (!pastClasses.length) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const pastClassIds = pastClasses.map(c => c._id);

    // Categorize classes by type
    const categorizedClasses = {
      Music: [],
      Dance: [],
      Drawing: [],
      Drums: [],
      Vocal: [],
      Violin: []
    };

    pastClassIds.forEach(classId => {
      const category = classToCategoryMap.get(classId.toString());
      if (categorizedClasses[category]) {
        categorizedClasses[category].push(classId);
      }
    });

    // Get all student IDs
    const studentIds = students.map(s => s._id);

    // Fetch ALL feedbacks in parallel (only for categories with classes)
    const feedbackPromises = [];
    const feedbackCategories = [];

    Object.entries(categorizedClasses).forEach(([category, classIds]) => {
      if (classIds.length > 0) {
        feedbackCategories.push(category);

        let feedbackModel;
        switch (category) {
          case 'Music': feedbackModel = feedback; break;
          case 'Dance': feedbackModel = feedbackDance; break;
          case 'Drawing': feedbackModel = feedbackDrawing; break;
          case 'Drums': feedbackModel = feedbackDrums; break;
          case 'Vocal': feedbackModel = feedbackVocal; break;
          case 'Violin': feedbackModel = feedbackViolin; break;
          default: return;
        }

        feedbackPromises.push(
          feedbackModel.find({
            userId: { $in: studentIds },
            classId: { $in: classIds }
          }).select("userId classId").lean()
        );
      }
    });

    const feedbackResults = await Promise.all(feedbackPromises);

    // Build feedback lookup set (userId+classId -> exists)
    const feedbackSet = new Set();
    feedbackResults.forEach(feedbacks => {
      feedbacks.forEach(f => {
        feedbackSet.add(`${f.userId}_${f.classId}`);
      });
    });

    // Pre-build student data structures
    const studentDataMap = new Map();
    students.forEach(student => {
      const studentId = student._id.toString();

      // Build attendance map
      const attendanceMap = new Map();
      if (student.attendance && Array.isArray(student.attendance)) {
        student.attendance.forEach(att => {
          if (att.classId) {
            attendanceMap.set(att.classId.toString(), att.status);
          }
        });
      }

      // Build student course set
      const studentCourseSet = new Set(student.courses.map(c => c.toString()));

      studentDataMap.set(studentId, {
        attendanceMap,
        studentCourseSet
      });
    });

    // Count pending feedbacks
    let totalPendingCount = 0;

    pastClassIds.forEach(classId => {
      const classIdStr = classId.toString();
      const courseId = classToCourseMap.get(classIdStr);

      if (!courseId) return;

      students.forEach(student => {
        const studentId = student._id.toString();
        const studentData = studentDataMap.get(studentId);

        // Skip if student not enrolled in this course
        if (!studentData.studentCourseSet.has(courseId)) {
          return;
        }

        // Skip if attendance has been marked (any status)
        const attendanceStatus = studentData.attendanceMap.get(classIdStr);
        if (attendanceStatus && attendanceStatus !== "not_marked") {
          return;
        }

        // Check if feedback exists
        const feedbackKey = `${studentId}_${classIdStr}`;
        if (!feedbackSet.has(feedbackKey)) {
          totalPendingCount++;
        }
      });
    });

    return NextResponse.json({
      success: true,
      count: totalPendingCount
    });

  } catch (err) {
    console.error("Error in pendingFeedbackCount:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}