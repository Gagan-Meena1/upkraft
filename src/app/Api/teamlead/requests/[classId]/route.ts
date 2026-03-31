import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";
import User from "@/models/userModel";
import Feedback from "@/models/feedback";
import FeedbackDance from "@/models/feedbackDance";
import FeedbackDrawing from "@/models/feedbackDrawing";
import FeedbackDrums from "@/models/feedbackDrums";
import FeedbackVocal from "@/models/feedbackVocal";
import FeedbackViolin from "@/models/feedbackViolin";
import jwt from "jsonwebtoken";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
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

    const user = await User.findById(userId).select("category");
    if (!user || !["teamlead", "team lead", "TeamLead"].includes(String(user.category).toLowerCase().replace(/\s/g, ""))) {
      return NextResponse.json(
        { success: false, error: "Only team leads can access this endpoint" },
        { status: 403 }
      );
    }

    const { classId } = await params;
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!classId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid request parameters" }, { status: 400 });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    }

    if (action === "approve") {
      const isPartial = cls.deleteRequestType === 'partial' && Array.isArray(cls.deleteRequestStudents) && cls.deleteRequestStudents.length > 0;
      
      if (isPartial) {
        const studentIds = cls.deleteRequestStudents.map((id: any) => id.toString());
        
        // Remove classId only from the requested students
        await User.updateMany(
          { _id: { $in: studentIds } },
          { $pull: { classes: classId, attendance: { classId: classId } } }
        );

        // Delete feedbacks only for these specific students
        await Promise.all([
          Feedback.deleteMany({ classId: classId, userId: { $in: studentIds } }),
          FeedbackDance.deleteMany({ classId: classId, userId: { $in: studentIds } }),
          FeedbackDrawing.deleteMany({ classId: classId, userId: { $in: studentIds } }),
          FeedbackDrums.deleteMany({ classId: classId, userId: { $in: studentIds } }),
          FeedbackVocal.deleteMany({ classId: classId, userId: { $in: studentIds } }),
          FeedbackViolin.deleteMany({ classId: classId, userId: { $in: studentIds } })
        ]);

        // Reset class flags since the request has been processed
        cls.deleteRequest = false;
        cls.deleteRequestStatus = null;
        cls.deleteRequestType = 'full';
        cls.deleteRequestStudents = [];
        await cls.save();

      } else {
        // Hard delete from Class collection for FULL deletion
        await Class.findByIdAndDelete(classId);

        // Remove the class reference from any User documents (Tutor & Students)
        await User.updateMany(
          { classes: classId },
          { $pull: { classes: classId } }
        );

        // Delete any feedback associated with the class across all course-specific feedback collections
        await Promise.all([
          Feedback.deleteMany({ classId: classId }),
          FeedbackDance.deleteMany({ classId: classId }),
          FeedbackDrawing.deleteMany({ classId: classId }),
          FeedbackDrums.deleteMany({ classId: classId }),
          FeedbackVocal.deleteMany({ classId: classId }),
          FeedbackViolin.deleteMany({ classId: classId })
        ]);

        // Remove the class from the attendance arrays of any users
        await User.updateMany(
          { "attendance.classId": classId },
          { $pull: { attendance: { classId: classId } } }
        );
      }
    } else {
      cls.deleteRequestStatus = "rejected";
      await cls.save();
    }

    return NextResponse.json({ success: true, message: `Request ${action}d successfully` });

  } catch (error: any) {
    console.error(`Error handling request:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
