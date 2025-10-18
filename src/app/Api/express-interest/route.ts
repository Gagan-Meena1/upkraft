import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connect } from '@/dbConnection/dbConfic';
import Registration from '@/models/Registration';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received Body:", body);

    const userType = body.userType || body.key;
    const name = body.name?.trim();
    const city = body.city?.trim();
    const contactNumber = body.phone?.trim();
    const instrument = body.skill?.trim();

    if (![userType, name, city, contactNumber, instrument].every(f => f && f.length > 0)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (userType !== 'Student' && userType !== 'Tutor') {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    await connect();

    const registration = await Registration.create({
      userType,
      name,
      city,
      contactNumber,
      instrument,
    });

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

// ✅ GET endpoint to fetch all registrations
export async function GET(req: NextRequest) {
  try {
    await connect();

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const userType = searchParams.get('userType'); // 'Student' or 'Tutor'
    const limit = parseInt(searchParams.get('limit') || '100');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // default sort by creation date
    const order = searchParams.get('order') === 'asc' ? 1 : -1; // default descending

    // Build query filter
    const filter: any = {};
    if (userType && (userType === 'Student' || userType === 'Tutor')) {
      filter.userType = userType;
    }

    // Fetch registrations from database
    const registrations = await Registration.find(filter)
      .sort({ [sortBy]: order })
      .limit(limit)
      .lean(); // .lean() for better performance

    // Get counts
    const totalCount = await Registration.countDocuments(filter);
    const studentCount = await Registration.countDocuments({ userType: 'Student' });
    const tutorCount = await Registration.countDocuments({ userType: 'Tutor' });

    return NextResponse.json({
      success: true,
      data: registrations,
      meta: {
        total: totalCount,
        students: studentCount,
        tutors: tutorCount,
        returned: registrations.length,
      },
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch registrations', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}