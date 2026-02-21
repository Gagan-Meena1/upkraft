import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Payment from "@/models/payment";
import mongoose from "mongoose";

const STATUS = "Paid";

const ensureStudentContext = async (request: NextRequest) => {
  const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
  if (!token) {
    return { error: NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 }) };
  }

  const decodedToken = jwt.decode(token);
  const studentId =
    decodedToken && typeof decodedToken === "object" && "id" in decodedToken ? (decodedToken.id as string) : null;

  if (!studentId) {
    return { error: NextResponse.json({ success: false, error: "Invalid authentication token" }, { status: 401 }) };
  }

  const student = await User.findById(studentId).select("category academyId").lean();
  if (!student || String(student.category).toLowerCase() !== "student") {
    return {
      error: NextResponse.json({ success: false, error: "Student access required" }, { status: 403 }),
    };
  }

  return { studentId, academyId: student.academyId };
};

export async function GET(request: NextRequest) {
  try {
    await connect();

    const context = await ensureStudentContext(request);
    if ("error" in context) return context.error;
    const { studentId, academyId } = context;

    let studentObjectId: mongoose.Types.ObjectId;
    try {
      studentObjectId = new mongoose.Types.ObjectId(studentId);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid student identifier" }, { status: 400 });
    }

    // Fetch all payments for this student
    const query: any = { studentId: studentObjectId };

    const payments = await Payment.find(query).sort({ paymentDate: -1 }).lean();

    const transactions = payments.map((payment) => ({
      transactionId: payment.transactionId,
      studentId: payment.studentId?.toString() || "",
      studentName: payment.studentName,
      studentEmail: payment.studentEmail,
      tutorId: payment.tutorId?.toString() || "",
      tutorName: payment.tutorName,
      courseId: payment.courseId?.toString() || "",
      courseTitle: payment.courseTitle,
      amount: payment.amount,
      commission: payment.commission,
      status: payment.status || STATUS,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate?.toISOString?.() || new Date().toISOString(),
      validUpto: payment.validUpto?.toISOString?.() || "",
      isManualEntry: payment.isManualEntry || false,
    }));

    return NextResponse.json({
      success: true,
      transactions,
      meta: {
        count: transactions.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching student revenue:", error);
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

