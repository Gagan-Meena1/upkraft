import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helper/getDataFromToken";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId).select("category tutorTrainer tutors").lean();
    if (!user || (user as any).category !== "Tutor" || !(user as any).tutorTrainer) {
      return NextResponse.json(
        { success: false, error: "Forbidden — you are not a Tutor Trainer" },
        { status: 403 }
      );
    }

    const tutorIds = (user as any).tutors || [];

    if (tutorIds.length === 0) {
      return NextResponse.json({ success: true, tutors: [] }, { status: 200 });
    }

    const tutors = await User.find({
      _id: { $in: tutorIds },
      category: "Tutor",
    })
      .select("_id username email contact courses city state students")
      .populate({ path: "courses", select: "title category" })
      .lean();

    return NextResponse.json({ success: true, tutors }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching tutor trainer's tutors:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tutors" },
      { status: 500 }
    );
  }
}
