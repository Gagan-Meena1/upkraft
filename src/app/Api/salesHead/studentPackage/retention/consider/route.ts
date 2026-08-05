import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";

export async function PUT(request: NextRequest) {
    try {
        await connect();

        const { studentId, consider } = await request.json();

        if (!studentId || typeof consider !== "boolean") {
            return NextResponse.json({ success: false, error: "studentId and consider (boolean) are required" }, { status: 400 });
        }

        const updated = await User.findByIdAndUpdate(
            studentId,
            { $set: { consider } },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: `Student ${consider ? "included" : "excluded"}` });
    } catch (error: any) {
        console.error("Consider toggle error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
