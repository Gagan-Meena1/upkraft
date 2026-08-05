import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export type SessionUser = {
    id: string;
    username?: string;
    email?: string;
    category?: string;
};

/** Matches the normalisation used by the middleware and the post-login router. */
export const normaliseRole = (category: unknown) =>
    typeof category === "string" ? category.replace(/\s+/g, "").toLowerCase() : "";

/**
 * Verifies the caller's session and returns the decoded payload, or null when
 * there is no usable token. Unlike getDataFromToken this returns the whole
 * payload (so the role is available) and never throws.
 *
 * Token precedence matches getDataFromToken: impersonation cookie in tutor
 * context, then the session cookie, then a Bearer header for the mobile app.
 */
export function getSession(request: NextRequest): SessionUser | null {
    try {
        const referer = request.headers.get("referer") || "";
        let refererPath = "";
        try { if (referer) refererPath = new URL(referer).pathname; } catch (e) { }
        const isTutorContext =
            refererPath.startsWith("/tutor") || request.nextUrl?.pathname?.startsWith("/Api/tutor");

        const impersonateToken = request.cookies.get("impersonate_token")?.value;
        const mainToken = request.cookies.get("token")?.value;
        const authHeader = request.headers.get("authorization") || "";
        const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

        const token = (isTutorContext && impersonateToken)
            ? impersonateToken
            : (mainToken || bearerToken || "");

        if (!token) return null;

        return jwt.verify(token, process.env.TOKEN_SECRET!) as SessionUser;
    } catch {
        return null;
    }
}

/**
 * Guard for route handlers. Returns `{ user }` when the caller is allowed, or
 * `{ response }` — an early 401/403 — when they are not.
 *
 * Pass `roles` to restrict to specific categories; omit it to require only that
 * the caller is signed in.
 *
 *   const guard = requireRole(request, ["admin"]);
 *   if (guard.response) return guard.response;
 */
export function requireRole(
    request: NextRequest,
    roles?: string[]
): { user: SessionUser; response?: never } | { user?: never; response: NextResponse } {
    const user = getSession(request);

    if (!user) {
        return { response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
    }

    if (roles && !roles.includes(normaliseRole(user.category))) {
        return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return { user };
}
