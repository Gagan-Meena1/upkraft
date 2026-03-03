import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
// import { request } from "http";

export const getDataFromToken = (request: NextRequest) => {
    try {
        // Detect tutor context via referer or path (needed for impersonation check)
        const referer = request.headers.get("referer") || "";
        let refererPath = "";
        try { if (referer) refererPath = new URL(referer).pathname; } catch (e) { }
        const isTutorContext = refererPath.startsWith("/tutor") || request.nextUrl?.pathname?.startsWith("/Api/tutor");

        // Priority 1: impersonation token (RSM acting as tutor — web only)
        const impersonateToken = request.cookies.get("impersonate_token")?.value;
        if (isTutorContext && impersonateToken) {
            const decodedToken: any = jwt.verify(impersonateToken, process.env.TOKEN_SECRET!);
            return decodedToken.id;
        }

        // Priority 2: session cookie (web browser)
        const mainToken = request.cookies.get("token")?.value;

        // Priority 3: Bearer token in Authorization header (React Native mobile app)
        const authHeader = request.headers.get("Authorization") || "";
        const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

        const token = mainToken || bearerToken || "";
        if (!token) return null;

        const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
        return decodedToken.id;
    }
    catch (error: any) {
        throw new Error(error.message)
    }
}