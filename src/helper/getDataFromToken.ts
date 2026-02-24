import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
// import { request } from "http";

export const getDataFromToken = (request: NextRequest) => {
    try {
        const referer = request.headers.get("referer") || "";
        let refererPath = "";
        try { if (referer) refererPath = new URL(referer).pathname; } catch (e) { }

        const isTutorContext = refererPath.startsWith("/tutor") || request.nextUrl?.pathname?.startsWith("/Api/tutor");
        const impersonateToken = request.cookies.get("impersonate_token")?.value;
        const mainToken = request.cookies.get("token")?.value;

        const token = (isTutorContext && impersonateToken) ? impersonateToken : (mainToken || "");

        if (!token) return null;

        const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
        return decodedToken.id;
    }
    catch (error: any) {
        throw new Error(error.message)
    }
}