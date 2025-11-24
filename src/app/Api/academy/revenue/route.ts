import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Payment from "@/models/payment";
import mongoose from "mongoose";

const STATUS = "Paid";

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

    let academyObjectId: mongoose.Types.ObjectId;
    try {
      academyObjectId = new mongoose.Types.ObjectId(academyId);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid academy identifier" }, { status: 400 });
    }

    const payments = await Payment.find({ academyId: academyObjectId }).sort({ paymentDate: -1 }).lean();

    const transactions = payments.map((payment) => ({
      transactionId: payment.transactionId,
      studentId: payment.studentId,
      studentName: payment.studentName,
      studentEmail: payment.studentEmail,
      tutorId: payment.tutorId,
      tutorName: payment.tutorName,
      courseId: payment.courseId,
      courseTitle: payment.courseTitle,
      amount: payment.amount,
      commission: payment.commission,
      status: payment.status || STATUS,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate?.toISOString?.() || new Date().toISOString(),
      validUpto: payment.validUpto?.toISOString?.() || "",
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

