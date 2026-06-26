import { NextResponse, NextRequest } from "next/server";
import mongoose from "mongoose";
import User from "@/models/userModel";
import {connect} from "@/dbConnection/dbConfic";
import { getDataFromToken } from "@/helper/getDataFromToken";

export async function PUT(req: NextRequest) {
  try {
    await connect();

    const callerId = getDataFromToken(req);
    if (!callerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const caller = await User.findById(callerId).select("category");
    if (!caller || !["Admin", "TeamLead"].includes(caller.category)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Suspend user
    user.isVerified = false;

    await user.save();

    return NextResponse.json({
      message: "User suspended successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Suspend error:", error);
    return NextResponse.json(
      { error: "Failed to suspend user" },
      { status: 500 }
    );
  }
}
