import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connect } from "@/dbConnection/dbConfic";
import InstitutionRegistration from "@/models/InstitutionRegistration";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📩 Received Registration Data:", body);

    const {
      role,
      name,
      phone,
      email,
      institutionName,
      city,
      studentCount,
      type,
    } = body;

    if (!role || !name || !phone || !email || !institutionName || !city || !type) {
      console.warn("⚠️ Missing required fields:", {
        role,
        name,
        phone,
        email,
        institutionName,
        city,
        type,
      });

      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connect();
    console.log("✅ Connected to MongoDB");

    const registration = await InstitutionRegistration.create({
      role,
      name,
      phone,
      email,
      institutionName,
      city,
      studentCount,
      type,
    });

    console.log("💾 Saved Registration Document:", registration);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New ${type} Registration Interest - UpKraft`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6E09BD; border-bottom: 2px solid #6E09BD; padding-bottom: 10px;">
            New ${type} Registration Interest
          </h2>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><b>Role:</b></td><td>${role}</td></tr>
              <tr><td><b>Name:</b></td><td>${name}</td></tr>
              <tr><td><b>Phone:</b></td><td>${phone}</td></tr>
              <tr><td><b>Email:</b></td><td>${email}</td></tr>
              <tr><td><b>${type} Name:</b></td><td>${institutionName}</td></tr>
              <tr><td><b>City:</b></td><td>${city}</td></tr>
              <tr><td><b>Student Count:</b></td><td>${studentCount || "Not Provided"}</td></tr>
              <tr><td><b>Submitted At:</b></td><td>${new Date().toLocaleString(
                "en-IN",
                { timeZone: "Asia/Kolkata" }
              )}</td></tr>
            </table>
          </div>

          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; font-size: 12px; color: #666;">
            <p style="margin: 0;">Record ID: <code>${registration._id}</code></p>
          </div>
        </div>
      `,
    };

    const emailResult = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", emailResult.response);

    return NextResponse.json({
      success: true,
      message: `${type} registration interest submitted successfully.`,
      id: registration._id,
      type: registration.type,
    });
  } catch (error: any) {
    console.error("❌ Error sending email or saving registration:", error);
    return NextResponse.json(
      { error: "Failed to process registration", details: error.message },
      { status: 500 }
    );
  }
}

// ✅ GET endpoint to fetch all institution registrations
export async function GET(req: NextRequest) {
  try {
    await connect();
    console.log("✅ Connected to MongoDB for GET request");

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'School' or 'Academy'
    const role = searchParams.get('role');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '100');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    // Build query filter
    const filter: any = {};
    if (type && (type === 'School' || type === 'Academy')) {
      filter.type = type;
    }
    if (role) {
      filter.role = role;
    }
    if (city) {
      filter.city = new RegExp(city, 'i'); // case-insensitive search
    }

    // Fetch registrations from database
    const registrations = await InstitutionRegistration.find(filter)
      .sort({ [sortBy]: order })
      .limit(limit)
      .lean();

    console.log(`📊 Fetched ${registrations.length} institution registrations`);

    // Get counts
    const totalCount = await InstitutionRegistration.countDocuments(filter);
    const schoolCount = await InstitutionRegistration.countDocuments({ type: 'School' });
    const academyCount = await InstitutionRegistration.countDocuments({ type: 'Academy' });

    return NextResponse.json({
      success: true,
      data: registrations,
      meta: {
        total: totalCount,
        schools: schoolCount,
        academies: academyCount,
        returned: registrations.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching institution registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations", details: error.message },
      { status: 500 }
    );
  }
}