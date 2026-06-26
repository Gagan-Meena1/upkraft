import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
    try {
        await connect();

        const token = request.cookies.get("token")?.value || "";
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const decoded: any = jwt.decode(token);
        if (!decoded?.id) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q")?.trim();

        if (!q || q.length < 2) {
            return NextResponse.json({ success: true, students: [] });
        }

        const students = await (User as any).find({
            category: "Student",
            $or: [
                { username: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } }
            ]
        })
            .select("_id username email")
            .limit(10)
            .lean();

        return NextResponse.json({ success: true, students });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}