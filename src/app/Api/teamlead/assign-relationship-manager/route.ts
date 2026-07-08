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

    const { tutorId, relationshipManagerId } = await request.json();

    if (!tutorId || !relationshipManagerId) {
      return NextResponse.json(
        { success: false, error: "tutorId and relationshipManagerId are required" },
        { status: 400 }
      );
    }

    const manager = await User.findOne({
      _id: relationshipManagerId,
      category: { $in: ["RelationshipManager", "Relationship Manager"] },
      isVerified: true,
    }).select("_id username email");

    if (!manager) {
      return NextResponse.json(
        { success: false, error: "Invalid relationship manager" },
        { status: 400 }
      );
    }

    const tutor = await User.findOneAndUpdate(
      { _id: tutorId, category: "Tutor" },
      { relationshipManager: relationshipManagerId },
      { new: true }
    );

    if (!tutor) {
      return NextResponse.json(
        { success: false, error: "Tutor not found" },
        { status: 404 }
      );
    }

    const tutorWithManager = {
      ...tutor.toObject(),
      relationshipManager: manager,
    };

    return NextResponse.json(
      { success: true, tutor: tutorWithManager },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error assigning relationship manager:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to assign relationship manager" },
      { status: 500 }
    );
  }
}