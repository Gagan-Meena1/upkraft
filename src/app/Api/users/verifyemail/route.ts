import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import { NextRequest,NextResponse } from 'next/server'
import{sendEmail} from '@/helper/mailer'
// import { console } from 'inspector'

console.log("[VerifyEmail API] Module initialized");

// Connect to database
connect();

export async function POST(request: NextRequest) {
    console.log("[VerifyEmail API] Received verification request");
    
    try {
        // Extract token from request body
        const reqBody = await request.json();
        const {token} = reqBody;
        console.log("[VerifyEmail API] Processing token verification");

        // Find user with matching token that hasn't expired
        const user = await User.findOne({
            verifyToken: token,
            verifyTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            console.warn("[VerifyEmail API] Invalid or expired token");
            return NextResponse.json(
                { error: "Invalid token or token has expired" },
                { status: 400 }
            );
        }

        console.log("[VerifyEmail API] Valid token found for user:", user.email);

        // Update user verification status
        user.isVerified = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;

        await user.save({ validateBeforeSave: false });
        console.log("[VerifyEmail API] User verification completed successfully");

        return NextResponse.json({
            message: "Email verified successfully",
            success: true
        });

    } catch (error: any) {
        console.error("[VerifyEmail API] Error during verification:", error.message);
        return NextResponse.json(
            { error: error.message || "Verification process failed" },
            { status: 500 }
        );
    }
}