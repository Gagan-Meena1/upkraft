import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";

// Connect to database
connect();

export async function POST(req: NextRequest) {
  try {
    // 1. Get the classId and recordingUrl from the request body
    const { classId, recordingUrl } = await req.json();
    console.log(`INFO: Request to update class [${classId}] with URL: ${recordingUrl}`);

    // 2. Validate the input
    if (!classId || !recordingUrl) {
      console.error("ERROR: Missing classId or recordingUrl in update request.");
      return NextResponse.json(
        { error: "Class ID and recording URL are required" },
        { status: 400 }
      );
    }

    // 3. Find the class by its ID and update the 'recordingUrl' field
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        recordingUrl: recordingUrl, // Storing the public S3 URL
      },
      { new: true } // This option returns the document after the update
    );

    // 4. Check if the class was found and updated
    if (!updatedClass) {
      console.error(`ERROR: Class with ID [${classId}] not found for update.`);
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    console.log(`SUCCESS: Class [${classId}] updated successfully.`, { data: updatedClass });
    // 5. Return a success response
    return NextResponse.json({
      message: "Class updated successfully",
      success: true,
      data: updatedClass,
    });

  } catch (error: any) {
    console.error(`ERROR: Failed to update class. Details: ${error.message}`);
    return NextResponse.json({ error: "Internal server error while updating class." }, { status: 500 });
  }
}