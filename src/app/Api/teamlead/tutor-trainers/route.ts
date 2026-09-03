import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const trainers = await User.find({
      category: "Tutor",
      tutorTrainer: true,
    }).select("_id username email");

    return NextResponse.json(
      { success: true, trainers },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching tutor trainers:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tutor trainers" },
      { status: 500 }
    );
  }
}
