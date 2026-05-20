import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

await connect();

export async function GET(request: NextRequest) {
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

    // Lightweight query — only names and emails for the sidebar/search
    const tutors = await User.find(
      { category: "Tutor" },
      { _id: 1, username: 1, email: 1 }
    ).sort({ username: 1 }).lean();

    const tutorList = tutors.map((t: any) => ({
      _id: t._id.toString(),
      username: t.username,
      email: t.email,
    }));

    return NextResponse.json({ success: true, tutors: tutorList }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tutor list:", error);
    return NextResponse.json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
