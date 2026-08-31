import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helper/getDataFromToken";

export async function PUT(request: NextRequest) {
  try {
    await connect();

    const callerId = getDataFromToken(request);
    if (!callerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const caller = await User.findById(callerId).select("category");
    if (!caller || !["Admin", "TeamLead"].includes(caller.category)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { tutorId, tutorTrainer } = await request.json();

    if (!tutorId || typeof tutorTrainer !== "boolean") {
      return NextResponse.json(
        { success: false, error: "tutorId and tutorTrainer (boolean) are required" },
        { status: 400 }
      );
    }

    const tutor = await User.findOneAndUpdate(
      { _id: tutorId, category: "Tutor" },
      { tutorTrainer },
      { new: true }
    ).select("_id username email tutorTrainer");

    if (!tutor) {
      return NextResponse.json(
        { success: false, error: "Tutor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, tutor },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error toggling tutor trainer:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to toggle tutor trainer" },
      { status: 500 }
    );
  }
}
