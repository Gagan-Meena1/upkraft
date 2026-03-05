import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import courseName from "@/models/courseName";
import User from "@/models/userModel";
import * as dateFnsTz from "date-fns-tz";
import { format } from "date-fns";
import mongoose from "mongoose";

await connect();

// ─── Shared helpers ─────────────────────────────────────────────────────────

/** Extract the authenticated user ID from cookies (handles tutor impersonation). */
function getTokenUserId(request: NextRequest): string | null {
  const referer = request.headers.get("referer") || "";
  let refererPath = "";
  try {
    if (referer) refererPath = new URL(referer).pathname;
  } catch {
    /* ignore malformed referer */
  }
  const isTutorContext =
    refererPath.startsWith("/tutor") ||
    request.nextUrl?.pathname?.startsWith("/Api/tutor");

  const token =
    isTutorContext && request.cookies.get("impersonate_token")?.value
      ? request.cookies.get("impersonate_token")!.value
      : request.cookies.get("token")?.value;

  if (!token) return null;
  const decoded = jwt.decode(token);
  return decoded && typeof decoded === "object" && "id" in decoded
    ? (decoded.id as string)
    : null;
}

/** Convert a local date+time string in a given timezone to a UTC Date. */
function convertToUTC(
  dateStr: string,
  timeStr: string,
  timezone: string
): Date {
  const dateTimeStr = `${dateStr} ${timeStr}`;
  return dateFnsTz.fromZonedTime(dateTimeStr, timezone);
}

// ─── POST — Create a new class ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const referer = request.headers.get("referer");

    let courseId: string | null = null;
    if (referer) {
      try {
        courseId = new URL(referer).searchParams.get("courseId");
      } catch {
        /* ignore */
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
    const timezone = (formData.get("timezone") as string) || "UTC";
    const recurrenceId = formData.get("recurrenceId") as string | null;
    const recurrenceType = formData.get("recurrenceType") as string | null;
    const recurrenceUntil = formData.get("recurrenceUntil") as string | null;
    const joinLink = formData.get("joinLink") as string | null;

    // Fallback courseId sources
    if (!courseId) {
      const url = new URL(request.url);
      const courseFromForm =
        (formData.get("course") as string) ||
        (formData.get("courseId") as string);
      courseId = courseFromForm || url.searchParams.get("courseId") || null;
    }

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const startDateTime = convertToUTC(date, startTime, timezone);
    const endDateTime = convertToUTC(date, endTime, timezone);

    const instructorId = getTokenUserId(request);

    // Handle video upload
    let videoPath: string | null = null;
    const videoFile = formData.get("video") as File | null;

    if (videoFile && videoFile.size > 0) {
      const newFilename = `${Date.now()}-${videoFile.name}`;
      const newPath = path.join(uploadDir, newFilename);
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      await writeFile(newPath, buffer);
      videoPath = `/uploads/${newFilename}`;
    }

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
      recurrenceUntil,
      joinLink: joinLink || null,
    });

    const savedClass = await newClass.save();

    // Update references in parallel
    await Promise.all([
      courseName.findByIdAndUpdate(courseId, {
        $addToSet: { class: savedClass._id },
      }),
      User.updateMany(
        { $or: [{ courses: courseId }, { course: courseId }] },
        { $addToSet: { classes: savedClass._id } }
      ),
      ...(instructorId
        ? [
            User.findByIdAndUpdate(instructorId, {
              $addToSet: { classes: savedClass._id },
            }),
          ]
        : []),
    ]);

    return NextResponse.json(
      { message: "Session created successfully", classData: savedClass },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /Api/calendar/classes error:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ─── GET — Fetch classes (supports bulk studentIds + date-range filtering) ──

export async function GET(request: NextRequest) {
  try {
    const instructorId = getTokenUserId(request);
    if (!instructorId) {
      return NextResponse.json(
        { message: "User ID not found", error: "No user ID provided" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userIdFromQuery = searchParams.get("userid");
    const startDate = searchParams.get("startDate"); // ISO string
    const endDate = searchParams.get("endDate"); // ISO string
    const studentIdsParam = searchParams.get("studentIds"); // comma-separated

    // ── Build a date-range filter for Class documents ──
    const dateFilter: Record<string, any> = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // ── BULK: multiple students in one request ──
    if (studentIdsParam) {
      const studentIds = studentIdsParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      // Fetch instructor + all queried students in parallel
      const [instructor, ...queriedUsers] = await Promise.all([
        User.findById(instructorId).select("classes").lean(),
        ...studentIds.map((sid) =>
          User.findById(sid).select("_id classes").lean()
        ),
      ]);

      if (!instructor) {
        return NextResponse.json(
          { message: "Instructor not found" },
          { status: 404 }
        );
      }

      const instructorClassIds = new Set(
        (instructor.classes || []).map((id: any) => id.toString())
      );

      // For each student, find common class IDs, then batch-query Class docs
      const allCommonIds: string[] = [];
      const studentClassIdMap: Record<string, string[]> = {};

      for (const student of queriedUsers) {
        if (!student) continue;
        const sid = student._id.toString();
        const commonIds = (student.classes || [])
          .map((id: any) => id.toString())
          .filter((id: string) => instructorClassIds.has(id));
        studentClassIdMap[sid] = commonIds;
        allCommonIds.push(...commonIds);
      }

      // Single DB query for all class documents with optional date filtering
      const uniqueIds = [...new Set(allCommonIds)];
      const classQuery: Record<string, any> = {
        _id: { $in: uniqueIds },
      };
      if (hasDateFilter) classQuery.startTime = dateFilter;

      const classDocs = await Class.find(classQuery).lean();
      const classMap = new Map(
        classDocs.map((doc: any) => [doc._id.toString(), doc])
      );

      // Assemble per-student results
      const results = Object.entries(studentClassIdMap).map(
        ([sid, classIds]) => ({
          studentId: sid,
          classes: classIds
            .map((id) => classMap.get(id))
            .filter(Boolean),
        })
      );

      return NextResponse.json(
        {
          message: "Bulk classes fetched successfully",
          data: results,
          totalStudents: results.length,
        },
        { status: 200 }
      );
    }

    // ── SINGLE student: find common classes between instructor and student ──
    if (userIdFromQuery) {
      const [instructor, queriedUser] = await Promise.all([
        User.findById(instructorId).select("classes").lean(),
        User.findById(userIdFromQuery).select("classes").lean(),
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

      const instructorClassIds = new Set(
        (instructor.classes || []).map((c: any) => c.toString())
      );
      const commonIds = (queriedUser.classes || [])
        .map((c: any) => c.toString())
        .filter((id: string) => instructorClassIds.has(id));

      const classQuery: Record<string, any> = {
        _id: { $in: commonIds },
      };
      if (hasDateFilter) classQuery.startTime = dateFilter;

      const commonClasses = await Class.find(classQuery).lean();

      return NextResponse.json(
        {
          message: "Common classes fetched successfully",
          classData: commonClasses,
          totalClasses: commonClasses.length,
        },
        { status: 200 }
      );
    }

    // ── DEFAULT: return all instructor's classes ──
    const classQuery: Record<string, any> = {};
    const user = await User.findById(instructorId).select("classes").lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    classQuery._id = { $in: user.classes || [] };
    if (hasDateFilter) classQuery.startTime = dateFilter;

    const classData = await Class.find(classQuery).lean();

    return NextResponse.json(
      {
        message: "Classes fetched successfully",
        classData,
        totalClasses: classData.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /Api/calendar/classes error:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ─── PUT — Update an existing class (single or bulk series) ─────────────────

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const editType = (searchParams.get("editType") || "single").toLowerCase();

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    const instructorId = getTokenUserId(request);
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
    const { title, description, date, startTime, endTime, timezone, joinLink } =
      body;

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

    const tz = timezone || "UTC";

    // ── SINGLE event update ──
    if (editType === "single") {
      if (!date) {
        return NextResponse.json(
          { error: "Date is required for single edit" },
          { status: 400 }
        );
      }
      const startDateTime = convertToUTC(date, startTime, tz);
      const endDateTime = convertToUTC(date, endTime, tz);

      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        {
          title,
          description,
          startTime: startDateTime,
          endTime: endDateTime,
          ...(joinLink !== undefined && { joinLink: joinLink || null }),
        },
        { new: true, runValidators: true }
      );

      return NextResponse.json(
        {
          message: "Class updated successfully",
          classData: updatedClass,
          editType: "single",
        },
        { status: 200 }
      );
    }

    // ── BULK series update (all occurrences with same recurrenceId) ──
    if (!existingClass.recurrenceId) {
      return NextResponse.json(
        { error: "This event is not part of a series (no recurrenceId)" },
        { status: 400 }
      );
    }

    const recurrenceId = existingClass.recurrenceId;
    const docs = await Class.find({ recurrenceId });
    if (docs.length === 0) {
      return NextResponse.json(
        { error: "No classes found for this series" },
        { status: 404 }
      );
    }

    // For each doc, preserve its local date and apply new times/title/description
    const ops = docs.map((doc) => {
      const dateStrForDoc = format(
        dateFnsTz.toZonedTime(doc.startTime, tz),
        "yyyy-MM-dd"
      );
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
              ...(joinLink !== undefined && { joinLink: joinLink || null }),
            },
          },
        },
      };
    });

    const result = await Class.bulkWrite(ops);
    const modified =
      result.modifiedCount ??
      Object.values(result).reduce(
        (a: number, b: any) => a + (b?.nModified || 0),
        0
      );

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
    console.error("PUT /Api/calendar/classes error:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ─── DELETE — Delete existing class (single or bulk series) ─────────────────

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const deleteType = (
      searchParams.get("deleteType") || "single"
    ).toLowerCase();

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    const instructorId = getTokenUserId(request);
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

    // ── BULK delete all in recurrence series ──
    if (deleteType === "all" && existingClass.recurrenceId) {
      const recurrenceId = existingClass.recurrenceId;
      const classesToDelete = await Class.find({ recurrenceId }).select("_id");
      const classIds = classesToDelete.map((c) => c._id);

      // Clean up references and delete in parallel
      await Promise.all([
        courseName.updateMany(
          { class: { $in: classIds } },
          { $pull: { class: { $in: classIds } } }
        ),
        User.updateMany(
          { classes: { $in: classIds } },
          { $pull: { classes: { $in: classIds } } }
        ),
      ]);

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

    // ── SINGLE delete ──
    await Promise.all([
      existingClass.course
        ? courseName.findByIdAndUpdate(existingClass.course, {
            $pull: { class: existingClass._id },
          })
        : Promise.resolve(),
      User.updateMany(
        { classes: existingClass._id },
        { $pull: { classes: existingClass._id } }
      ),
      Class.findByIdAndDelete(existingClass._id),
    ]);

    return NextResponse.json(
      {
        message: "Class deleted successfully",
        deletedClassId: existingClass._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /Api/calendar/classes error:", error);
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
 * Each recurring batch (daily / weekly / weekdays) can be assigned a recurrenceId
 * which is saved on each Class document in the batch.
 */
const RecurrenceSchema = new mongoose.Schema({
  recurrenceId: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["daily", "weekly", "weekdays"],
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: false,
  },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

// Keep model available but don't export as default (route files export HTTP handlers)
mongoose.models.Recurrence ||
  mongoose.model("Recurrence", RecurrenceSchema);
