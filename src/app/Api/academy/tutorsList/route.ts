import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    await connect();

    // Get academy user from token
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const decodedToken = jwt.decode(token);
    const academyId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
    if (!academyId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify the user is an Academy
    const academy = await User.findById(academyId).lean();
    if (!academy || academy.category !== "Academic") {
      return NextResponse.json({ error: "Only academies can access this endpoint" }, { status: 403 });
    }

    // Get all academy-created tutors
    const tutors = await User.find({
      category: "Tutor",
      academyId: academyId
    })
    .select("_id username email")
    .lean();

    return NextResponse.json({
      success: true,
      tutors: tutors.map(tutor => ({
        _id: tutor._id.toString(),
        username: tutor.username,
        email: tutor.email
      }))
    });

  } catch (error: any) {
    console.error("Error fetching tutors list:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tutors list" },
      { status: 500 }
    );
  }
}

