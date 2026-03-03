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

        return response
    }
    catch (error: any) {
        return NextResponse.json({ error: error.message })
    }
}