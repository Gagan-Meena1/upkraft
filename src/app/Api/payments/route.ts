import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import courseName from "@/models/courseName";
import Payment from "@/models/payment";

const COMMISSION_RATE = 0.15;

export async function POST(request: NextRequest) {
  try {
    await connect();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const decoded = jwt.decode(token);
    const studentId = decoded && typeof decoded === "object" && "id" in decoded ? decoded.id : null;

    if (!studentId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const student = await User.findById(studentId).select("username email category academyId instructorId").lean();
    if (!student || student.category !== "Student") {
      return NextResponse.json({ success: false, error: "Only students can make payments" }, { status: 403 });
    }

    if (!student.academyId) {
      return NextResponse.json({ success: false, error: "Student is not associated with any academy" }, { status: 400 });
    }

    const body = await request.json();
    let { courseId, months = 1, paymentMethod = "UPI" } = body;
    
    // Map "Credit Card" back to "Card" for database storage
    if (paymentMethod === "Credit Card") {
      paymentMethod = "Card";
    }

    if (!courseId) {
      return NextResponse.json({ success: false, error: "Course ID is required" }, { status: 400 });
    }

    const parsedMonths = Math.max(1, parseInt(months, 10) || 1);

    const course = await courseName.findById(courseId).select("title price instructorId");
    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    let tutor = null;
    const studentInstructorId = Array.isArray(student.instructorId) ? student.instructorId[0] : student.instructorId;

    if (studentInstructorId) {
      tutor = await User.findById(studentInstructorId).select("username").lean();
    }

    if (!tutor && course.instructorId) {
      tutor = await User.findById(course.instructorId).select("username").lean();
    }

    const baseAmount = typeof course.price === "number" ? course.price : 0;
    const totalAmount = baseAmount * parsedMonths;
    const commission = Number((totalAmount * COMMISSION_RATE).toFixed(2));

    const paymentDate = new Date();
    const validUpto = new Date(paymentDate);
    validUpto.setMonth(validUpto.getMonth() + parsedMonths);
    validUpto.setHours(23, 59, 59, 999);

    const transactionId = `#TXN-${paymentDate.getTime().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    const payment = await Payment.create({
      transactionId,
      studentId,
      studentName: student.username,
      studentEmail: student.email,
      academyId: student.academyId,
      tutorId: tutor?._id || null,
      tutorName: tutor?.username || "N/A",
      courseId: course._id,
      courseTitle: course.title,
      months: parsedMonths,
      amount: totalAmount,
      commission,
      paymentMethod,
      status: "Paid",
      paymentDate,
      validUpto,
    });

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Payment creation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process payment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

