import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.decode(token);
    const rmId =
      decoded && typeof decoded === "object" && "id" in decoded
        ? (decoded as any).id
        : null;

    if (!rmId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const rmUser = await User.findById(rmId).select("category");
    if (
      !rmUser ||
      !["RelationshipManager", "Relationship Manager"].includes(
        String(rmUser.category)
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Only relationship managers can access this endpoint" },
        { status: 403 }
      );
    }

    const tutors = await User.find({
      category: "Tutor",
      relationshipManager: rmId,
    }).select("_id username email contact");

    return NextResponse.json(
      { success: true, tutors },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching relationship manager tutors:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tutors" },
      { status: 500 }
    );
  }
}