/**
 * The tutor's auto-notification timing, owned by their Relationship Manager.
 *
 * Today that is one value: `classEndReminderMinutes`, how far before a class
 * ends the mobile app fires the "wrap up and write feedback" reminder. The
 * tutor cannot set it themselves — it is a coaching lever the RM holds — so it
 * lives behind this endpoint rather than /Api/tutor/updateInfo.
 *
 * The mobile client reads the saved value off the tutor's own user record via
 * /Api/users/me and schedules against it (lib/notifications.ts).
 */
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

/** Kept in step with the schema bounds and the mobile client's own clamp. */
export const MIN_REMINDER_MINUTES = 1;
export const MAX_REMINDER_MINUTES = 60;
export const DEFAULT_REMINDER_MINUTES = 5;

/**
 * Resolves the caller to an RM who actually manages `tutorId`.
 * Returns a ready-to-send error response instead of throwing, so both handlers
 * below read as a straight line.
 */
async function authorizeRmForTutor(request: NextRequest, tutorId: string) {
  const token = (() => {
    const referer = request.headers.get("referer") || "";
    let refererPath = "";
    try { if (referer) refererPath = new URL(referer).pathname; } catch (e) { }
    const isTutorContext =
      refererPath.startsWith("/tutor") ||
      (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
    return (isTutorContext && request.cookies.get("impersonate_token")?.value)
      ? request.cookies.get("impersonate_token")?.value
      : request.cookies.get("token")?.value;
  })();

  if (!token) {
    return { error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }

  const decoded = jwt.decode(token);
  const rmId =
    decoded && typeof decoded === "object" && "id" in decoded
      ? (decoded as { id: string }).id
      : null;

  if (!rmId) {
    return { error: NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 }) };
  }

  const rmUser = (await User.findById(rmId).select("category")) as any;
  if (
    !rmUser ||
    !["RelationshipManager", "Relationship Manager"].includes(String(rmUser.category))
  ) {
    return {
      error: NextResponse.json(
        { success: false, error: "Only relationship managers can access this endpoint" },
        { status: 403 }
      ),
    };
  }

  if (!tutorId) {
    return { error: NextResponse.json({ success: false, error: "Tutor ID is required" }, { status: 400 }) };
  }

  const tutor = (await User.findById(tutorId)
    .select("_id username category relationshipManager classEndReminderMinutes")
    .lean()) as any;

  if (!tutor) {
    return { error: NextResponse.json({ success: false, error: "Tutor not found" }, { status: 404 }) };
  }

  const tutorRmId =
    tutor.relationshipManager == null
      ? ""
      : typeof tutor.relationshipManager === "object" && tutor.relationshipManager !== null && "_id" in tutor.relationshipManager
        ? String((tutor.relationshipManager as any)._id)
        : String(tutor.relationshipManager);

  // An RM may only touch their own tutors — otherwise any RM could retime
  // every tutor in the business.
  if (tutorRmId !== rmId) {
    return {
      error: NextResponse.json(
        { success: false, error: "This tutor is not assigned to you" },
        { status: 403 }
      ),
    };
  }

  return { rmId, tutor };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tutorId: string }> }
) {
  try {
    await connect();
    const { tutorId } = await params;

    const auth = await authorizeRmForTutor(request, tutorId);
    if ("error" in auth) return auth.error;

    return NextResponse.json({
      success: true,
      settings: {
        // Tutors created before this field existed have no value stored, so the
        // default stands in rather than the UI showing an empty box.
        classEndReminderMinutes:
          auth.tutor.classEndReminderMinutes ?? DEFAULT_REMINDER_MINUTES,
      },
    });
  } catch (error: any) {
    console.error("[RM/notification-settings] GET failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load notification settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tutorId: string }> }
) {
  try {
    await connect();
    const { tutorId } = await params;

    const auth = await authorizeRmForTutor(request, tutorId);
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const raw = body?.classEndReminderMinutes;

    // Validated here rather than leaning on the schema's min/max: a rejected
    // save should tell the RM what the allowed range is, not surface a
    // Mongoose ValidationError string.
    const minutes = Number(raw);
    if (!Number.isFinite(minutes) || !Number.isInteger(minutes)) {
      return NextResponse.json(
        { success: false, error: "classEndReminderMinutes must be a whole number of minutes" },
        { status: 400 }
      );
    }
    if (minutes < MIN_REMINDER_MINUTES || minutes > MAX_REMINDER_MINUTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Reminder must be between ${MIN_REMINDER_MINUTES} and ${MAX_REMINDER_MINUTES} minutes before the class ends`,
        },
        { status: 400 }
      );
    }

    const updated = (await User.findByIdAndUpdate(
      tutorId,
      { $set: { classEndReminderMinutes: minutes } },
      { new: true, runValidators: true }
    )
      .select("_id username classEndReminderMinutes")
      .lean()) as any;

    console.log(
      `[RM/notification-settings] RM ${auth.rmId} set tutor ${tutorId} end-reminder to ${minutes}m`
    );

    return NextResponse.json({
      success: true,
      message: `Feedback reminder now fires ${minutes} minute${minutes === 1 ? "" : "s"} before each class ends`,
      settings: { classEndReminderMinutes: updated?.classEndReminderMinutes ?? minutes },
    });
  } catch (error: any) {
    console.error("[RM/notification-settings] PATCH failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save notification settings" },
      { status: 500 }
    );
  }
}
