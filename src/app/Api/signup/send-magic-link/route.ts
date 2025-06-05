import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import { sendEmail } from "@/helper/mailer";
import User from "@/models/userModel";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, username, category } = reqBody;

    // Validate required fields
    if (!email || !username || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Send magic link email
    await sendEmail({
      email,
      emailType: "MAGIC_LINK",
    });

    return NextResponse.json(
      { success: true, message: "Verification email sent successfully" },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Magic link sending error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send verification email" },
      { status: 500 }
    );
  }
} 