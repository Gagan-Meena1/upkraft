import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { log } from "console";
import jwt from "jsonwebtoken";
import courseName from "@/models/courseName";
import User from "@/models/userModel";
import * as dateFnsTz from 'date-fns-tz';
import { format, parseISO } from 'date-fns';
import mongoose from "mongoose";

await connect();

export async function POST(request: NextRequest) {
  try {
    console.log(
      "1111111111111111111111111111111111111111111111111111111111111111111"
    );
        console.log("date-fns-tz exports:", Object.keys(dateFnsTz));


    const referer = request.headers.get("referer");

    console.log("Full Referer:", referer);

    let courseId = null;
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        courseId = refererUrl.searchParams.get("courseId");

        console.log("Extracted CourseId:", courseId);
      } catch (error) {
        console.error("Error parsing Referer URL:", error);
      }
    }


     const uploadDir = path.join(process.cwd(), "public/uploads");

     if (!existsSync(uploadDir)) {
       await mkdir(uploadDir, { recursive: true });
     }

     const formData = await request.formData();

     const title = formData.get("title") as string;
     const description = formData.get("description") as string;
     const date = formData.get("date") as string;
     const startTime = formData.get("startTime") as string;
     const endTime = formData.get("endTime") as string;
     const timezone = formData.get("timezone") as string; // Get timezone from frontend
     const recurrenceId = formData.get('recurrenceId') as string | null;
     const recurrenceType = formData.get('recurrenceType') as string | null;
     const recurrenceUntil = formData.get("recurrenceUntil") as string | null;

    if (!courseId) {
      const url = new URL(request.url);
      const courseIdFromQuery = url.searchParams.get("courseId");
      const courseFromForm = (formData.get("course") as string) || (formData.get("courseId") as string);
      courseId = courseFromForm || courseIdFromQuery || null;
    }

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

     console.log("Received data:", {
       title,
       description,
       date,
       startTime,
       endTime,
       timezone,
     });
 
    // Convert time from user's timezone to UTC for storage
    // Parse the date and time components
    // const [year, month, day] = date.split("-").map(Number);
    // const [startHour, startMinute] = startTime.split(":").map(Number);
    // const [endHour, endMinute] = endTime.split(":").map(Number);

    // Function to convert a time in user's timezone to UTC
    // This properly handles the conversion by calculating the timezone offset
    // const convertToUTC = (y: number, m: number, d: number, h: number, min: number, tz: string): Date => {
    //   if (!tz || tz === "UTC") {
    //     // If no timezone or UTC, treat as UTC
    //     return new Date(Date.UTC(y, m - 1, d, h, min, 0));
    //   }

    //   // Calculate the offset by comparing what a known UTC time shows in the timezone
    //   // Use a known UTC time (midnight UTC on the target date)
    //   const formatter = new Intl.DateTimeFormat("en-US", {
    //     timeZone: tz,
    //     year: "numeric",
    //     month: "2-digit",
    //     day: "2-digit",
    //     hour: "2-digit",
    //     minute: "2-digit",
    //     hour12: false,
    //   });
      
    //   const knownUTC = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    //   const knownParts = formatter.formatToParts(knownUTC);
    //   const knownTzHour = parseInt(knownParts.find(p => p.type === "hour")?.value || "0");
    //   const knownTzMin = parseInt(knownParts.find(p => p.type === "minute")?.value || "0");
      
    //   // If midnight UTC shows as X:Y in timezone, then the offset is X:Y hours
    //   // For IST (UTC+5:30), midnight UTC = 5:30 AM IST, so offset = +5:30
    //   // To convert local to UTC: UTC = Local - Offset
    //   // So: UTC = 18:30 - 5:30 = 13:00 (1 PM)
      
    //   const offsetHours = knownTzHour;
    //   const offsetMinutes = knownTzMin;
    //   const totalOffsetMinutes = offsetHours * 60 + offsetMinutes;
      
    //   // Convert desired local time to UTC
    //   // UTC = Local - Offset
    //   const desiredTotalMinutes = h * 60 + min;
    //   const utcTotalMinutes = desiredTotalMinutes - totalOffsetMinutes;
      
    //   // Handle date rollover
    //   let utcHours = Math.floor(utcTotalMinutes / 60);
    //   let utcMins = utcTotalMinutes % 60;
    //   let utcYear = y;
    //   let utcMonth = m - 1; // 0-indexed
    //   let utcDay = d;
      
    //   // Handle negative minutes (borrow from hours)
    //   if (utcMins < 0) {
    //     utcMins += 60;
    //     utcHours--;
    //   }
      
    //   // Handle negative hours (previous day)
    //   if (utcHours < 0) {
    //     utcHours += 24;
    //     utcDay--;
    //     if (utcDay < 1) {
    //       utcMonth--;
    //       if (utcMonth < 0) {
    //         utcMonth = 11;
    //         utcYear--;
    //       }
    //       utcDay = new Date(utcYear, utcMonth + 1, 0).getDate();
    //     }
    //   }
      
    //   // Handle hours >= 24 (next day)
    //   if (utcHours >= 24) {
    //     utcHours -= 24;
    //     utcDay++;
    //     const daysInMonth = new Date(utcYear, utcMonth + 1, 0).getDate();
    //     if (utcDay > daysInMonth) {
    //       utcDay = 1;
    //       utcMonth++;
    //       if (utcMonth > 11) {
    //         utcMonth = 0;
    //         utcYear++;
    //       }
    //     }
    //   }
      
    //   return new Date(Date.UTC(utcYear, utcMonth, utcDay, utcHours, utcMins, 0));
    // };

// NEW: Simple timezone conversion using date-fns-tz
const convertToUTC = (dateStr: string, timeStr: string, timezone: string): Date => {
  const dateTimeStr = `${dateStr} ${timeStr}`;
  return dateFnsTz.fromZonedTime(dateTimeStr, timezone);
};
   const startDateTime = convertToUTC(date, startTime, timezone || "UTC");
const endDateTime = convertToUTC(date, endTime, timezone || "UTC");

    // Verify the conversion by formatting back
    // const verifyStart = new Intl.DateTimeFormat("en-US", {
    //   timeZone: timezone || "UTC",
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: false,
    // }).format(startDateTime);
    
    // const verifyEnd = new Intl.DateTimeFormat("en-US", {
    //   timeZone: timezone || "UTC",
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: false,
    // }).format(endDateTime);
// AFTER conversion, verify by converting back to user's timezone
console.log("Timezone conversion:", {
  input: `${date} ${startTime}-${endTime} in ${timezone}`,
  storedUTC_Start: startDateTime.toISOString(),
  storedUTC_End: endDateTime.toISOString(),
  verifyStart: format(dateFnsTz.toZonedTime(startDateTime, timezone || "UTC"), 'HH:mm'),
  verifyEnd: format(dateFnsTz.toZonedTime(endDateTime, timezone || "UTC"), 'HH:mm')
});
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    // Handle video upload
    let videoPath = null;
    const videoFile = formData.get("video") as File | null;

    if (videoFile && videoFile.size > 0) {
      const originalFilename = videoFile.name;
      const newFilename = `${Date.now()}-${originalFilename}`;
      const newPath = path.join(uploadDir, newFilename);

      // Convert file to ArrayBuffer, then Buffer
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write file to disk
      await writeFile(newPath, buffer);

      // Store the relative path in the database
      videoPath = `/uploads/${newFilename}`;
    }

    // Create a new Class document
    console.log("222222222222222222222222222222222222222222222222222");

    const newClass = new Class({
      title,
      description,
      course: courseId,
      startTime: startDateTime,
      endTime: endDateTime,
      instructor: instructorId,
      recording: videoPath,
      recordingProcessed: videoPath ? 0 : null,
      recurrenceId,
      recurrenceType,
      recurrenceUntil
    });

    const savednewClass = await newClass.save();
    console.log("333333333333333333333333333333333333333333333333333333333333");
    console.log("Saved class:", savednewClass);

    const course = await courseName.findById(courseId);
    await courseName.findByIdAndUpdate(courseId, {
      $addToSet: { class: savednewClass._id },
    });

    // Attach to all students enrolled in this course (support both 'courses' and 'course' fields)
    await User.updateMany(
      { $or: [{ courses: courseId }, { course: courseId }] },
      { $addToSet: { classes: savednewClass._id } }
    );

    // Ensure the instructor also sees it in their calendar
    if (instructorId) {
      await User.findByIdAndUpdate(instructorId, {
        $addToSet: { classes: savednewClass._id },
      });
    }

    console.log(newClass);

    return NextResponse.json(
      {
        message: "Session created successfully",
        classData: newClass,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    console.log("Fetching classes data...");

    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    let instructorId =
      decodedToken &&
      typeof decodedToken === "object" &&
      "id" in decodedToken
        ? decodedToken.id
        : null;

    const { searchParams } = new URL(request.url);
    const userIdFromQuery = searchParams.get("userid");

    console.log("decodedToken : ", decodedToken);
    console.log("instructorId : ", instructorId);
    console.log("userIdFromQuery : ", userIdFromQuery);

    if (!instructorId) {
      return NextResponse.json(
        { message: "User ID not found", error: "No user ID provided" },
        { status: 400 }
      );
    }

    // NEW LOGIC: Find common classes between instructor and queried user
    if (userIdFromQuery) {
      // Fetch both users
      const [instructor, queriedUser] = await Promise.all([
        User.findById(instructorId).populate({
          path: "classes",
          model: "Class",
        }),
        User.findById(userIdFromQuery).populate({
          path: "classes",
          model: "Class",
        }),
      ]);

      if (!instructor) {
        return NextResponse.json(
          { message: "Instructor not found" },
          { status: 404 }
        );
      }

      if (!queriedUser) {
        return NextResponse.json(
          { message: "Queried user not found" },
          { status: 404 }
        );
      }

      // Find common class IDs
      const instructorClassIds = new Set(
        instructor.classes.map((c: any) => c._id.toString())
      );
      
      const commonClasses = queriedUser.classes.filter((c: any) =>
        instructorClassIds.has(c._id.toString())
      );

      console.log("Found common classes:", commonClasses.length);

      return NextResponse.json(
        {
          message: "Common classes fetched successfully",
          classData: commonClasses,
          totalClasses: commonClasses.length,
        },
        { status: 200 }
      );
    }

    // EXISTING LOGIC: If no userIdFromQuery, return all instructor's classes
    const user = await User.findById(instructorId).populate({
      path: "classes",
      model: "Class",
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const classData = user.classes || [];
    console.log("Found classes:", classData.length);

    return NextResponse.json(
      {
        message: "Classes fetched successfully",
        classData: classData,
        totalClasses: classData.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("Updating class...");

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const editType = (searchParams.get("editType") || "single").toLowerCase(); // single | all

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    if (!instructorId) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, date, startTime, endTime, timezone } = body;

    console.log("RECEIVED:", { title, description, date, startTime, endTime, timezone });

    if (!title?.trim() || !description?.trim() || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Title, description, startTime, endTime are required" },
        { status: 400 }
      );
    }

    if (endTime <= startTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Use date-fns-tz for consistent conversion (same as POST)
    const tz = timezone || "UTC";
    const convertToUTC = (dateStr: string, timeStr: string, tzLocal: string): Date => {
      const dateTimeStr = `${dateStr} ${timeStr}`;
      return dateFnsTz.fromZonedTime(dateTimeStr, tzLocal);
    };

    // SINGLE event update (uses the date provided by form)
    if (editType === "single") {
      if (!date) {
        return NextResponse.json({ error: "Date is required for single edit" }, { status: 400 });
      }
      const startDateTime = convertToUTC(date, startTime, tz);
      const endDateTime = convertToUTC(date, endTime, tz);

      console.log("STORING SINGLE IN UTC:", {
        inputTime: `${startTime} - ${endTime}`,
        storedStartUTC: startDateTime.toISOString(),
        storedEndUTC: endDateTime.toISOString(),
      });

      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        {
          title,
          description,
          startTime: startDateTime,
          endTime: endDateTime,
        },
        { new: true, runValidators: true }
      );

      return NextResponse.json(
        { message: "Class updated successfully", classData: updatedClass, editType: "single" },
        { status: 200 }
      );
    }

    // BULK series update (edit all occurrences with same recurrenceId)
    if (!existingClass.recurrenceId) {
      return NextResponse.json(
        { error: "This event is not part of a series (no recurrenceId)" },
        { status: 400 }
      );
    }

    const recurrenceId = existingClass.recurrenceId;
    const docs = await Class.find({ recurrenceId });
    if (docs.length === 0) {
      return NextResponse.json({ error: "No classes found for this series" }, { status: 404 });
    }

    // For each doc, preserve its local date (in tz) and apply new times/title/description
    const ops = docs.map((doc) => {
      const dateStrForDoc = format(dateFnsTz.toZonedTime(doc.startTime, tz), "yyyy-MM-dd");
      const newStart = convertToUTC(dateStrForDoc, startTime, tz);
      const newEnd = convertToUTC(dateStrForDoc, endTime, tz);
      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              title,
              description,
              startTime: newStart,
              endTime: newEnd,
            },
          },
        },
      };
    });

    const result = await Class.bulkWrite(ops);
    const modified = (result.modifiedCount ?? 0) || Object.values(result).reduce((a: number, b: any) => a + (b?.nModified || 0), 0);

    return NextResponse.json(
      {
        message: "Series updated successfully",
        editType: "all",
        recurrenceId,
        updatedCount: modified,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete existing class
export async function DELETE(request: NextRequest) {
  try {
    console.log("Deleting class...");

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const deleteType = (searchParams.get("deleteType") || "single").toLowerCase(); // single | all

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    if (!instructorId) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // If deleteType === all and the class has a recurrenceId, bulk delete all occurrences
    if (deleteType === "all" && existingClass.recurrenceId) {
      const recurrenceId = existingClass.recurrenceId;
      console.log("Bulk deleting recurrenceId:", recurrenceId);

      // Fetch all classes in this recurrence group
      const classesToDelete = await Class.find({ recurrenceId });
      const classIds = classesToDelete.map(c => c._id);

      // Remove references from course documents
      await courseName.updateMany(
        { class: { $in: classIds } },
        { $pull: { class: { $in: classIds } } }
      );

      // Remove references from all users
      await User.updateMany(
        { classes: { $in: classIds } },
        { $pull: { classes: { $in: classIds } } }
      );

      // Delete classes
      const deleteResult = await Class.deleteMany({ _id: { $in: classIds } });

      return NextResponse.json(
        {
          message: "All recurring events deleted",
          deletedCount: deleteResult.deletedCount,
          recurrenceId,
          classIds,
        },
        { status: 200 }
      );
    }

    // SINGLE delete fallback
    console.log("Deleting single class:", classId);

    if (existingClass.course) {
      await courseName.findByIdAndUpdate(existingClass.course, {
        $pull: { class: existingClass._id },
      });
    }

    await User.updateMany(
      { classes: existingClass._id },
      { $pull: { classes: existingClass._id } }
    );

    await Class.findByIdAndDelete(existingClass._id);

    return NextResponse.json(
      { message: "Class deleted successfully", deletedClassId: existingClass._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error while deleting class:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Recurrence model: stores recurrence group metadata.
 * Each recurring batch (daily / weekly /weekdays) can be assigned a recurrenceId
 * which is saved on each Class document in the batch.
 */
const RecurrenceSchema = new mongoose.Schema({
  recurrenceId: { type: String, required: true, unique: true },
  type: { type: String, enum: ["daily", "weekly", "weekdays"], required: true },
  owner: { // user who created the recurrence (tutor)
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: false,
  },
  meta: { type: Object, default: {} }, // optional metadata (repeatCount, until, etc)
  createdAt: { type: Date, default: Date.now },
});

const Recurrence = mongoose.models.Recurrence || mongoose.model("Recurrence", RecurrenceSchema);
export default Recurrence;