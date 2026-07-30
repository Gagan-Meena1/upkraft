import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";

await connect();

// POST: Increment whatsappSentCount for a class
export async function POST(request: NextRequest) {
  try {
    const { classId } = await request.json();

    if (!classId) {
      return NextResponse.json(
        { error: "classId is required" },
        { status: 400 }
      );
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $inc: { whatsappSentCount: 1 } },
      { new: true }
    ).select("whatsappSentCount").lean();

    if (!updatedClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      whatsappSentCount: (updatedClass as any).whatsappSentCount,
    });
  } catch (error) {
    console.error("Error incrementing whatsapp sent count:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
