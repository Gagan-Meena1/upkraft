import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    await connect();

    // Get the current user's token
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Decode and verify the current user
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.TOKEN_SECRET!);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = decoded?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Verify the current user is a Team Lead or Admin
    const user = await (User as any).findById(userId).select("category");
    if (
      !user ||
      !["teamlead", "team lead", "TeamLead", "admin"].includes(
        String(user.category).toLowerCase().replace(/\s/g, "")
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Only Team Leads and Admins can impersonate tutors",
        },
        { status: 403 }
      );
    }

    // Get the tutor ID from request body
    const { tutorId } = await request.json();
    if (!tutorId) {
      return NextResponse.json(
        { success: false, error: "Tutor ID is required" },
        { status: 400 }
      );
    }

    // Verify the tutor exists
    const tutor = await (User as any).findOne({
      _id: tutorId,
      category: "Tutor",
    });

    if (!tutor) {
      return NextResponse.json(
        {
          success: false,
          error: "Tutor not found",
        },
        { status: 404 }
      );
    }

    // Verify the tutor is approved
    if (!tutor.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Tutor account is not verified yet",
        },
        { status: 403 }
      );
    }

    // Generate a new JWT token for the tutor
    const tokenData = {
      id: tutor._id,
      username: tutor.username,
      email: tutor.email,
      category: tutor.category,
    };

    const tutorToken = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "1d",
    });

    // Create response with success
    const response = NextResponse.json({
      success: true,
      message: "Successfully logged in as tutor",
      user: {
        id: tutor._id,
        email: tutor.email,
        username: tutor.username,
        category: tutor.category,
      },
    });

    // Set the tutor's token in a separate impersonate_token cookie
    response.cookies.set("impersonate_token", tutorToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: any) {
    console.error("Error impersonating tutor:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to impersonate tutor" },
      { status: 500 }
    );
  }
}
