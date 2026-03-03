// src/app/Api/tutorSlots/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

await connect();

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
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

    const body = await request.json();
    const { tutorId, slots } = body;

    console.log("Received slot update request:", {
      tutorId,
      slotsCount: slots?.length,
      firstSlot: slots?.[0],
    });

    if (!tutorId) {
      return NextResponse.json(
        { success: false, message: "Tutor ID is required" },
        { status: 400 }
      );
    }

    if (!slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { success: false, message: "Slots array is required" },
        { status: 400 }
      );
    }

    // Verify tutor exists
    const tutor = await User.findById(tutorId);
    if (!tutor) {
      return NextResponse.json(
        { success: false, message: "Tutor not found" },
        { status: 404 }
      );
    }

    if (tutor.category !== "Tutor") {
      return NextResponse.json(
        { success: false, message: "Selected user is not a tutor" },
        { status: 400 }
      );
    }

    // Validate and convert slot format
    const validatedSlots = slots.map((slot, index) => {
      if (!slot.startTime || !slot.endTime) {
        throw new Error(`Slot ${index}: must have startTime and endTime`);
      }

      // Parse ISO strings to Date objects
      const startTime = new Date(slot.startTime);
      const endTime = new Date(slot.endTime);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error(`Slot ${index}: invalid date format`);
      }

      if (endTime <= startTime) {
        throw new Error(`Slot ${index}: end time must be after start time`);
      }

      // Return as Date objects for MongoDB storage
      return {
        startTime: startTime,
        endTime: endTime,
      };
    });

    console.log("Validated slots:", {
      count: validatedSlots.length,
      firstSlot: validatedSlots[0],
    });

    // Update tutor's slots (replace existing slots with new ones)
    tutor.slotsAvailable = validatedSlots;
    await tutor.save();

    console.log("Successfully updated tutor slots");

    // Return formatted response with ISO strings
    return NextResponse.json(
      {
        success: true,
        message: "Slots updated successfully",
        slots: tutor.slotsAvailable.map((slot) => ({
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating tutor slots:", error);
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

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      return NextResponse.json(
        { success: false, message: "Tutor ID is required" },
        { status: 400 }
      );
    }

    const tutor = await User.findById(tutorId, {
      _id: 1,
      username: 1,
      email: 1,
      timezone: 1,
      slotsAvailable: 1,
    });

    if (!tutor) {
      return NextResponse.json(
        { success: false, message: "Tutor not found" },
        { status: 404 }
      );
    }

    // Convert Date objects to ISO strings
    const tutorFormatted = {
      _id: tutor._id,
      username: tutor.username,
      email: tutor.email,
      timezone: tutor.timezone || "UTC",
      slotsAvailable: (tutor.slotsAvailable || []).map((slot) => ({
        startTime: slot.startTime instanceof Date ? slot.startTime.toISOString() : slot.startTime,
        endTime: slot.endTime instanceof Date ? slot.endTime.toISOString() : slot.endTime,
      })),
    };

    return NextResponse.json(
      {
        success: true,
        tutor: tutorFormatted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tutor slots:", error);
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