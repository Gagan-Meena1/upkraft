import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connect } from "@/dbConnection/dbConfic";
import Registration from "@/models/Registration";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; 

export const runtime = "nodejs"; // ensure Node runtime for AWS SDK

// Centralized env validation + lazy client
function getS3Config() {
  const region =
    process.env.AWS_REGION ||
    process.env.AWS_REGION_CUSTOM ||
    process.env.AWS_DEFAULT_REGION ||
    process.env.NEXT_PUBLIC_AWS_REGION ||
    process.env.NEXT_PUBLIC_AWS_REGION_CUSTOM;

  const bucket =
    process.env.AWS_S3_BUCKET_NAME ||
    process.env.AWS_S3_BUCKET_NAME_CUSTOM;

  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID_CUSTOM;

  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY_CUSTOM;

  if (!region) throw new Error("S3 region is not configured (set AWS_REGION or AWS_REGION_CUSTOM)");
  if (!bucket) throw new Error("S3 bucket is not configured (set AWS_S3_BUCKET_NAME or AWS_S3_BUCKET_NAME_CUSTOM)");
  if (!accessKeyId || !secretAccessKey)
    throw new Error("S3 credentials missing (set AWS_ACCESS_KEY_ID/SECRET or *_CUSTOM)");

  return { region, bucket, accessKeyId, secretAccessKey };
}

let s3Client: S3Client | null = null;

async function uploadResumeToS3(file: File): Promise<string> {
  const { region, bucket, accessKeyId, secretAccessKey } = getS3Config();

  if (!s3Client) {
    s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  // validate file type (PDF/DOC/DOCX)
  const allowedExt = [".pdf", ".doc", ".docx"];
  const name = file.name.toLowerCase();
  const ext = name.slice(name.lastIndexOf("."));
  if (!allowedExt.includes(ext)) {
    throw new Error("Invalid resume file type. Only PDF/DOC/DOCX allowed.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const key = `resumes/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    })
  );

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function POST(req: NextRequest) {
  try {
    await connect();

    const contentType = req.headers.get("content-type") || "";
    let body: any = {};
    let resumeUrl: string | null = null;
    let resumeFileName: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const getStr = (k: string) => {
        const v = form.get(k);
        return typeof v === "string" ? v.trim() : v ? String(v).trim() : "";
      };

      // Accept both phone/contactNumber and skill/instrument
      const phone = getStr("phone") || getStr("contactNumber");
      const skill = getStr("skill") || getStr("instrument");

      body = {
        userType: getStr("userType"),
        name: getStr("name"),
        city: getStr("city"),
        phone,
        countryCode: getStr("countryCode"),
        email: getStr("email"),
        skill,
        tutorName: getStr("tutorName") || null,
        demoDate: getStr("demoDate") || null,
        demoTime: getStr("demoTime") || null,
      };

      const file = form.get("resumeFile") as File | null;
      if (file) {
        resumeFileName = file.name;
        resumeUrl = await uploadResumeToS3(file);
      }
    } else {
      body = await req.json();
      resumeUrl = body.resumeUrl || null;
      resumeFileName = body.resumeFileName || null;
    }

    console.log("📩 Received Body:", body);

    const userType = (body.userType?.trim() || body.key?.trim()) as string | undefined;
    const name = body.name?.trim();
    const city = body.city?.trim();

    // Accept both phone/contactNumber
    const rawPhone = body.phone ?? body.contactNumber;
    const contactNumber = rawPhone ? String(rawPhone).trim() : "";

    const countryCode = body.countryCode?.trim();
    const email = body.email?.trim();

    // Accept both skill/instrument
    const rawInstrument = body.skill ?? body.instrument;
    const instrument = rawInstrument ? String(rawInstrument).trim() : "";

    const tutorName = body.tutorName?.trim() || null;
    const demoDate = body.demoDate?.trim() || null;
    const demoTime = body.demoTime?.trim() || null;

    if (
      !([
        userType,
        name,
        city,
        contactNumber,
        countryCode,
        email,
        instrument,
      ].every(Boolean) && userType && name && city && contactNumber && countryCode && email && instrument)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["Student", "Tutor"].includes(userType!)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email!)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

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
      ...(resumeUrl ? { resumeUrl } : {}),
      ...(resumeFileName ? { resumeFileName } : {}),
    };

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
  } catch (error: any) {
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
