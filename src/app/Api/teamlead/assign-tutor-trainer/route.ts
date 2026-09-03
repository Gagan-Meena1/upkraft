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

    const { tutorId, tutorTrainerId } = await request.json();

    if (!tutorId || !tutorTrainerId) {
      return NextResponse.json(
        { success: false, error: "tutorId and tutorTrainerId are required" },
        { status: 400 }
      );
    }

    // Validate tutor trainer exists and has tutorTrainer flag
    const trainer = await User.findOne({
      _id: tutorTrainerId,
      category: "Tutor",
      tutorTrainer: true,
    }).select("_id username email tutors");

    if (!trainer) {
      return NextResponse.json(
        { success: false, error: "Invalid tutor trainer" },
        { status: 400 }
      );
    }

    // Validate the tutor exists
    const tutor = await User.findOne({
      _id: tutorId,
      category: "Tutor",
    }).select("_id username email assignedTutorTrainer");

    if (!tutor) {
      return NextResponse.json(
        { success: false, error: "Tutor not found" },
        { status: 404 }
      );
    }

    // Don't allow assigning a tutor trainer to themselves
    if (tutorId === tutorTrainerId) {
      return NextResponse.json(
        { success: false, error: "A tutor trainer cannot be assigned to themselves" },
        { status: 400 }
      );
    }

    // Remove tutor from previous trainer's tutors array if reassigning
    if (tutor.assignedTutorTrainer && String(tutor.assignedTutorTrainer) !== tutorTrainerId) {
      await User.findByIdAndUpdate(tutor.assignedTutorTrainer, {
        $pull: { tutors: tutorId },
      });
    }

    // Set the assignedTutorTrainer on the tutor
    await User.findByIdAndUpdate(tutorId, {
      assignedTutorTrainer: tutorTrainerId,
    });

    // Add tutor to trainer's tutors array (avoid duplicates)
    await User.findByIdAndUpdate(tutorTrainerId, {
      $addToSet: { tutors: tutorId },
    });

    // Fetch updated trainer with populated tutors
    const updatedTrainer = await User.findById(tutorTrainerId)
      .select("_id username email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        tutor: {
          ...tutor.toObject(),
          assignedTutorTrainer: updatedTrainer,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error assigning tutor trainer:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to assign tutor trainer" },
      { status: 500 }
    );
  }
}
