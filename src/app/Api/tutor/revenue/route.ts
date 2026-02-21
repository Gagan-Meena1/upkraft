import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Payment from "@/models/payment";
import courseName from "@/models/courseName";
import mongoose from "mongoose";

const STATUS = "Paid";

const ensureTutorContext = async (request: NextRequest) => {
  const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
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
    let query: any;
    if (academyObjectId) {
      // Academy tutor: show all transactions where tutor is involved and academy matches
      query = { 
        tutorId: tutorObjectId,
        academyId: academyObjectId
      };
    } else {
      // Individual tutor: show transactions they created (isManualEntry = true)
      // OR transactions where they're the academy (academyId = tutorId)
      query = {
        $or: [
          { tutorId: tutorObjectId, isManualEntry: true },
          { tutorId: tutorObjectId, academyId: tutorObjectId }
        ]
      };
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
    // For individual tutors, use tutor's ID as academyId (they manage their own academy)
    // For academy tutors, use the academyId
    // Fallback to student's academyId if available
    let academyObjectId: mongoose.Types.ObjectId;
    if (academyId) {
      academyObjectId = new mongoose.Types.ObjectId(academyId);
    } else if (student.academyId) {
      academyObjectId = new mongoose.Types.ObjectId(student.academyId);
    } else {
      // Individual tutor managing their own revenue - use tutor ID as academyId
      academyObjectId = tutorObjectId;
    }

    const payment = await Payment.create({
      transactionId,
      studentId: student._id,
      studentName: student.username,
      studentEmail: student.email,
      academyId: academyObjectId,
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

export async function PUT(request: NextRequest) {
  try {
    await connect();

    const context = await ensureTutorContext(request);
    if ("error" in context) return context.error;
    const { tutorId, academyId, isIndividualTutor } = context;

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 });
    }

    // Only individual tutors can edit revenue transactions
    if (!isIndividualTutor) {
      return NextResponse.json({ 
        success: false, 
        error: "Academy tutors cannot edit revenue transactions. Please contact your academy." 
      }, { status: 403 });
    }

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

    // Find the existing payment
    const existingPayment = await Payment.findOne({ transactionId });
    if (!existingPayment) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    // Verify the transaction belongs to this tutor
    if (existingPayment.tutorId?.toString() !== tutorId) {
      return NextResponse.json({ success: false, error: "You can only edit your own transactions" }, { status: 403 });
    }

    // Verify it's a manually created transaction
    if (!existingPayment.isManualEntry) {
      return NextResponse.json({ success: false, error: "Only manually created transactions can be edited" }, { status: 403 });
    }

    const student = await User.findById(studentId).select("username email academyId");
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
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

    const tutorObjectId = new mongoose.Types.ObjectId(tutorId);
    let academyObjectId: mongoose.Types.ObjectId;
    if (academyId) {
      academyObjectId = new mongoose.Types.ObjectId(academyId);
    } else if (student.academyId) {
      academyObjectId = new mongoose.Types.ObjectId(student.academyId);
    } else {
      academyObjectId = tutorObjectId;
    }

    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId },
      {
        studentId: student._id,
        studentName: student.username,
        studentEmail: student.email,
        academyId: academyObjectId,
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
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      payment: {
        transactionId: updatedPayment.transactionId,
        studentId: updatedPayment.studentId?.toString(),
        studentName: updatedPayment.studentName,
        tutorId: updatedPayment.tutorId?.toString(),
        tutorName: updatedPayment.tutorName,
        courseId: updatedPayment.courseId?.toString(),
        courseTitle: updatedPayment.courseTitle,
        amount: updatedPayment.amount,
        commission: updatedPayment.commission,
        status: updatedPayment.status,
        paymentMethod: updatedPayment.paymentMethod,
        paymentDate: updatedPayment.paymentDate?.toISOString(),
        validUpto: updatedPayment.validUpto?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating tutor revenue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update revenue transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connect();

    const context = await ensureTutorContext(request);
    if ("error" in context) return context.error;
    const { tutorId, isIndividualTutor } = context;

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 });
    }

    // Only individual tutors can delete revenue transactions
    if (!isIndividualTutor) {
      return NextResponse.json({ 
        success: false, 
        error: "Academy tutors cannot delete revenue transactions. Please contact your academy." 
      }, { status: 403 });
    }

    // Find the existing payment
    const existingPayment = await Payment.findOne({ transactionId });
    if (!existingPayment) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    // Verify the transaction belongs to this tutor
    if (existingPayment.tutorId?.toString() !== tutorId) {
      return NextResponse.json({ success: false, error: "You can only delete your own transactions" }, { status: 403 });
    }

    // Verify it's a manually created transaction
    if (!existingPayment.isManualEntry) {
      return NextResponse.json({ success: false, error: "Only manually created transactions can be deleted" }, { status: 403 });
    }

    await Payment.findOneAndDelete({ transactionId });

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tutor revenue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete revenue transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

