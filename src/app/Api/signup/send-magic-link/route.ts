import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import { sendEmail } from "@/helper/mailer";
import User from "@/models/userModel";


export async function POST(request: NextRequest) {
  try {
    await connect();
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

    // Check if the category requires admin approval
    if (category.toLowerCase() === "tutor" || category.toLowerCase() === "admin" || category.toLowerCase() === "student") {
      // Send notification email to admin
      await sendEmail({
        email,
        emailType: "ADMIN_APPROVAL",
        username,
        category
      });

      // Send confirmation email to user
      await sendEmail({
        email,
        emailType: "USER_CONFIRMATION",
        username,
        category
      });

      return NextResponse.json(
        { 
          success: true, 
          message: "Your request has been sent to the admin. You will be able to login once the admin approves your registration."
        },
        { status: 200 }
      );
    } else {
      // For regular users (students), send normal magic link
      await sendEmail({
        email,
        emailType: "MAGIC_LINK",
        username,
        category
      });

      return NextResponse.json(
        { 
          success: true, 
          message: "Verification email sent successfully"
        },
        { status: 200 }
      );
    }

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process registration" },
      { status: 500 }
    );
  }
}