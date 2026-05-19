import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";
import Registration from "@/models/Registration";
import User from "@/models/userModel";
import * as dateFnsTz from 'date-fns-tz';

export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const {
      name, phone, email, pname, age, notes, consent,
      society, hobby, tutorId, date, slotTime, address
    } = body;

    // 1. Save Lead in Registration
    const reg = new Registration({
      userType: 'Student',
      name: name,
      participantName: pname,
      age: age,
      notes: notes,
      city: society?.city || 'Unknown',
      societyName: society?.name || null,
      contactNumber: phone,
      countryCode: '+91',
      email: email || '',
      instrument: hobby?.name || 'Unknown',
      tutorName: tutorId,
      demoDate: date,
      demoTime: slotTime,
      address: address || null,
      ...(body.payment ? { payment: body.payment } : {}),
    });
    console.log("reg", reg);
    await reg.save();
    // 2. Create a Class for the Demo
    const tutor = await User.findById(tutorId).select('timezone').lean();
    if (!tutor) {
      return NextResponse.json({ success: false, message: "Tutor not found" }, { status: 404 });
    }

    // Frontend sends `date` as an ISO string with the correct time already set
    const startUTC = new Date(date);
    const durationMs = (body.duration || 45) * 60000; // default 45 min
    const endUTC = new Date(startUTC.getTime() + durationMs);

    const newClass = new Class({
      title: `Free Trial: ${hobby?.name} for ${pname}`,
      description: `Student: ${pname} (Age: ${age})\nParent: ${name}\nPhone: ${phone}\nEmail: ${email}\nNotes: ${notes}\nSociety: ${society?.name}\nAddress: ${address || ''}`,
      startTime: startUTC,
      endTime: endUTC,
      instructor: tutorId,
      classType: 'trial',
      status: 'scheduled'
    });

    const savedClass = await newClass.save();

    // Update tutor's classes and registrations
    await User.findByIdAndUpdate(tutorId, {
      $addToSet: { classes: savedClass._id, registrations: reg._id }
    });

    return NextResponse.json({ success: true, message: "Trial booked successfully" }, { status: 201 });

  } catch (error: any) {
    console.error("Error booking trial:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
