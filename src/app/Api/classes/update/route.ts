import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";

// Connect to database
connect();

export async function POST(req: NextRequest) {
  try {
    // 1. Get the classId and googleMeetUrl from the request body
    const { classId, googleMeetUrl } = await req.json();
    console.log(`INFO: Request to update class [${classId}] with Google Meet URL: ${googleMeetUrl}`);

    // 2. Validate the input
    if (!classId || !googleMeetUrl) {
      return NextResponse.json(
        { error: "Class ID and Google Meet URL are required" },
        { status: 400 }
      );
    }

    // 3. Find the class by its ID and update the 'googleMeetUrl' field
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        googleMeetUrl: googleMeetUrl,
      },
      { new: true }
    );

    // 4. Check if the class was found and updated
    if (!updatedClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, class: updatedClass },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating class with Google Meet URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}