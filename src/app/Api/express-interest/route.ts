import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, city, phone, skill } = await req.json();

    // Validate required fields
    if (!name || !city || !phone || !skill) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER, // Sender email address
        pass: process.env.MAIL_PASS, // Sender email password or app password
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.MAIL_USER, // Send from MAIL_USER
      to: process.env.ADMIN_EMAIL, // Send to ADMIN_EMAIL
      subject: 'New Tutor Express Interest Submission',
      text: `Name: ${name}\nCity: ${city}\nPhone: ${phone}\nSkill Expertise: ${skill}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 