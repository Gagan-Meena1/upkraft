import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";
import ReassignRequest from "@/models/ReassignRequest";
import AttendanceResetRequest from "@/models/AttendanceResetRequest";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.decode(token);
    const userId = decoded && typeof decoded === "object" && "id" in decoded ? (decoded as { id: string }).id : null;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const user = await (User as any).findById(userId).select("category");
    if (!user || !["teamlead", "team lead", "TeamLead"].includes(String(user.category).toLowerCase().replace(/\s/g, ""))) {
      // Depending on how Team Lead is stored, might need to adjust this check. Assuming 'teamlead', 'TeamLead'
      return NextResponse.json(
        { success: false, error: "Only team leads can access this endpoint" },
        { status: 403 }
      );
    }

    const pendingClasses = await (Class as any).find({ deleteRequestStatus: "pending" })
      .populate("instructor", "username email")
      .populate("course", "courseName title name")
      .populate({ path: "deleteRequestStudents", select: "username email", strictPopulate: false })
      .sort({ createdAt: -1 })
      .lean();

    const classIds = pendingClasses.map(c => c._id);
    const allStudentsInClasses = await (User as any).find({
      category: { $in: ["Student", "student", "STUDENT"] },
      classes: { $in: classIds }
    }).select("_id username email classes");

    const studentsByClassId = new Map();
    allStudentsInClasses.forEach((student: any) => {
      if (Array.isArray(student.classes)) {
        student.classes.forEach((classId: any) => {
          const classIdStr = classId.toString();
          if (!studentsByClassId.has(classIdStr)) {
            studentsByClassId.set(classIdStr, []);
          }
          studentsByClassId.get(classIdStr).push({
            _id: student._id,
            username: student.username,
            email: student.email
          });
        });
      }
    });

    const mappedClasses = pendingClasses.map((cls: any) => ({
      _id: cls._id,
      title: cls.title,
      description: cls.description,
      startTime: cls.startTime,
      endTime: cls.endTime,
      deleteRequestStatus: cls.deleteRequestStatus,
      deleteRequestType: cls.deleteRequestType,
      deleteRequestStudents: cls.deleteRequestStudents,
      tutor: cls.instructor ? { _id: cls.instructor._id, username: cls.instructor.username, email: cls.instructor.email } : undefined,
      course: cls.course,
      students: studentsByClassId.get(cls._id.toString()) || [],
    }));

    // Fetch pending reassignment requests
    const reassignRequests = await (ReassignRequest as any).find({ status: "pending" })
      .populate("student", "username email")
      .populate("oldTutor", "username email")
      .populate("newTutor", "username email")
      .populate("relationshipManager", "username email")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch pending attendance reset requests
    const attendanceResetRequests = await (AttendanceResetRequest as any).find({ status: "pending" })
      .populate("student", "username email")
      .populate({
         path: "classItem",
         select: "title startTime endTime course instructor",
         populate: [
            { path: "course", select: "courseName title name" },
            { path: "instructor", select: "username email" }
         ]
      })
      .populate("relationshipManager", "username email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ 
      success: true, 
      classes: mappedClasses,
      reassignRequests: reassignRequests,
      attendanceResetRequests: attendanceResetRequests
    });

  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
