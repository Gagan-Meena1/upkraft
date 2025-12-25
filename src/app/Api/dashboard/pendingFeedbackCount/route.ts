// src>app>api>dashboard>pendingFeedbackCount>route.ts

import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import courseName from "@/models/courseName";
import feedback from "@/models/feedback";
import feedbackDance from "@/models/feedbackDance";
import feedbackDrawing from "@/models/feedbackDrawing";
// import feedbackDrums from "@/models/feedbackDrums";
// import feedbackVocal from "@/models/feedbackVocal";
// import feedbackViolin from "@/models/feedbackViolin";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    let tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      const token = request.cookies.get("token")?.value;
      if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

      const decodedToken = jwt.decode(token);
      if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      tutorId = decodedToken.id;
    }

    // Step 1: Get the tutor and their courses
    const tutor = await User.findById(tutorId).select("courses").lean();
    
    if (!tutor || !tutor.courses || tutor.courses.length === 0) {
      return NextResponse.json({ success: true, count: 0, details: [] });
    }

    const tutorCourseIds = tutor.courses.map(c => c.toString());

    // Step 2: Find all students who have this tutor in their instructorId array
    const students = await User.find({
      instructorId: tutorId,
      category: "Student"
    }).select("_id username courses attendance").lean();

    if (!students.length) {
      return NextResponse.json({ success: true, count: 0, details: [] });
    }

    let totalPendingCount = 0;
    const pendingFeedbackDetails = [];

    // Process each student individually
    for (const student of students) {
      const studentId = student._id.toString();
      const studentCourseIds = student.courses.map(c => c.toString());
      
      // Create attendance map for quick lookup (classId -> status)
      const attendanceMap = new Map();
      if (student.attendance && Array.isArray(student.attendance)) {
        student.attendance.forEach(att => {
          if (att.classId) {
            attendanceMap.set(att.classId.toString(), att.status);
          }
        });
      }
      
      // Step 3: Find common courses between tutor and this student
      const commonCourseIds = studentCourseIds.filter(courseId => 
        tutorCourseIds.includes(courseId)
      );
      
      if (commonCourseIds.length === 0) {
        continue; // Skip this student if no common courses
      }

      // Step 4: Fetch course details for common courses only
      const commonCourses = await courseName.find({
        _id: { $in: commonCourseIds }
      }).select("_id class category").lean();

      if (!commonCourses.length) {
        continue;
      }

      // Build class-to-category map and collect all class IDs for this student
      const classCategoryMap = new Map();
      const allClassIds = [];
      
      commonCourses.forEach(course => {
        course.class.forEach(classId => {
          const classIdStr = classId.toString();
          classCategoryMap.set(classIdStr, course.category);
          allClassIds.push(classId);
        });
      });

      if (!allClassIds.length) {
        continue;
      }

      // Step 5: Fetch only past classes for this student's common courses
      const pastClasses = await Class.find({
        _id: { $in: allClassIds },
        endTime: { $lt: new Date() },
        status: { $ne: 'canceled' }
      }).select("_id className").lean();

      if (!pastClasses.length) {
        continue;
      }

      // Create a map for quick class name lookup
      const classNameMap = new Map();
      pastClasses.forEach(cls => {
        classNameMap.set(cls._id.toString(), cls.className);
      });

      // Categorize past classes by Music/Dance/Drawing
      const categorizedClasses = {
        Music: [],
        Dance: [],
        Drawing: []
        // Drums: [],
        // Vocal: [],
        // Violin: []
      };

      pastClasses.forEach(cls => {
        const category = classCategoryMap.get(cls._id.toString());
        if (categorizedClasses[category]) {
          categorizedClasses[category].push(cls._id);
        }
      });

      const studentPendingClasses = [];

      // Step 6: Check feedbacks in respective schemas for this student
      // Music feedback
      if (categorizedClasses.Music.length > 0) {
        const musicFeedbacks = await feedback.find({
          userId: studentId,
          classId: { $in: categorizedClasses.Music }
        }).select("classId").lean();

        const feedbackClassIds = new Set(musicFeedbacks.map(f => f.classId.toString()));
        
        categorizedClasses.Music.forEach(classId => {
          const classIdStr = classId.toString();
          
          // Check if student was absent in this class
          const attendanceStatus = attendanceMap.get(classIdStr);
          if (attendanceStatus === "absent") {
            return; // Skip this class - student was absent
          }
          
          if (!feedbackClassIds.has(classIdStr)) {
            studentPendingClasses.push({
              classId: classIdStr,
              className: classNameMap.get(classIdStr),
              category: "Music"
            });
            totalPendingCount++;
          }
        });
      }

      // Dance feedback
      if (categorizedClasses.Dance.length > 0) {
        const danceFeedbacks = await feedbackDance.find({
          userId: studentId,
          classId: { $in: categorizedClasses.Dance }
        }).select("classId").lean();

        const feedbackClassIds = new Set(danceFeedbacks.map(f => f.classId.toString()));
        
        categorizedClasses.Dance.forEach(classId => {
          const classIdStr = classId.toString();
          
          // Check if student was absent in this class
          const attendanceStatus = attendanceMap.get(classIdStr);
          if (attendanceStatus === "absent") {
            return; // Skip this class - student was absent
          }
          
          if (!feedbackClassIds.has(classIdStr)) {
            studentPendingClasses.push({
              classId: classIdStr,
              className: classNameMap.get(classIdStr),
              category: "Dance"
            });
            totalPendingCount++;
          }
        });
      }

      // Drawing feedback
      if (categorizedClasses.Drawing.length > 0) {
        const drawingFeedbacks = await feedbackDrawing.find({
          userId: studentId,
          classId: { $in: categorizedClasses.Drawing }
        }).select("classId").lean();

        const feedbackClassIds = new Set(drawingFeedbacks.map(f => f.classId.toString()));
        
        categorizedClasses.Drawing.forEach(classId => {
          const classIdStr = classId.toString();
          
          // Check if student was absent in this class
          const attendanceStatus = attendanceMap.get(classIdStr);
          if (attendanceStatus === "absent") {
            return; // Skip this class - student was absent
          }
          
          if (!feedbackClassIds.has(classIdStr)) {
            studentPendingClasses.push({
              classId: classIdStr,
              className: classNameMap.get(classIdStr),
              category: "Drawing"
            });
            totalPendingCount++;
          }
        });
      }

      // // Drums feedback
      // if (categorizedClasses.Drums.length > 0) {
      //   const drumsFeedbacks = await feedbackDrums.find({
      //     userId: studentId,
      //     classId: { $in: categorizedClasses.Drums }
      //   }).select("classId").lean();

      //   const feedbackClassIds = new Set(drumsFeedbacks.map(f => f.classId.toString()));
        
      //   categorizedClasses.Drums.forEach(classId => {
      //     const classIdStr = classId.toString();
          
      //     // Check if student was absent in this class
      //     const attendanceStatus = attendanceMap.get(classIdStr);
      //     if (attendanceStatus === "absent") {
      //       return; // Skip this class - student was absent
      //     }
          
      //     if (!feedbackClassIds.has(classIdStr)) {
      //       studentPendingClasses.push({
      //         classId: classIdStr,
      //         className: classNameMap.get(classIdStr),
      //         category: "Drums"
      //       });
      //       totalPendingCount++;
      //     }
      //   });
      // }

      // // Vocal feedback
      // if (categorizedClasses.Vocal.length > 0) {
      //   const vocalFeedback = await feedbackVocal.find({
      //     userId: studentId,
      //     classId: { $in: categorizedClasses.Vocal }
      //   }).select("classId").lean();

      //   const feedbackClassIds = new Set(vocalFeedback.map(f => f.classId.toString()));
        
      //   categorizedClasses.Vocal.forEach(classId => {
      //     const classIdStr = classId.toString();
          
      //     // Check if student was absent in this class
      //     const attendanceStatus = attendanceMap.get(classIdStr);
      //     if (attendanceStatus === "absent") {
      //       return; // Skip this class - student was absent
      //     }
          
      //     if (!feedbackClassIds.has(classIdStr)) {
      //       studentPendingClasses.push({
      //         classId: classIdStr,
      //         className: classNameMap.get(classIdStr),
      //         category: "Vocal"
      //       });
      //       totalPendingCount++;
      //     }
      //   });
      // }

      // // Violin feedback
      // if (categorizedClasses.Violin.length > 0) {
      //   const violinFeedback = await feedbackViolin.find({
      //     userId: studentId,
      //     classId: { $in: categorizedClasses.Violin }
      //   }).select("classId").lean();

      //   const feedbackClassIds = new Set(violinFeedback.map(f => f.classId.toString()));
        
      //   categorizedClasses.Violin.forEach(classId => {
      //     const classIdStr = classId.toString();
          
      //     // Check if student was absent in this class
      //     const attendanceStatus = attendanceMap.get(classIdStr);
      //     if (attendanceStatus === "absent") {
      //       return; // Skip this class - student was absent
      //     }
          
      //     if (!feedbackClassIds.has(classIdStr)) {
      //       studentPendingClasses.push({
      //         classId: classIdStr,
      //         className: classNameMap.get(classIdStr),
      //         category: "Violin"
      //       });
      //       totalPendingCount++;
      //     }
      //   });
      // }

      // Add student details only if they have pending feedbacks
      if (studentPendingClasses.length > 0) {
        pendingFeedbackDetails.push({
          studentId: studentId,
          studentName: student.username,
          pendingCount: studentPendingClasses.length,
          pendingClasses: studentPendingClasses
        });
      }
    }

    // Console log the details
    // console.log("=== Pending Feedback Details ===");
    // console.log(`Total Pending Count: ${totalPendingCount}`);
    // pendingFeedbackDetails.forEach((detail, index) => {
    //   console.log(`\n--- Student ${index + 1} ---`);
    //   console.log(`Student Name: ${detail.studentName}`);
    //   console.log(`Student ID: ${detail.studentId}`);
    //   console.log(`Pending Feedback Count: ${detail.pendingCount}`);
    //   console.log(`Classes:`);
    //   detail.pendingClasses.forEach((cls, idx) => {
    //     console.log(`  ${idx + 1}. ${cls.className} (${cls.category}) - Class ID: ${cls.classId}`);
    //   });
    // });
    // console.log("\n================================");

    return NextResponse.json({ 
      success: true, 
      count: totalPendingCount,
      details: pendingFeedbackDetails
    });

  } catch (err: any) {
    console.error("Error in pendingFeedbackCount:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}