import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Payment from "@/models/payment";
import courseName from "@/models/courseName";
import mongoose from "mongoose";

const STATUS = "Paid";

const ensureTutorContext = async (request: NextRequest) => {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return { error: NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 }) };
  }

  const decodedToken = jwt.decode(token);
  const tutorId =
    decodedToken && typeof decodedToken === "object" && "id" in decodedToken ? (decodedToken.id as string) : null;

  if (!tutorId) {
    return { error: NextResponse.json({ success: false, error: "Invalid authentication token" }, { status: 401 }) };
  }

    const tutor = await User.findById(tutorId).select("category academyId").lean();
    if (!tutor || String(tutor.category).toLowerCase() !== "tutor") {
      return {
        error: NextResponse.json({ success: false, error: "Tutor access required" }, { status: 403 }),
      };
    }

    const isIndividualTutor = !tutor.academyId;
    return { tutorId, academyId: tutor.academyId, isIndividualTutor };
};

export async function GET(request: NextRequest) {
  try {
    await connect();

    const context = await ensureTutorContext(request);
    if ("error" in context) return context.error;
    const { tutorId, academyId } = context;

    let tutorObjectId: mongoose.Types.ObjectId;
    let academyObjectId: mongoose.Types.ObjectId | null = null;
    try {
      tutorObjectId = new mongoose.Types.ObjectId(tutorId);
      if (academyId) {
        academyObjectId = new mongoose.Types.ObjectId(academyId);
      }
    } catch {
      return NextResponse.json({ success: false, error: "Invalid tutor identifier" }, { status: 400 });
    }

    // For academy tutors: show all revenue where tutor is involved
    // For individual tutors: show only revenue they created themselves
    const query: any = { tutorId: tutorObjectId };
    if (academyObjectId) {
      // Academy tutor: show all transactions where tutor is involved
      query.academyId = academyObjectId;
    } else {
      // Individual tutor: show only manually created transactions
      query.isManualEntry = true;
    }

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

    const isIndividualTutor = !academyId;
    return NextResponse.json({
      success: true,
      transactions,
      isIndividualTutor,
      meta: {
        count: transactions.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching tutor revenue:", error);
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

    const context = await ensureTutorContext(request);
    if ("error" in context) return context.error;
    const { tutorId, academyId, isIndividualTutor } = context;

    const {
      transactionDate,
      validUpto,
      studentId,
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

    // Only individual tutors can create revenue transactions
    if (!isIndividualTutor) {
      return NextResponse.json({ 
        success: false, 
        error: "Academy tutors cannot create revenue transactions. Please contact your academy." 
      }, { status: 403 });
    }

    const course = await courseName.findById(courseId).select("title price instructorId");
    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    // Verify tutor is the instructor of the course
    const courseInstructorId = course.instructorId?.toString();
    if (courseInstructorId && courseInstructorId !== tutorId) {
      return NextResponse.json({ success: false, error: "You are not the instructor of this course" }, { status: 403 });
    }

    const tutor = await User.findById(tutorId).select("username").lean();
    if (!tutor) {
      return NextResponse.json({ success: false, error: "Tutor not found" }, { status: 404 });
    }

    const paymentDate = new Date(transactionDate);
    const validUntil = new Date(validUpto);

    const transactionId = `#TXN-${paymentDate.getTime().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    const tutorObjectId = new mongoose.Types.ObjectId(tutorId);
    const academyObjectId = academyId ? new mongoose.Types.ObjectId(academyId) : null;

    const payment = await Payment.create({
      transactionId,
      studentId: student._id,
      studentName: student.username,
      studentEmail: student.email,
      academyId: academyObjectId || student.academyId || null,
      tutorId: tutorObjectId,
      tutorName: tutor.username,
      courseId: course._id,
      courseTitle: course.title,
      amount: Number(amount),
      commission: Number(commission || 0),
      paymentMethod,
      status,
      paymentDate,
      validUpto: validUntil,
      isManualEntry: true,
    });

    return NextResponse.json({
      success: true,
      payment: {
        transactionId: payment.transactionId,
        studentId: payment.studentId?.toString(),
        studentName: payment.studentName,
        tutorId: payment.tutorId?.toString(),
        tutorName: payment.tutorName,
        courseId: payment.courseId?.toString(),
        courseTitle: payment.courseTitle,
        amount: payment.amount,
        commission: payment.commission,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate?.toISOString(),
        validUpto: payment.validUpto?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating tutor revenue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create revenue transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

