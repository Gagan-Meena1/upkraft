import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const { userId, academyId } = await request.json();

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    if (!academyId) {
      return NextResponse.json(
        { message: "Academy ID is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid User ID format" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(academyId)) {
      return NextResponse.json(
        { message: "Invalid Academy ID format" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify that the academy exists
    const academy = await User.findById(academyId);

    if (!academy) {
      return NextResponse.json(
        { message: "Academy not found" },
        { status: 404 }
      );
    }

    // Update the academyId field
    user.academyId = academyId;
    
    await user.save();

    return NextResponse.json({
      message: "Academy ID updated successfully",
      data: {
        userId: user._id,
        academyId: user.academyId,
        username: user.username,
        email: user.email
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating academy ID:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update academy ID" },
      { status: 500 }
    );
  }
}