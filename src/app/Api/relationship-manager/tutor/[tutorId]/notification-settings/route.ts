/**
 * The tutor's auto-notification timing, owned by their Relationship Manager.
 *
 * Two independent values:
 *
 *   classStartReminderMinutes — how far before a class starts the mobile app
 *     fires the "class starting soon" reminder.
 *   classEndReminderMinutes   — how far before a class ends it fires the
 *     "wrap up and write feedback" reminder.
 *
 * They are separate settings on purpose. One is about being ready to teach and
 * the other about closing the session out, so the lead time that suits a tutor
 * for one is rarely the one that suits them for the other, and their ranges
 * differ accordingly. PATCH therefore takes either key on its own — sending
 * one must never silently rewrite the other.
 *
 * The tutor cannot set either themselves — they are coaching levers the RM
 * holds — so they live behind this endpoint rather than /Api/tutor/updateInfo.
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
 * The start reminder gets its own ceiling. An hour is plenty of notice to stop
 * teaching and write feedback, but not to get across a city to the next
 * student — so this one runs to two hours.
 */
export const MIN_START_REMINDER_MINUTES = 1;
export const MAX_START_REMINDER_MINUTES = 120;
export const DEFAULT_START_REMINDER_MINUTES = 30;

/**
 * One field's worth of validation, so PATCH reads the same for both and the
 * error names the key the RM actually sent.
 *
 * Returns the rounded minutes, or a message explaining the range. Checked here
 * rather than left to the schema's min/max because a rejected save should tell
 * the RM what is allowed, not surface a Mongoose ValidationError string.
 */
function parseReminderMinutes(
  raw: unknown,
  field: string,
  min: number,
  max: number,
  relativeTo: string
): { minutes: number } | { error: string } {
  const minutes = Number(raw);
  if (!Number.isFinite(minutes) || !Number.isInteger(minutes)) {
    return { error: `${field} must be a whole number of minutes` };
  }
  if (minutes < min || minutes > max) {
    return {
      error: `Reminder must be between ${min} and ${max} minutes before the class ${relativeTo}`,
    };
  }
  return { minutes };
}

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
    .select("_id username category relationshipManager classEndReminderMinutes classStartReminderMinutes")
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
        // Tutors created before these fields existed have no value stored, so
        // the defaults stand in rather than the UI showing empty boxes.
        classStartReminderMinutes:
          auth.tutor.classStartReminderMinutes ?? DEFAULT_START_REMINDER_MINUTES,
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

    // Each key is optional and handled on its own. The RM page saves one
    // dropdown at a time, and a PATCH that always wrote both would let a stale
    // copy of the other value overwrite a change made from a second tab.
    const $set: Record<string, number> = {};
    const messages: string[] = [];

    if (body?.classStartReminderMinutes !== undefined) {
      const parsed = parseReminderMinutes(
        body.classStartReminderMinutes,
        "classStartReminderMinutes",
        MIN_START_REMINDER_MINUTES,
        MAX_START_REMINDER_MINUTES,
        "starts"
      );
      if ("error" in parsed) {
        return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
      }
      $set.classStartReminderMinutes = parsed.minutes;
      messages.push(
        `Class starting reminder now fires ${parsed.minutes} minute${parsed.minutes === 1 ? "" : "s"} before each class starts`
      );
    }

    if (body?.classEndReminderMinutes !== undefined) {
      const parsed = parseReminderMinutes(
        body.classEndReminderMinutes,
        "classEndReminderMinutes",
        MIN_REMINDER_MINUTES,
        MAX_REMINDER_MINUTES,
        "ends"
      );
      if ("error" in parsed) {
        return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
      }
      $set.classEndReminderMinutes = parsed.minutes;
      messages.push(
        `Feedback reminder now fires ${parsed.minutes} minute${parsed.minutes === 1 ? "" : "s"} before each class ends`
      );
    }

    if (Object.keys($set).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Send classStartReminderMinutes, classEndReminderMinutes, or both",
        },
        { status: 400 }
      );
    }

    const updated = (await User.findByIdAndUpdate(
      tutorId,
      { $set },
      { new: true, runValidators: true }
    )
      .select("_id username classEndReminderMinutes classStartReminderMinutes")
      .lean()) as any;

    console.log(
      `[RM/notification-settings] RM ${auth.rmId} updated tutor ${tutorId}: ${JSON.stringify($set)}`
    );

    return NextResponse.json({
      success: true,
      message: messages.join(". "),
      // Both values come back whether or not this call changed them, so the
      // client can reconcile its whole form against the server rather than
      // trusting what it just sent.
      settings: {
        classStartReminderMinutes:
          updated?.classStartReminderMinutes ?? $set.classStartReminderMinutes ??
          auth.tutor.classStartReminderMinutes ?? DEFAULT_START_REMINDER_MINUTES,
        classEndReminderMinutes:
          updated?.classEndReminderMinutes ?? $set.classEndReminderMinutes ??
          auth.tutor.classEndReminderMinutes ?? DEFAULT_REMINDER_MINUTES,
      },
    });
  } catch (error: any) {
    console.error("[RM/notification-settings] PATCH failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save notification settings" },
      { status: 500 }
    );
  }
}
