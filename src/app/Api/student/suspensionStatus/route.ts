import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import Payment from '@/models/payment';
import jwt from 'jsonwebtoken';

// GET - Check if student account is suspended
export async function GET(request: NextRequest) {
  try {
    await connect();

    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Decode token to get user ID
    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.id;

    // Get student user to find academyId
    const student = await User.findById(userId).select('academyId category').lean();

    if (!student) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is a student
    if (student.category !== 'Student') {
      return NextResponse.json({ 
        success: true,
        isSuspended: false,
        message: 'Not a student account'
      }, { status: 200 });
    }

    // Check if student has an academyId (only academy-created students)
    if (!student.academyId) {
      return NextResponse.json({ 
        success: true,
        isSuspended: false,
        message: 'Student is not associated with any academy'
      }, { status: 200 });
    }

    // Get academy's policies settings
    const academy = await User.findById(student.academyId).select('policiesSettings').lean();

    if (!academy) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    // Get autoSuspendAfter policy (default 7 days)
    const autoSuspendAfter = academy.policiesSettings?.autoSuspendAfter || 7;

    // Get latest payment for this student
    const latestPayment = await Payment.findOne({ 
      studentId: userId,
      status: 'Paid'
    })
    .sort({ validUpto: -1 })
    .select('validUpto')
    .lean();

    // If no payment found, account is suspended
    if (!latestPayment || !latestPayment.validUpto) {
      return NextResponse.json({
        success: true,
        isSuspended: true,
        message: 'No payment found. Account is suspended.',
        validUpto: null,
        autoSuspendAfter: autoSuspendAfter
      }, { status: 200 });
    }

    // Calculate suspension date: validUpto + autoSuspendAfter days
    const validUptoDate = new Date(latestPayment.validUpto);
    const suspensionDate = new Date(validUptoDate);
    suspensionDate.setDate(suspensionDate.getDate() + autoSuspendAfter);
    suspensionDate.setHours(23, 59, 59, 999);

    // Check if current date is past suspension date
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);

    const isSuspended = currentDate > suspensionDate;

    return NextResponse.json({
      success: true,
      isSuspended: isSuspended,
      message: isSuspended 
        ? 'Your account has been suspended due to overdue payment. Please renew your subscription to continue.' 
        : 'Account is active',
      validUpto: latestPayment.validUpto,
      suspensionDate: suspensionDate.toISOString(),
      autoSuspendAfter: autoSuspendAfter
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error checking suspension status:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to check suspension status' 
    }, { status: 500 });
  }
}

