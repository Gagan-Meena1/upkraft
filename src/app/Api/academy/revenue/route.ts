import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";

const STATUS = "Paid";
const PAYMENT_METHOD = "UPI";
const COMMISSION_RATE = 0.15;

export async function GET(request: NextRequest) {
  try {
    await connect();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const decodedToken = jwt.decode(token);
    const academyId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken ? (decodedToken.id as string) : null;

    if (!academyId) {
      return NextResponse.json({ success: false, error: "Invalid authentication token" }, { status: 401 });
    }

    const academy = await User.findById(academyId).select("category").lean();
    if (!academy || String(academy.category).toLowerCase() !== "academic") {
      return NextResponse.json(
        { success: false, error: "Only academies can access revenue data" },
        { status: 403 }
      );
    }

    const students = await User.find({
      category: "Student",
      academyId,
    })
      .populate({
        path: "instructorId",
        select: "username email",
      })
      .populate({
        path: "courses",
        select: "title price",
      })
      .select("username email instructorId courses createdAt")
      .lean();

    const today = new Date();
    const validUpto = new Date(Date.UTC(today.getFullYear(), 11, 31, 23, 59, 59, 999));

    const transactions = students.map((student: any) => {
      const firstCourse = Array.isArray(student.courses) && student.courses.length > 0 ? student.courses[0] : null;
      const amount = typeof firstCourse?.price === "number" ? firstCourse.price : 0;
      const commission = Number((amount * COMMISSION_RATE).toFixed(2));

      const tutor =
        Array.isArray(student.instructorId) && student.instructorId.length > 0
          ? student.instructorId[0]
          : student.instructorId || null;

      const suffix = student._id?.toString?.().slice(-6).toUpperCase() || "000000";

      return {
        transactionId: `#TXN-${suffix}`,
        studentId: student._id,
        studentName: student.username,
        studentEmail: student.email,
        tutorId: tutor?._id || null,
        tutorName: tutor?.username || "N/A",
        courseId: firstCourse?._id || null,
        courseTitle: firstCourse?.title || "N/A",
        amount,
        commission,
        status: STATUS,
        paymentMethod: PAYMENT_METHOD,
        paymentDate: today.toISOString(),
        validUpto: validUpto.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      transactions,
      meta: {
        count: transactions.length,
        generatedAt: today.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching academy revenue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch revenue data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

