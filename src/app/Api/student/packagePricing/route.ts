import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

// GET - Retrieve package pricing settings for student's academy
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

    const studentId = decodedToken.id;

    // Get student to find their academyId
    const student = await User.findById(studentId).select('academyId').lean();
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!student.academyId) {
      return NextResponse.json({ 
        error: 'Student is not associated with an academy' 
      }, { status: 400 });
    }

    // Get academy's package pricing settings using native MongoDB
    const mongoose = await import('mongoose');
    const db = mongoose.default.connection.db;
    const usersCollection = db.collection('users');
    const academyObjectId = new mongoose.default.Types.ObjectId(student.academyId);
    
    const academyDoc = await usersCollection.findOne(
      { _id: academyObjectId },
      { projection: { packagePricingSettings: 1 } }
    );

    if (!academyDoc) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    // Return package pricing settings or default values
    const defaultSettings = {
      pricingModel: 'Monthly Subscription',
      monthlySubscriptionPricing: [
        { months: 1, discount: 0 },
        { months: 3, discount: 5 },
        { months: 6, discount: 10 },
        { months: 9, discount: 12 },
        { months: 12, discount: 15 }
      ]
    };

    // Check if packagePricingSettings exists in the actual database document
    let packagePricingSettings;
    if (academyDoc.packagePricingSettings && 
        typeof academyDoc.packagePricingSettings === 'object' &&
        academyDoc.packagePricingSettings.pricingModel !== undefined) {
      // Field exists in database and has valid data
      packagePricingSettings = academyDoc.packagePricingSettings;
    } else {
      // Field doesn't exist or is empty - use defaults
      packagePricingSettings = defaultSettings;
    }

    return NextResponse.json({
      success: true,
      packagePricingSettings: packagePricingSettings
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching package pricing settings:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch package pricing settings' 
    }, { status: 500 });
  }
}

