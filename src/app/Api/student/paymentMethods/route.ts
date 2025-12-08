import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

// GET - Get payment methods for student's academy
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

    // Get student to find their academy
    const student = await User.findById(userId).select('academyId category');
    
    if (!student) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (student.category !== 'Student') {
      return NextResponse.json({ error: 'Only students can access this endpoint' }, { status: 403 });
    }

    if (!student.academyId) {
      return NextResponse.json({ error: 'Student is not associated with any academy' }, { status: 400 });
    }

    // Get academy's payment methods settings
    const academy = await User.findById(student.academyId).select('paymentMethodsSettings');

    if (!academy) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    // Return payment methods settings or default values
    const defaultSettings = {
      selectedMethods: ['UPI', 'Net Banking', 'Card', 'Cash'],
      preferredMethod: 'UPI',
      paymentGateway: 'Razorpay',
      currency: 'INR'
    };

    const paymentMethods = academy.paymentMethodsSettings || defaultSettings;

    // Map "Card" to "Credit Card" for student display
    const mappedMethods = paymentMethods.selectedMethods.map((method: string) => 
      method === 'Card' ? 'Credit Card' : method
    );

    return NextResponse.json({
      success: true,
      paymentMethods: {
        ...paymentMethods,
        selectedMethods: mappedMethods
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch payment methods' 
    }, { status: 500 });
  }
}

