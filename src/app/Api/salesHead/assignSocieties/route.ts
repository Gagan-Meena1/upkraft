import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

await connect();

// PUT — assign societies to a tutor
export async function PUT(request: NextRequest) {
  try {
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || request.nextUrl?.pathname?.startsWith("/Api/tutor");
      return (isTutorContext && request.cookies.get("impersonate_token")?.value)
        ? request.cookies.get("impersonate_token")?.value
        : request.cookies.get("token")?.value;
    })();

    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decodedToken = jwt.decode(token);
    const userId = decodedToken && typeof decodedToken === "object" && "id" in decodedToken
      ? decodedToken.id : null;

    if (!userId) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { tutorId, societyIds } = body;

    if (!tutorId) return NextResponse.json({ success: false, message: "Tutor ID is required" }, { status: 400 });
    if (!societyIds || !Array.isArray(societyIds)) {
      return NextResponse.json({ success: false, message: "societyIds array is required" }, { status: 400 });
    }

    const tutor = await User.findById(tutorId);
    if (!tutor) return NextResponse.json({ success: false, message: "Tutor not found" }, { status: 404 });

    // Replace societies entirely with the new selection
    tutor.societies = societyIds.map((id: string) => ({ societyId: id }));
    await tutor.save();

    return NextResponse.json({ success: true, message: "Societies assigned successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error assigning societies:", error);
    return NextResponse.json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
