import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Payment from "@/models/payment";
import courseName from "@/models/courseName";
import mongoose from "mongoose";

const STATUS = "Paid";

const ensureAcademyContext = async (request: NextRequest) => {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return { error: NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 }) };
  }

  const decodedToken = jwt.decode(token);
  const academyId =
    decodedToken && typeof decodedToken === "object" && "id" in decodedToken ? (decodedToken.id as string) : null;

  if (!academyId) {
    return { error: NextResponse.json({ success: false, error: "Invalid authentication token" }, { status: 401 }) };
  }

  const academy = await User.findById(academyId).select("category").lean();
  if (!academy || String(academy.category).toLowerCase() !== "academic") {
    return {
      error: NextResponse.json({ success: false, error: "Only academies can access revenue data" }, { status: 403 }),
    };
  }

  return { academyId };
};

export async function GET(request: NextRequest) {
  try {
    await connect();

    const context = await ensureAcademyContext(request);
    if ("error" in context) return context.error;
    const academyId = context.academyId;

    let academyObjectId: mongoose.Types.ObjectId;
    try {
      academyObjectId = new mongoose.Types.ObjectId(academyId);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid academy identifier" }, { status: 400 });
    }

    const payments = await Payment.find({ academyId: academyObjectId }).sort({ paymentDate: -1 }).lean();

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

export async function POST(request: NextRequest) {
  try {
    await connect();

    const context = await ensureAcademyContext(request);
    if ("error" in context) return context.error;
    const academyId = context.academyId;

    const {
      transactionDate,
      validUpto,
      studentId,
      tutorId,
      courseId,
      amount,
      commission,
      status = STATUS,
      paymentMethod = "Cash",
    } = await request.json();

    if (!transactionDate || !validUpto || !studentId || !courseId || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const student = await User.findById(studentId).select("username email academyId");
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    if (!student.academyId || student.academyId.toString() !== academyId) {
      return NextResponse.json({ success: false, error: "Student does not belong to this academy" }, { status: 403 });
    }

    const course = await courseName.findById(courseId).select("title price instructorId");
    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    const tutor =
      tutorId || course.instructorId
        ? await User.findById(tutorId || course.instructorId).select("username").lean()
        : null;

    const paymentDate = new Date(transactionDate);
    const validUntil = new Date(validUpto);

    const transactionId = `#TXN-${paymentDate.getTime().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    const academyObjectId = new mongoose.Types.ObjectId(academyId);

    const payment = await Payment.create({
      transactionId,
      studentId: student._id,
      studentName: student.username,
      studentEmail: student.email,
      academyId: academyObjectId,
      tutorId: tutor?._id || null,
      tutorName: tutor?.username || "N/A",
      courseId: course._id,
      courseTitle: course.title,
      months: 1,
      amount: Number(amount),
      commission: Number(commission || 0),
      paymentMethod,
      status,
      paymentDate,
      validUpto: validUntil,
    });

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Error adding manual revenue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add revenue",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connect();

    const context = await ensureAcademyContext(request);
    if ("error" in context) return context.error;
    const academyId = context.academyId;

    const {
      transactionId,
      transactionDate,
      validUpto,
      studentId,
      tutorId,
      courseId,
      amount,
      commission,
      status = STATUS,
      paymentMethod = "Cash",
    } = await request.json();

    if (!transactionId || !transactionDate || !validUpto || !studentId || !courseId || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Find the payment by transactionId and verify it belongs to this academy
    const existingPayment = await Payment.findOne({ transactionId }).lean();
    if (!existingPayment) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    const academyObjectId = new mongoose.Types.ObjectId(academyId);
    if (existingPayment.academyId.toString() !== academyObjectId.toString()) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    // Only allow editing if payment method is Cash
    if (existingPayment.paymentMethod !== "Cash") {
      return NextResponse.json(
        { success: false, error: "Only Cash payment transactions can be edited" },
        { status: 403 }
      );
    }

    const student = await User.findById(studentId).select("username email academyId");
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    if (!student.academyId || student.academyId.toString() !== academyId) {
      return NextResponse.json({ success: false, error: "Student does not belong to this academy" }, { status: 403 });
    }

    const course = await courseName.findById(courseId).select("title price instructorId");
    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    const tutor =
      tutorId || course.instructorId
        ? await User.findById(tutorId || course.instructorId).select("username").lean()
        : null;

    const paymentDate = new Date(transactionDate);
    const validUntil = new Date(validUpto);

    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId },
      {
        studentId: student._id,
        studentName: student.username,
        studentEmail: student.email,
        tutorId: tutor?._id || null,
        tutorName: tutor?.username || "N/A",
        courseId: course._id,
        courseTitle: course.title,
        amount: Number(amount),
        commission: Number(commission || 0),
        paymentMethod,
        status,
        paymentDate,
        validUpto: validUntil,
      },
      { new: true }
    );

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (error) {
    console.error("Error updating revenue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update revenue",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connect();

    const context = await ensureAcademyContext(request);
    if ("error" in context) return context.error;
    const academyId = context.academyId;

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 });
    }

    // Find the payment and verify it belongs to this academy
    const payment = await Payment.findOne({ transactionId }).lean();
    if (!payment) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    const academyObjectId = new mongoose.Types.ObjectId(academyId);
    if (payment.academyId.toString() !== academyObjectId.toString()) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    await Payment.deleteOne({ transactionId });

    return NextResponse.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting revenue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete revenue",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

