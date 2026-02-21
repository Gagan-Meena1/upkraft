import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

await connect();

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decodedToken = jwt.decode(token);
    const userId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId).select("category");
    // Fetch all tutors with their availability slots
    if(user?.category == "Academic"){
    const tutors = await User.find(
      { category: "Tutor", academyId: userId },
      {
        _id: 1,
        username: 1,
        email: 1,
        timezone: 1,
        slotsAvailable: 1,
        profileImage: 1,
      }
    ).sort({ username: 1 });

    // Convert Date objects to ISO strings for frontend
    const tutorsFormatted = tutors.map((tutor) => ({
      _id: tutor._id,
      username: tutor.username,
      email: tutor.email,
      timezone: tutor.timezone || "UTC",
      profileImage: tutor.profileImage,
      slotsAvailable: (tutor.slotsAvailable || []).map((slot) => ({
        startTime: slot.startTime instanceof Date ? slot.startTime.toISOString() : slot.startTime,
        endTime: slot.endTime instanceof Date ? slot.endTime.toISOString() : slot.endTime,
      })),
    }));

    return NextResponse.json(
      {
        success: true,
        tutors: tutorsFormatted,
      },
      { status: 200 }
    );
    } else {
        const tutors = await User.find(
          { category: "Tutor" ,_id: userId  },
          {
            _id: 1,
            username: 1,
            email: 1,
            timezone: 1,
            slotsAvailable: 1,
            profileImage: 1,
          }
        ).sort({ username: 1 });
        // Convert Date objects to ISO strings for frontend
    const tutorsFormatted = tutors.map((tutor) => ({
      _id: tutor._id,
      username: tutor.username,
      email: tutor.email,
      timezone: tutor.timezone || "UTC",
      profileImage: tutor.profileImage,
      slotsAvailable: (tutor.slotsAvailable || []).map((slot) => ({
        startTime: slot.startTime instanceof Date ? slot.startTime.toISOString() : slot.startTime,
        endTime: slot.endTime instanceof Date ? slot.endTime.toISOString() : slot.endTime,
      })),
    }));

    return NextResponse.json(
      {
        success: true,
        tutors: tutorsFormatted,
      },
      { status: 200 }
    );
    }
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
