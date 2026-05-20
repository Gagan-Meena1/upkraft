import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Registration from "@/models/Registration";
import User from "@/models/userModel";
import Class from "@/models/Class";

// GET — fetch full registration details (used when Edit is clicked on a slot)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const { id } = await params;
    const reg = await Registration.findById(id).lean();
    if (!reg) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 });
    }
    const r: any = reg;
    return NextResponse.json({
      success: true,
      data: {
        _id: r._id.toString(),
        name: r.name || "",
        participantName: r.participantName || "",
        contactNumber: r.contactNumber || "",
        countryCode: r.countryCode || "+91",
        email: r.email || "",
        age: r.age || null,
        instrument: r.instrument || "",
        city: r.city || "",
        societyName: r.societyName || "",
        notes: r.notes || "",
        address: r.address || "",
        demoDate: r.demoDate || null,
        demoTime: r.demoTime || null,
        paymentAmount: r.payment?.amount || 0,
        paymentStatus: r.payment?.status || "Pending",
        classId: r.classId?.toString() || null,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching registration:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const { id } = await params;

    // Find the registration first
    const reg = await Registration.findById(id);
    if (!reg) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 });
    }

    // If registration has a linked class, delete it
    if (reg.classId) {
      await Class.findByIdAndDelete(reg.classId);
    }

    // Remove registration + class from tutor's arrays (but keep the registration document)
    if (reg.tutorName) {
      const pullUpdate: any = { registrations: reg._id };
      if (reg.classId) pullUpdate.classes = reg.classId;
      await User.findByIdAndUpdate(reg.tutorName, { $pull: pullUpdate });
    }

    // Clear the classId on the registration since the class is deleted
    await Registration.findByIdAndUpdate(id, { $set: { classId: null } });

    return NextResponse.json({ success: true, message: "Registration removed from tutor. Slot is now open." }, { status: 200 });

  } catch (error: any) {
    console.error("Error removing registration from tutor:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
