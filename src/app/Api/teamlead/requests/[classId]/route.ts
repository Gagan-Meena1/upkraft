import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    await connect();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.decode(token);
    const userId = decoded && typeof decoded === "object" && "id" in decoded ? (decoded as { id: string }).id : null;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const user = await User.findById(userId).select("category");
    if (!user || !["teamlead", "team lead", "TeamLead"].includes(String(user.category).toLowerCase().replace(/\s/g, ""))) {
      return NextResponse.json(
        { success: false, error: "Only team leads can access this endpoint" },
        { status: 403 }
      );
    }

    const { classId } = await params;
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!classId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid request parameters" }, { status: 400 });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    }

    if (action === "approve") {
      cls.deleteRequestStatus = "approved";
      cls.status = "canceled"; // Optionally actually delete it: await Class.findByIdAndDelete(classId)
    } else {
      cls.deleteRequestStatus = "rejected";
    }

    await cls.save();

    return NextResponse.json({ success: true, message: `Request ${action}d successfully` });

  } catch (error: any) {
    console.error(`Error handling request:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
