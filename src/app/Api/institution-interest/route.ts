import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const {
      role,
      name,
      phone,
      email,
      institutionName,
      city,
      studentCount,
      type, // "School" or "Academy"
    } = await req.json();

    // Validate required fields
    if (!role || !name || !phone || !email || !institutionName || !city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER, // sender email
        pass: process.env.MAIL_PASS, // Gmail app password
      },
    });

    // Compose email content
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.ADMIN_EMAIL, // receiver email
      subject: `New ${type} Registration Interest - UpKraft`,
      text: `
A new ${type} has expressed interest via the UpKraft platform:

Role: ${role}
Name: ${name}
Phone: ${phone}
Email: ${email}
${type} Name: ${institutionName}
City: ${city}
Student Count: ${studentCount || "Not Provided"}

- Sent automatically by UpKraft Platform
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
