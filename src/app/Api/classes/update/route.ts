import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";

// Connect to database
connect();

export async function POST(req: NextRequest) {
  try {
    // 1. Get the classId and optional fields from the request body
    const { classId, recordingUrl, groupPhotoUrl } = await req.json();
    console.log(`INFO: Request to update class [${classId}]`, { recordingUrl, groupPhotoUrl });

    // 2. Validate the input
    if (!classId || (!recordingUrl && !groupPhotoUrl)) {
      console.error("ERROR: Missing classId or update fields in request.");
      return NextResponse.json(
        { error: "Class ID and at least one update field are required" },
        { status: 400 }
      );
    }

    // 3. Build update payload dynamically
    const updateFields: Record<string, string> = {};
    if (recordingUrl) updateFields.recordingUrl = recordingUrl;
    if (groupPhotoUrl) updateFields.groupPhotoUrl = groupPhotoUrl;

    // 4. Find the class by its ID and update the relevant fields
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      updateFields,
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