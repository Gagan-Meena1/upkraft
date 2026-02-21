import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
// import { request } from "http";

export const getDataFromToken = (request: NextRequest) => {
    try {
        // Prioritize x-active-token header (set by middleware) or impersonate_token cookie
        const token = (request.headers.get("referer")?.includes("/tutor") && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value || "";

        if (!token) return null;

        const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!)
        return decodedToken.id
    }
    catch (error: any) {
        throw new Error(error.message)
    }
}