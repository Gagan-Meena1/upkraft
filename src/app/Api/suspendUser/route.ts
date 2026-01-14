import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/userModel"; // adjust path
import {connect} from "@/dbConnection/dbConfic";  // your db connect function

export async function PUT(req: Request) {
  try {
    await connect();

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
