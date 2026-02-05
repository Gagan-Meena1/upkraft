import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const managers = await User.find({
      category: { $in: ["RelationshipManager", "Relationship Manager"] },
      isVerified: true,
    }).select("_id username email");

    return NextResponse.json(
      { success: true, managers },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching relationship managers:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch relationship managers" },
      { status: 500 }
    );
  }
}