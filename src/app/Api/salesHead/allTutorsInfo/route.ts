import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import Society from "@/models/society";

await connect();

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
  
        const tutors = await User.find(
          { category: "Tutor" },
          {
            _id: 1,
            username: 1,
            email: 1,
            timezone: 1,
            demoSlotsAvailable: 1,
            profileImage: 1,
          }
        ).sort({ username: 1 });
        // Convert Date objects to ISO strings for frontend
    const tutorsFormatted = await Promise.all(
  tutors.map(async (tutor) => {
    // unique societyIds nikalo
    const societyIds = [
      ...new Set(
        (tutor.demoSlotsAvailable || [])
          .map((s) => s.societyId?.toString())
          .filter(Boolean)
      ),
    ];

    // ek baar mein saari societies fetch karo
    const societies = await Society.find(
      { _id: { $in: societyIds } },
      { _id: 1, name: 1, city: 1 }
    ).lean();

    const societyMap = Object.fromEntries(
      societies.map((s) => [s._id.toString(), s])
    );

    return {
      _id: tutor._id,
      username: tutor.username,
      email: tutor.email,
      timezone: tutor.timezone || "UTC",
      profileImage: tutor.profileImage,
      slotsAvailable: (tutor.demoSlotsAvailable || []).map((slot) => ({
        startTime: slot.startTime instanceof Date ? slot.startTime.toISOString() : slot.startTime,
        endTime: slot.endTime instanceof Date ? slot.endTime.toISOString() : slot.endTime,
        societyId: slot.societyId?.toString() || null,
        societyName: slot.societyId
          ? societyMap[slot.societyId.toString()]?.name || null
          : null,
        societyCity: slot.societyId
          ? societyMap[slot.societyId.toString()]?.city || null
          : null,
      })),
    };
  })
);
    return NextResponse.json(
      {
        success: true,
        tutors: tutorsFormatted,
      },
      { status: 200 }
    );
    
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
