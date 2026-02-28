import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import courseName from "@/models/courseName";
import Class from "@/models/Class";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tutorId: string }> }
) {
  try {
    await connect();

    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.decode(token);
    const rmId =
      decoded && typeof decoded === "object" && "id" in decoded
        ? (decoded as { id: string }).id
        : null;

    if (!rmId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const rmUser = await User.findById(rmId).select("category");
    if (
      !rmUser ||
      !["RelationshipManager", "Relationship Manager"].includes(
        String(rmUser.category)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Only relationship managers can access this endpoint",
        },
        { status: 403 }
      );
    }

    const { tutorId } = await params;
    if (!tutorId) {
      return NextResponse.json(
        { success: false, error: "Tutor ID required" },
        { status: 400 }
      );
    }

    const tutor = await User.findById(tutorId)
      .select("_id username email relationshipManager classes")
      .lean();

    if (!tutor) {
      return NextResponse.json(
        { success: false, error: "Tutor not found" },
        { status: 404 }
      );
    }

    const tutorRmId =
      tutor.relationshipManager == null
        ? ""
        : typeof tutor.relationshipManager === "object" && tutor.relationshipManager !== null && "_id" in tutor.relationshipManager
          ? String((tutor.relationshipManager as any)._id)
          : String(tutor.relationshipManager);

    if (tutorRmId !== rmId) {
      return NextResponse.json(
        { success: false, error: "This tutor is not assigned to you" },
        { status: 403 }
      );
    }

    const classIds = (tutor.classes || []).map((id: any) =>
      typeof id === "object" ? id._id : id
    );

    if (classIds.length === 0) {
      return NextResponse.json({
        success: true,
        tutor: { _id: tutor._id, username: tutor.username, email: tutor.email },
        classes: [],
      });
    }

    const classes = await Class.find({ _id: { $in: classIds } })
      .populate("course", "courseName title name")
      .sort({ startTime: 1 })
      .lean();

    const classesWithStudents = await Promise.all(
      classes.map(async (cls: any) => {
        const classId = cls._id.toString();
        const studentsInClass = await User.find({
          classes: new mongoose.Types.ObjectId(classId),
          category: { $in: ["Student", "student"] },
        })
          .select("_id username email address")
          .lean();

        const course = cls.course as any;
        const courseName =
          course?.courseName || course?.title || course?.name || "—";

        return {
          _id: cls._id,
          title: cls.title,
          description: cls.description,
          startTime: cls.startTime,
          endTime: cls.endTime,
          status: cls.status,
          course: courseName,
          courseId: course?._id,
          students: studentsInClass.map((s: any) => ({
            _id: s._id,
            username: s.username,
            email: s.email,
            address: s.address,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      tutor: { _id: tutor._id, username: tutor.username, email: tutor.email },
      classes: classesWithStudents,
    });
  } catch (error: any) {
    console.error("Error fetching RM tutor classes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch tutor classes",
      },
      { status: 500 }
    );
  }
}
