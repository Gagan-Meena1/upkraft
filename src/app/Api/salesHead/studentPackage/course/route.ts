import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import CourseName from "@/models/courseName";
import User from "@/models/userModel";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
    try {
        await connect();

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json({ success: false, error: "courseId is required" }, { status: 400 });
        }

        const course = await CourseName.findById(courseId)
            .select("title category subCategory tag description duration price maxStudentCount studentEnrolledCount instructorId")
            .populate({ path: "instructorId", select: "username", model: User })
            .lean() as any;

        if (!course) {
            return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            course: {
                title: course.title || "",
                category: course.category || "",
                subCategory: course.subCategory || "",
                tag: course.tag || "",
                description: course.description || "",
                duration: course.duration || "",
                price: course.price || 0,
                maxStudentCount: course.maxStudentCount || 0,
                studentEnrolledCount: course.studentEnrolledCount || 0,
                instructorName: course.instructorId?.username || "",
            }
        });

    } catch (error: any) {
        console.error("Course details error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch course details" },
            { status: 500 }
        );
    }
}
