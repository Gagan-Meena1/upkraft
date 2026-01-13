import { Schema, model, Document } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";

const locationSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, required: false },
    capturedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema({

  lastKnownLocation: { type: locationSchema, required: false },
  locationHistory: { type: [locationSchema], required: false },

});

export default model<Document>("User", userSchema);

export async function POST(request: NextRequest) {
  try {
    await connect();
    console.log("[Tutor Location] POST called");

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.decode(token) as { id?: string } | null;
    const tutorId = decoded?.id;
    if (!tutorId) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const tutor = await User.findById(tutorId).select("category");
    if (!tutor || tutor.category !== "Tutor") {
      return NextResponse.json(
        { success: false, error: "Only tutors can update location" },
        { status: 403 }
      );
    }

    const { latitude, longitude, accuracy } = await request.json();

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { success: false, error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    const locationEntry = {
      latitude,
      longitude,
      accuracy: typeof accuracy === "number" ? accuracy : null,
      capturedAt: new Date(),
    };

    await User.findByIdAndUpdate(
      tutorId,
      {
        $set: { lastKnownLocation: locationEntry },
        $push: { locationHistory: locationEntry },
      },
      { new: true }
    );

    console.log("[Tutor Location] Saved successfully");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[Tutor Location] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Server error while saving location",
      },
      { status: 500 }
    );
  }
}