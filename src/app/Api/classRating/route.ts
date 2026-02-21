import { NextResponse } from "next/server";
import Class from "@/models/Class";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    await connect();

    // Get userId from token
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = decodedToken.id;

    // Get request body
    const body = await request.json();
    const { classId, rating, feedback } = body;

    // Validate inputs
    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Find the class
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if user has already rated this class
    const existingRatingIndex = classDoc.csat.findIndex(
      (entry: any) => entry.userId.toString() === userId.toString()
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      classDoc.csat[existingRatingIndex].rating = rating;
      if (feedback) {
        classDoc.csat[existingRatingIndex].feedback = feedback;
      }
    } else {
      // Add new rating
      classDoc.csat.push({
        userId,
        rating,
        feedback: feedback || ""
      });
    }

    await classDoc.save();

    return NextResponse.json({
      success: true,
      message: existingRatingIndex !== -1 ? "Rating updated successfully" : "Rating submitted successfully",
      data: {
        classId,
        rating,
        feedback
      }
    });

  } catch (error: any) {
    console.error("Error submitting rating:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
