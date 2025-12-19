import { NextRequest, NextResponse } from "next/server";
import DemoSchedule from "@/models/DemoSchedule";
import { connect } from "@/dbConnection/dbConfic";

export async function POST(request: NextRequest) {
    try {
        await connect();

        const { demoTime, demoDate } = await request.json();

        const registration = await DemoSchedule.create({
            demoDate,
            demoTime
        });

        return NextResponse.json(
            { success: true, registration },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Database connection failed", error },
            { status: 500 }
        );
    }
}