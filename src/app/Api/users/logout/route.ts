import { connect } from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import { log } from 'console';
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

connect()

export async function GET(request: NextRequest) {
    try {

        const response = NextResponse.json({
            message: "Logout Successfully",
            success: true
        })

        const referer = request.headers.get("referer") || "";
        const isFromTutor = referer.includes("/tutor");
        const hasImpersonateToken = request.cookies.get("impersonate_token")?.value;

        if (isFromTutor && hasImpersonateToken) {
            // RM is logging out of an impersonated tutor session.
            // Only clear the impersonate_token so they stay logged in as RM.
            response.cookies.set("impersonate_token", "", {
                httpOnly: true,
                path: "/",
                expires: new Date(0)
            })
        } else {
            // Normal logout (RM from RM dashboard, actual Tutor or Student logging out)
            response.cookies.set("token", "", {
                httpOnly: true,
                path: "/",
                expires: new Date(0)
            })

            response.cookies.set("impersonate_token", "", {
                httpOnly: true,
                path: "/",
                expires: new Date(0)
            })
        }

        return response
    }
    catch (error: any) {
        return NextResponse.json({ error: error.message })
    }
}