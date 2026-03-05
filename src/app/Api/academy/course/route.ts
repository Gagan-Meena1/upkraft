import courseName from "@/models/courseName";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    await connect();

    // Verify authentication
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const decodedToken = jwt.decode(token);
    const academyId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    if (!academyId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const courseId=request.nextUrl.searchParams.get("courseId");

    // Fetch course data
    const course = await courseName
      .findOne({ _id: courseId})
      .lean();
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        course: course,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching course details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch course details" },
      { status: 500 }
    );
  }
}