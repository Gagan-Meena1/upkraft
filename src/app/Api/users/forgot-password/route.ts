import { connect } from '@/dbConnection/dbConfic';
import User from "@/models/userModel";
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/helper/mailer';
import crypto from 'crypto';

connect();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 600000; // 10 minutes

    // Save reset token to user
    user.forgotPasswordToken = resetToken;
    user.forgotPasswordTokenExpiry = resetTokenExpiry;
    await user.save({ validateBeforeSave: false });

    // Send reset email
    await sendEmail({
      email: user.email,
      emailType: "RESET_PASSWORD",
      userId: user._id,
      resetToken: resetToken
    });

    return NextResponse.json({
      message: "Password reset link sent to your email",
      success: true
    });

  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
} 