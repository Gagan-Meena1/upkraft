import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connect } from '@/dbConnection/dbConfic';
import Registration from '@/models/Registration';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received Body:", body); // 👈 Debugging

    // Map frontend field names to backend model fields
    const userType = body.userType || body.key; // Default to Student if not passed
    const name = body.name?.trim();
    const city = body.city?.trim();
    const contactNumber = body.phone?.trim(); // renamed
    const instrument = body.skill?.trim(); // renamed

    // Validate required fields
    if (![userType, name, city, contactNumber, instrument].every(f => f && f.length > 0)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate userType
    if (userType !== 'Student' && userType !== 'Tutor') {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    // Connect to MongoDB
    await connect();

    // Save to MongoDB
    const registration = await Registration.create({
      userType,
      name,
      city,
      contactNumber,
      instrument,
    });

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const emailSubject =
      userType === 'Student'
        ? 'New Student Registration - UpKraft'
        : 'New Tutor Registration - UpKraft';

    const instrumentLabel =
      userType === 'Student' ? 'Instrument' : 'Instrument Expertise';

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6E09BD; border-bottom: 2px solid #6E09BD; padding-bottom: 10px;">
            New ${userType} Registration
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><b>User Type:</b></td><td>${userType}</td></tr>
              <tr><td><b>Name:</b></td><td>${name}</td></tr>
              <tr><td><b>City:</b></td><td>${city}</td></tr>
              <tr><td><b>Contact Number:</b></td><td>${contactNumber}</td></tr>
              <tr><td><b>${instrumentLabel}:</b></td><td>${instrument}</td></tr>
              <tr><td><b>Submitted At:</b></td><td>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
            </table>
          </div>
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; font-size: 12px; color: #666;">
            <p style="margin: 0;">Record ID: <code>${registration._id}</code></p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: `${userType} registration submitted successfully`,
      id: registration._id,
      userType: registration.userType,
    });
  } catch (error) {
    console.error('Error processing registration:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to process registration', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}
