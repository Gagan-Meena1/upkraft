import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connect } from "@/dbConnection/dbConfic";
import Registration from "@/models/Registration";

export async function POST(req: NextRequest) {
  try {
    // Connect to MongoDB
    await connect();

    const body = await req.json();
    console.log("📩 Received Body:", body);

    const userType = body.userType?.trim() || body.key?.trim();
    const name = body.name?.trim();
    const city = body.city?.trim();
    const contactNumber = body.phone?.trim();
    const countryCode = body.countryCode?.trim();
    const email = body.email?.trim();
    const instrument = body.skill?.trim();
    const tutorName = body.tutorName?.trim() || null; // ✅ new field
    const demoDate = body.demoDate?.trim() || null; // ✅ new field
    const demoTime = body.demoTime?.trim() || null; // ✅ new field

    // Validate inputs
    if (
      ![
        userType,
        name,
        city,
        contactNumber,
        countryCode,
        email,
        instrument,
      ].every(Boolean)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["Student", "Tutor"].includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // ✅ Include tutorName only for Students
    const registrationData: any = {
      userType,
      name,
      city,
      contactNumber,
      countryCode,
      email,
      instrument,
      ...(userType === "Student" && tutorName ? { tutorName } : {}),
      ...(demoDate ? { demoDate } : {}),
      ...(demoTime ? { demoTime } : {}),
    };

    // Create record
    const registration = await Registration.create(registrationData);

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const emailSubject =
      userType === "Student"
        ? "New Student Registration - UpKraft"
        : "New Tutor Registration - UpKraft";

    const instrumentLabel =
      userType === "Student" ? "Instrument" : "Instrument Expertise";

    const tutorRow =
      userType === "Student" && tutorName
        ? `<tr>
            <td style="padding: 8px 0;"><b>Tutor Name:</b></td>
            <td style="padding: 8px 0;">${tutorName}</td>
           </tr>`
        : "";
    const dateTimeRows =
      demoDate && demoTime
        ? `<tr>
      <td style="padding: 8px 0;"><b>${
        userType === "Student" ? "Demo" : "Interview"
      } Date:</b></td>
      <td style="padding: 8px 0;">${new Date(demoDate).toLocaleDateString(
        "en-IN",
        { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      )}</td>
     </tr>
     <tr>
      <td style="padding: 8px 0;"><b>${
        userType === "Student" ? "Demo" : "Interview"
      } Time:</b></td>
      <td style="padding: 8px 0;">${demoTime} (30 min session)</td>
     </tr>`
        : "";

    // Compose email
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
              ${tutorRow}
              ${dateTimeRows}

              <tr><td><b>Email:</b></td><td><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td><b>Contact Number:</b></td><td>${countryCode} ${contactNumber}</td></tr>
              <tr><td><b>${instrumentLabel}:</b></td><td>${instrument}</td></tr>
              <tr><td><b>City:</b></td><td>${city}</td></tr>
              <tr><td><b>Submitted At:</b></td><td>${new Date().toLocaleString(
                "en-IN",
                { timeZone: "Asia/Kolkata" }
              )}</td></tr>
            </table>
          </div>
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; font-size: 12px; color: #666;">
            <p>Record ID: <code>${registration._id}</code></p>
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
    console.error("❌ Error processing registration:", error);
    return NextResponse.json(
      {
        error: "Failed to process registration",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const userType = searchParams.get("userType");
    const limit = parseInt(searchParams.get("limit") || "100");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const filter: any = {};
    if (userType && ["Student", "Tutor"].includes(userType)) {
      filter.userType = userType;
    }

    const registrations = await Registration.find(filter)
      .sort({ [sortBy]: order })
      .limit(limit)
      .lean();

    const totalCount = await Registration.countDocuments(filter);
    const studentCount = await Registration.countDocuments({
      userType: "Student",
    });
    const tutorCount = await Registration.countDocuments({ userType: "Tutor" });

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
    console.error("❌ Error fetching registrations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch registrations",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
