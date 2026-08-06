import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";

export async function POST(request: NextRequest) {
    try {
        await connect();

        const { email, phone, reason } = await request.json();

        if (!email && !phone) {
            return NextResponse.json(
                { success: false, error: "Please provide email or phone number" },
                { status: 400 }
            );
        }

        // Find user by email or phone
        const query: any = {};
        if (email) query.email = email;
        if (phone) query.contact = phone;

        const user = await User.findOne(query).select("username email contact").lean();

        if (!user) {
            // Still accept the request even if user not found (they may have a different email/phone)
            console.log(`Data deletion request — user not found. Email: ${email}, Phone: ${phone}, Reason: ${reason}`);
            return NextResponse.json({
                success: true,
                message: "Request received. We will review and process it within 7 business days."
            });
        }

        // Log the deletion request (in production, you'd store this in a collection)
        console.log(`📋 DATA DELETION REQUEST:
  User: ${(user as any).username}
  Email: ${(user as any).email}
  Phone: ${(user as any).contact}
  Reason: ${reason || "Not specified"}
  Requested At: ${new Date().toISOString()}
        `);

        return NextResponse.json({
            success: true,
            message: "Request received. We will review and process it within 7 business days."
        });

    } catch (error: any) {
        console.error("Delete request error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
