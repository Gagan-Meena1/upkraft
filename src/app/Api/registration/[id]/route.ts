import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Registration from "@/models/Registration";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    const { id } = params;
    const body = await request.json();
    
    const updateData: any = {};
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.payment !== undefined) {
      updateData.payment = body.payment;
    }

    const updatedReg = await Registration.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedReg) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedReg }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating registration:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
