import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import jwt from "jsonwebtoken";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tutorId: string; classId: string }> }
) {
  try {
    await connect();

    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) { }
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.decode(token);
    const rmId = decoded && typeof decoded === "object" && "id" in decoded ? (decoded as { id: string }).id : null;

    if (!rmId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const rmUser = await User.findById(rmId).select("category");
    if (!rmUser || !["RelationshipManager", "Relationship Manager"].includes(String(rmUser.category))) {
      return NextResponse.json(
        { success: false, error: "Only relationship managers can access this endpoint" },
        { status: 403 }
      );
    }

    const { tutorId, classId } = await params;
    
    if (!tutorId || !classId) {
      return NextResponse.json({ success: false, error: "Tutor ID and Class ID required" }, { status: 400 });
    }

    const tutor = await User.findById(tutorId).select("_id relationshipManager").lean();
    if (!tutor) {
      return NextResponse.json({ success: false, error: "Tutor not found" }, { status: 404 });
    }

    const tutorRmId = tutor.relationshipManager == null ? "" : typeof tutor.relationshipManager === "object" && tutor.relationshipManager !== null && "_id" in tutor.relationshipManager ? String((tutor.relationshipManager as any)._id) : String(tutor.relationshipManager);

    if (tutorRmId !== rmId) {
      return NextResponse.json({ success: false, error: "This tutor is not assigned to you" }, { status: 403 });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    }

    // Set deletion request flags
    cls.deleteRequest = true;
    cls.deleteRequestStatus = "pending";
    await cls.save();

    return NextResponse.json({ success: true, message: "Delete request sent to team lead" });

  } catch (error: any) {
    console.error("Error creating delete request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create delete request" },
      { status: 500 }
    );
  }
}
