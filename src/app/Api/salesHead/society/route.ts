// src/app/Api/salesHead/society/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic"; // adjust to your db connect util
import Society from "@/models/society";   // adjust to your model path
import User from "@/models/userModel";

export async function GET() {
  try {
    await connect();
    const societies = await Society.find({})
      .populate({
        path: 'tutors',
        select: 'username email profileImage timezone demoSlotsAvailable skills experience aboutMyself classes instruments',
        populate: { path: 'classes', select: 'startTime endTime status classType' }
      })
      .sort({ isPopular: -1, name: 1 })
      .lean();

    const societyIds = societies.map(s => s._id);
    const tutorsWithDemoSlots = await User.find({
      category: "Tutor",
      "demoSlotsAvailable.societyIds": { $in: societyIds }
    })
      .select('username email profileImage timezone demoSlotsAvailable skills experience aboutMyself classes instruments')
      .populate('classes', 'startTime endTime status classType')
      .lean();

    societies.forEach(society => {
      if (!society.tutors) {
        society.tutors = [];
      }
      
      const socIdStr = society._id.toString();
      const existingTutorIds = new Set(society.tutors.map((t: any) => t._id.toString()));

      tutorsWithDemoSlots.forEach((tutor: any) => {
        const hasSlotForSoc = tutor.demoSlotsAvailable?.some((slot: any) => slot.societyIds?.some((sid: any) => sid.toString() === socIdStr));
        if (hasSlotForSoc && !existingTutorIds.has(tutor._id.toString())) {
          society.tutors.push(tutor);
          existingTutorIds.add(tutor._id.toString());
        }
      });
    });

    return NextResponse.json({ success: true, societies });
  } catch (error: any) {
    console.error("Error fetching societies:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch societies" },
      { status: 500 }
    );
  }
}