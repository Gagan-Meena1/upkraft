import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import mongoose from "mongoose";
import Registration from "@/models/Registration";
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
  try {
    await connect();
    // Ensure User model is registered
    void User;

    const leads = await Registration.find({ userType: 'Student' })
      .sort({ createdAt: -1 })
      .lean();

    // Populate tutor details manually since some old records 
    // may store tutorName as a plain string (pre-schema-migration)
    const populatedLeads = await Promise.all(
      leads.map(async (lead: any) => {
        if (lead.tutorName) {
          try {
            const tutorId = typeof lead.tutorName === 'string' ? lead.tutorName : lead.tutorName.toString();
            if (mongoose.Types.ObjectId.isValid(tutorId)) {
              const tutor = await User.findById(tutorId).select('username email contact').lean();
              if (tutor) {
                return { ...lead, tutorName: tutor };
              }
            }
          } catch {
            // If lookup fails, leave tutorName as-is
          }
        }
        return lead;
      })
    );

    return NextResponse.json({ success: true, data: populatedLeads }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
