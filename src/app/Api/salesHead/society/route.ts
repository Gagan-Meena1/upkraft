// src/app/Api/salesHead/society/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic"; // adjust to your db connect util
import Society from "@/models/society";   // adjust to your model path

export async function GET() {
  try {
    await connect();
    const societies = await Society.find({})
      .populate('tutors', 'username email profileImage timezone demoSlotsAvailable')
      .sort({ isPopular: -1, name: 1 })
      .lean();
    return NextResponse.json({ success: true, societies });
  } catch (error: any) {
    console.error("Error fetching societies:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch societies" },
      { status: 500 }
    );
  }
}