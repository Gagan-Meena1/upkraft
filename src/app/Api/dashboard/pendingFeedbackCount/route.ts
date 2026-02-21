// // src>app>api>dashboard>pendingFeedbackCount>route.ts

// import { NextResponse } from "next/server";
// import { connect } from "@/dbConnection/dbConfic";
// import User from "@/models/userModel";
// import Class from "@/models/Class";
// import courseName from "@/models/courseName";
// import feedback from "@/models/feedback";
// import feedbackDance from "@/models/feedbackDance";
// import feedbackDrawing from "@/models/feedbackDrawing";
// import feedbackDrums from "@/models/feedbackDrums";
// import feedbackVocal from "@/models/feedbackVocal";
// import feedbackViolin from "@/models/feedbackViolin";
// import jwt from "jsonwebtoken";

// export async function GET(request) {
//   try {
//     await connect();

//     const { searchParams } = new URL(request.url);
//     let tutorId = searchParams.get("tutorId");

//     if (!tutorId) {
//       const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
//       if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

//       const decodedToken = jwt.decode(token);
//       if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
//         return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//       }
//       tutorId = decodedToken.id;
//     }

//     // Step 1: Get tutor courses
//     const tutor = await User.findById(tutorId).select("courses").lean();

//     if (!tutor || !tutor.courses || tutor.courses.length === 0) {
//       return NextResponse.json({ success: true, count: 0 });
//     }

//     const tutorCourseIds = tutor.courses.map(c => c.toString());

//     // Step 2: Get all students with common courses in ONE query
//     const students = await User.find({
//       instructorId: tutorId,
//       category: "Student",
//       courses: { $in: tutorCourseIds }
//     }).select("_id courses attendance").lean();

//     if (!students.length) {
//       return NextResponse.json({ success: true, count: 0 });
//     }

//     const studentIds = students.map(s => s._id);

//     // Step 3: Fetch ALL courses the tutor teaches
//     const commonCourses = await courseName.find({
//       _id: { $in: tutorCourseIds }
//     }).select("_id class category students").lean();

//     if (!commonCourses.length) {
//       return NextResponse.json({ success: true, count: 0 });
//     }

//     // Build maps: classId -> category and classId -> courseId
//     const classCategoryMap = new Map();
//     const classToCourseMap = new Map();
//     const allClassIds = [];

//     commonCourses.forEach(course => {
//       const courseIdStr = course._id.toString();
//       course.class.forEach(classId => {
//         const classIdStr = classId.toString();
//         classCategoryMap.set(classIdStr, course.category);
//         classToCourseMap.set(classIdStr, courseIdStr);
//         allClassIds.push(classId);
//       });
//     });

//     if (!allClassIds.length) {
//       return NextResponse.json({ success: true, count: 0 });
//     }

//     // Step 4: Fetch ALL past classes in ONE query
//     const pastClasses = await Class.find({
//       _id: { $in: allClassIds },
//       endTime: { $lt: new Date() },
//       status: { $ne: 'canceled' }
//     }).select("_id").lean();

//     if (!pastClasses.length) {
//       return NextResponse.json({ success: true, count: 0 });
//     }

//     const pastClassIds = pastClasses.map(c => c._id);

//     // Categorize classes by type
//     const categorizedClasses = {
//       Music: [],
//       Dance: [],
//       Drawing: [],
//       Drums: [],
//       Vocal: [],
//       Violin: []
//     };

//     pastClassIds.forEach(classId => {
//       const category = classCategoryMap.get(classId.toString());
//       if (categorizedClasses[category]) {
//         categorizedClasses[category].push(classId);
//       }
//     });

//     // Step 5: Fetch ALL feedbacks for ALL students in PARALLEL
//     const feedbackPromises = [];

//     if (categorizedClasses.Music.length > 0) {
//       feedbackPromises.push(
//         feedback.find({
//           userId: { $in: studentIds },
//           classId: { $in: categorizedClasses.Music }
//         }).select("userId classId").lean()
//       );
//     } else {
//       feedbackPromises.push(Promise.resolve([]));
//     }

//     if (categorizedClasses.Dance.length > 0) {
//       feedbackPromises.push(
//         feedbackDance.find({
//           userId: { $in: studentIds },
//           classId: { $in: categorizedClasses.Dance }
//         }).select("userId classId").lean()
//       );
//     } else {
//       feedbackPromises.push(Promise.resolve([]));
//     }

//     if (categorizedClasses.Drawing.length > 0) {
//       feedbackPromises.push(
//         feedbackDrawing.find({
//           userId: { $in: studentIds },
//           classId: { $in: categorizedClasses.Drawing }
//         }).select("userId classId").lean()
//       );
//     } else {
//       feedbackPromises.push(Promise.resolve([]));
//     }

//     if (categorizedClasses.Drums.length > 0) {
//       feedbackPromises.push(
//         feedbackDrums.find({
//           userId: { $in: studentIds },
//           classId: { $in: categorizedClasses.Drums }
//         }).select("userId classId").lean()
//       );
//     } else {
//       feedbackPromises.push(Promise.resolve([]));
//     }

//     if (categorizedClasses.Vocal.length > 0) {
//       feedbackPromises.push(
//         feedbackVocal.find({
//           userId: { $in: studentIds },
//           classId: { $in: categorizedClasses.Vocal }
//         }).select("userId classId").lean()
//       );
//     } else {
//       feedbackPromises.push(Promise.resolve([]));
//     }

//     if (categorizedClasses.Violin.length > 0) {
//       feedbackPromises.push(
//         feedbackViolin.find({
//           userId: { $in: studentIds },
//           classId: { $in: categorizedClasses.Violin }
//         }).select("userId classId").lean()
//       );
//     } else {
//       feedbackPromises.push(Promise.resolve([]));
//     }

//     const [
//       musicFeedbacks,
//       danceFeedbacks,
//       drawingFeedbacks,
//       drumsFeedbacks,
//       vocalFeedbacks,
//       violinFeedbacks
//     ] = await Promise.all(feedbackPromises);

//     // Step 6: Build feedback lookup maps (userId+classId -> exists)
//     const feedbackMaps = {
//       Music: new Set(),
//       Dance: new Set(),
//       Drawing: new Set(),
//       Drums: new Set(),
//       Vocal: new Set(),
//       Violin: new Set()
//     };

//     musicFeedbacks.forEach(f =>
//       feedbackMaps.Music.add(`${f.userId}_${f.classId}`)
//     );
//     danceFeedbacks.forEach(f =>
//       feedbackMaps.Dance.add(`${f.userId}_${f.classId}`)
//     );
//     drawingFeedbacks.forEach(f =>
//       feedbackMaps.Drawing.add(`${f.userId}_${f.classId}`)
//     );
//     drumsFeedbacks.forEach(f =>
//       feedbackMaps.Drums.add(`${f.userId}_${f.classId}`)
//     );
//     vocalFeedbacks.forEach(f =>
//       feedbackMaps.Vocal.add(`${f.userId}_${f.classId}`)
//     );
//     violinFeedbacks.forEach(f =>
//       feedbackMaps.Violin.add(`${f.userId}_${f.classId}`)
//     );

//     // Step 7: Count pending feedbacks
//     let totalPendingCount = 0;

//     students.forEach(student => {
//       const studentId = student._id.toString();

//       // Build attendance map
//       const attendanceMap = new Map();
//       if (student.attendance && Array.isArray(student.attendance)) {
//         student.attendance.forEach(att => {
//           if (att.classId) {
//             attendanceMap.set(att.classId.toString(), att.status);
//           }
//         });
//       }

//       // Get student's course IDs as Set for O(1) lookup
//       const studentCourseSet = new Set(student.courses.map(c => c.toString()));

//       // Check each category
//       Object.entries(categorizedClasses).forEach(([category, classIds]) => {
//         classIds.forEach(classId => {
//           const classIdStr = classId.toString();

//           // Skip if student was absent
//           if (attendanceMap.get(classIdStr) === "absent") {
//             return;
//           }

//           // Check if this class belongs to a course the student is enrolled in
//           const courseIdForClass = classToCourseMap.get(classIdStr);
//           if (!courseIdForClass || !studentCourseSet.has(courseIdForClass)) {
//             return;
//           }

//           // Check if feedback exists
//           const feedbackKey = `${studentId}_${classIdStr}`;
//           if (!feedbackMaps[category].has(feedbackKey)) {
//             totalPendingCount++;
//           }
//         });
//       });
//     });

//     return NextResponse.json({
//       success: true,
//       count: totalPendingCount
//     });

//   } catch (err) {
//     console.error("Error in pendingFeedbackCount:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// src>app>api>dashboard>pendingFeedbackCount>route.ts

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
      const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
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
        switch(category) {
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