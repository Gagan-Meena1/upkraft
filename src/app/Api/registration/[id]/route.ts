import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Registration from "@/models/Registration";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const { id } = await params;
    const body = await request.json();
    
    // All editable registration fields
    const allowedFields = [
      'name', 'contactNumber', 'countryCode', 'email',
      'city', 'societyName', 'instrument',
      'participantName', 'age', 'notes',
      'status', 'payment',
      'demoDate', 'demoTime', 'address',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedReg = await Registration.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate({
      path: 'tutorName',
      select: 'username email contact'
    });

    if (!updatedReg) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedReg }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating registration:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
