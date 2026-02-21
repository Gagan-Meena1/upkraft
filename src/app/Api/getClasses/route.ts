import { NextResponse } from "next/server";
import User from "@/models/userModel";
import Class from "@/models/Class";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    await connect();
    console.log("Fetching missing feedback...");

    // Get tutorId from query param or token
    const { searchParams } = new URL(request.url);
    let tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      // Get from token if not in query param
      const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
      if (!token) {
        return NextResponse.json({ error: "No token or tutorId found" }, { status: 401 });
      }

      const decodedToken = jwt.decode(token);
      if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      tutorId = decodedToken.id;
    }

    const tutor = await User.findById(tutorId);
    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    const classIds=tutor.classes.map(id => id.toString());
        // Get class details
        const classes = await Class.find({ _id: { $in: classIds } });

      
    return NextResponse.json({
      success: true,
      message: "Missing feedback classes retrieved successfully",
      tutorId,
      classes
    });

  } catch (error:any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}