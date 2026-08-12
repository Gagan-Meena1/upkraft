import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/helper/requireRole";
import { normaliseRole, roleDashboardLabel, roleHomePath } from "@/helper/roleHome";

/**
 * Cheap "am I signed in, and where do I belong?" check for public pages.
 *
 * The landing header calls this to decide between Login / Sign Up and a link
 * straight to the visitor's own dashboard. It only reads the JWT — no database
 * round trip — and answers 200 either way so a signed-out visitor doesn't get a
 * console full of 401s on the marketing page.
 *
 * A role we don't route (or a missing category) is reported as unauthenticated:
 * there is no dashboard to offer, so the header should fall back to Login.
 */
export async function GET(request: NextRequest) {
    const user = getSession(request);
    const home = user ? roleHomePath(user.category) : null;

    const body = home
        ? {
            authenticated: true,
            role: normaliseRole(user!.category),
            home,
            dashboardLabel: roleDashboardLabel(user!.category),
            username: user!.username ?? null,
        }
        : { authenticated: false };

    return NextResponse.json(body, {
        headers: { "Cache-Control": "no-store, max-age=0" },
    });
}

// The answer depends on a cookie, so it must never be statically cached.
export const dynamic = "force-dynamic";
