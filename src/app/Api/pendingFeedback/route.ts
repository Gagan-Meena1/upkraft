import { NextResponse } from "next/server";
import User from "@/models/userModel";
import Class from "@/models/Class";
import courseName from "@/models/courseName";
import feedback from "@/models/feedback";
import feedbackDance from "@/models/feedbackDance";
import feedbackDrawing from "@/models/feedbackDrawing";
import feedbackVocal from "@/models/feedbackVocal";
import feedbackDrums from "@/models/feedbackDrums";
import feedbackViolin from "@/models/feedbackViolin";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    await connect();
    console.log("Fetching missing feedback...");

    // Get tutorId from query param or token
    const { searchParams } = new URL(request.url);
    let tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      const token = request.cookies.get("token")?.value;
      if (!token) {
        return NextResponse.json({ error: "No token or tutorId found" }, { status: 401 });
      }

      const decodedToken = jwt.decode(token);
      if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      tutorId = decodedToken.id;
    }

    // Fetch tutor and students in parallel
    // ✅ CHANGE: Now also fetch attendance field from students
    const [tutor, students] = await Promise.all([
      User.findById(tutorId).select("courses").lean(),
      User.find({
        instructorId: tutorId,
        category: "Student"
      }).select("_id username profileImage courses attendance classes").lean() // ✅ Added attendance
    ]);

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No students found for this tutor",
        missingFeedbackClasses: [],
        count: 0
      });
    }

    const tutorCourseIds = tutor.courses.map(id => id.toString());
    
    if (tutorCourseIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tutor has no courses assigned",
        tutorId,
        totalStudents: students.length,
        missingFeedbackClasses: [],
        count: 0
      });
    }

    // Collect all student IDs and course IDs for bulk queries
    const studentIds = students.map(s => s._id);
    const allStudentCourseIds = new Set();
    
    students.forEach(student => {
      student.courses.forEach(courseId => {
        const courseIdStr = courseId.toString();
        if (tutorCourseIds.includes(courseIdStr)) {
          allStudentCourseIds.add(courseIdStr);
        }
      });
    });

    if (allStudentCourseIds.size === 0) {
      return NextResponse.json({
        success: true,
        message: "No common courses found between tutor and students",
        tutorId,
        totalStudents: students.length,
        missingFeedbackClasses: [],
        count: 0
      });
    }

    // Fetch all relevant courses with their classes in one query
    const courses = await courseName.find({
      _id: { $in: Array.from(allStudentCourseIds) }
    }).select("_id title category class").lean();

    // Collect all class IDs
    const allClassIds = new Set();
    courses.forEach(course => {
      if (course.class && course.class.length > 0) {
        course.class.forEach(classId => allClassIds.add(classId.toString()));
      }
    });

    if (allClassIds.size === 0) {
      return NextResponse.json({
        success: true,
        message: "No classes found for common courses",
        tutorId,
        totalStudents: students.length,
        missingFeedbackClasses: [],
        count: 0
      });
    }

    // Fetch all classes in one query
    const classes = await Class.find({
      _id: { $in: Array.from(allClassIds) },
      endTime: { $lt: new Date() },
      status:{ $ne: 'canceled'}
    }).select("_id title description startTime endTime").lean();

    // Create a map for quick class lookup
    const classMap = new Map(classes.map(c => [c._id.toString(), c]));

    // Fetch all existing feedback records in parallel for all six models
    const [
      musicFeedbacks,
      danceFeedbacks,
      drawingFeedbacks,
      vocalFeedbacks,
      drumsFeedbacks,
      violinFeedbacks
    ] = await Promise.all([
      feedback.find({
        userId: { $in: studentIds },
        classId: { $in: Array.from(allClassIds) }
      }).select("userId classId").lean(),
      feedbackDance.find({
        userId: { $in: studentIds },
        classId: { $in: Array.from(allClassIds) }
      }).select("userId classId").lean(),
      feedbackDrawing.find({
        userId: { $in: studentIds },
        classId: { $in: Array.from(allClassIds) }
      }).select("userId classId").lean(),
      feedbackVocal.find({
        userId: { $in: studentIds },
        classId: { $in: Array.from(allClassIds) }
      }).select("userId classId").lean(),
      feedbackDrums.find({
        userId: { $in: studentIds },
        classId: { $in: Array.from(allClassIds) }
      }).select("userId classId").lean(),
      feedbackViolin.find({
        userId: { $in: studentIds },
        classId: { $in: Array.from(allClassIds) }
      }).select("userId classId").lean(),
    ]);

    // Create feedback lookup sets for O(1) lookup (include all categories)
    const feedbackSets: Record<string, Set<string>> = {
      Music: new Set(musicFeedbacks.map(f => `${f.userId}_${f.classId}`)),
      Dance: new Set(danceFeedbacks.map(f => `${f.userId}_${f.classId}`)),
      Drawing: new Set(drawingFeedbacks.map(f => `${f.userId}_${f.classId}`)),
      Vocal: new Set(vocalFeedbacks.map(f => `${f.userId}_${f.classId}`)),
      Drums: new Set(drumsFeedbacks.map(f => `${f.userId}_${f.classId}`)),
      Violin: new Set(violinFeedbacks.map(f => `${f.userId}_${f.classId}`)),
    };

    // ✅ NEW: Helper function to check attendance status
    const getAttendanceStatus = (student, classId) => {
      if (!student.attendance || student.attendance.length === 0) {
        return "not_marked"; // Default if no attendance records exist
      }
      
      const attendanceRecord = student.attendance.find(
        att => att.classId.toString() === classId
      );
      
      return attendanceRecord ? attendanceRecord.status : "not_marked";
    };

    // Build missing feedback list
    const missingFeedbackClasses = [];

    for (const student of students) {
      const studentCourseIds = student.courses.map(id => id.toString());
      const commonCourseIds = tutorCourseIds.filter(courseId => 
        studentCourseIds.includes(courseId)
      );

      for (const courseId of commonCourseIds) {
        const course = courses.find(c => c._id.toString() === courseId);
        if (!course || !course.class || course.class.length === 0) continue;

        const category = course.category;
        if (!category) continue;

        // Build a Set of this student's class IDs for O(1) lookup
const studentClassIdSet = new Set((student.classes || []).map(id => id.toString()));

for (const classId of course.class) {
  const classIdStr = classId.toString();

  // Only process classes that are also assigned to this student
  if (!studentClassIdSet.has(classIdStr)) continue;

  const classItem = classMap.get(classIdStr);
  if (!classItem) continue;

          const attendanceStatus = getAttendanceStatus(student, classIdStr);
          if (attendanceStatus !== "not_marked") continue;

          // Safe lookup: use empty Set if category not present
          const feedbackKey = `${student._id}_${classIdStr}`;
          const setForCategory = feedbackSets[category] || new Set<string>();
          if (!setForCategory.has(feedbackKey)) {
            missingFeedbackClasses.push({
              studentId: student._id,
              studentName: student.username,
              profileImage: student.profileImage || null,
              classId: classItem._id,
              className: classItem.title || (classItem as any).name,
              courseId: course._id,
              courseName: course.title,
              courseCategory: category,
              classDate: classItem.startTime,
              attendanceStatus,
              feedbackModelRequired:
                category === "Music" ? "feedback" :
                category === "Dance" ? "feedbackDance" :
                category === "Drawing" ? "feedbackDrawing" :
                category === "Vocal" ? "feedbackVocal" :
                category === "Drums" ? "feedbackDrums" :
                category === "Violin" ? "feedbackViolin" :
                "feedback"
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Missing feedback classes retrieved successfully",
      tutorId,
      totalStudents: students.length,
      missingFeedbackClasses,
      count: missingFeedbackClasses.length
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}