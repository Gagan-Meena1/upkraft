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
      society, hobby, tutorId, date, slotTime 
    } = body;

    // 1. Save Lead in Registration
    const reg = new Registration({
      userType: 'Student',
      name: pname || name,
      city: society?.city || 'Unknown',
      contactNumber: phone,
      countryCode: '+91',
      email: email || 'no-email@upkraft.in',
      instrument: hobby?.name || 'Unknown',
      tutorName: tutorId,
      demoDate: date,
      demoTime: slotTime
    });
    await reg.save();

    // 2. Create a Class for the Demo
    const tutor = await User.findById(tutorId);
    if (!tutor) {
      return NextResponse.json({ success: false, message: "Tutor not found" }, { status: 404 });
    }

    const tutorTz = tutor.timezone || "Asia/Calcutta";
    
    // Parse the slotTime, e.g., "04:00 PM"
    const [time, modifier] = slotTime.split(' ');
    let [hours, minutes] = time.split(':');
    let hourNum = parseInt(hours, 10);
    if (hourNum === 12) hourNum = 0;
    if (modifier === 'PM') hourNum += 12;

    // Parse the date. It should be passed directly from frontend as a Date string or we can reconstruct it.
    // Assuming `date` passed is an ISO string of the raw slot start time.
    let startLocal: Date;
    if (date.includes("T")) {
      startLocal = new Date(date);
    } else {
      // Fallback if frontend sends something else, but we will make sure frontend sends ISO string.
      startLocal = new Date(date);
      startLocal.setHours(hourNum, parseInt(minutes, 10), 0, 0);
    }

    // Class is 45 minutes
    const endLocal = new Date(startLocal.getTime() + 45 * 60000);

    // Convert to UTC before saving
    const startUTC = dateFnsTz.fromZonedTime(startLocal, tutorTz);
    const endUTC = dateFnsTz.fromZonedTime(endLocal, tutorTz);

    const newClass = new Class({
      title: `Free Trial: ${hobby?.name} for ${pname}`,
      description: `Student: ${pname} (Age: ${age})\nParent: ${name}\nPhone: ${phone}\nEmail: ${email}\nNotes: ${notes}\nSociety: ${society?.name}`,
      startTime: startUTC,
      endTime: endUTC,
      instructor: tutorId,
      classType: 'trial',
      status: 'scheduled'
    });

    const savedClass = await newClass.save();

    // Update tutor's classes
    await User.findByIdAndUpdate(tutorId, {
      $addToSet: { classes: savedClass._id }
    });

    return NextResponse.json({ success: true, message: "Trial booked successfully" }, { status: 201 });

  } catch (error: any) {
    console.error("Error booking trial:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
