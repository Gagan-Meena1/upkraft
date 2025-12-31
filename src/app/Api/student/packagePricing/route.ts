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

    // Get student to find their applied pricing settings
    const mongoose = await import('mongoose');
    const db = mongoose.default.connection.db;
    const usersCollection = db.collection('users');
    const studentObjectId = new mongoose.default.Types.ObjectId(studentId);
    
    const studentDoc = await usersCollection.findOne(
      { _id: studentObjectId },
      { projection: { appliedPricingSettings: 1, academyId: 1 } }
    );

    if (!studentDoc) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Return package pricing settings or default values
    const defaultSettings = {
      pricingModel: 'Monthly Subscription',
      packagePricing: [
        { name: 'Silver', sessions: 4, perSessionRate: 400, discount: 0, totalPrice: 1600 },
        { name: 'Gold', sessions: 12, perSessionRate: 350, discount: 12, totalPrice: 4200 },
        { name: 'Platinum', sessions: 24, perSessionRate: 320, discount: 20, totalPrice: 7680 }
      ],
      monthlySubscriptionPricing: [
        { months: 1, discount: 0 },
        { months: 3, discount: 5 },
        { months: 6, discount: 10 },
        { months: 9, discount: 12 },
        { months: 12, discount: 15 }
      ]
    };

    // Get full academy pricing settings (both models) for display
    let packagePricingSettings;
    if (studentDoc.academyId) {
      const academyObjectId = new mongoose.default.Types.ObjectId(studentDoc.academyId);
      const academyDoc = await usersCollection.findOne(
        { _id: academyObjectId },
        { projection: { packagePricingSettings: 1 } }
      );

      if (academyDoc && academyDoc.packagePricingSettings && 
          typeof academyDoc.packagePricingSettings === 'object' &&
          academyDoc.packagePricingSettings.pricingModel !== undefined) {
        // Return full academy pricing settings (both models)
        const academySettings = academyDoc.packagePricingSettings;
        packagePricingSettings = {
          pricingModel: academySettings.pricingModel, // Currently active model
          packagePricing: academySettings.packagePricing || [],
          monthlySubscriptionPricing: academySettings.monthlySubscriptionPricing || []
        };
      } else {
        packagePricingSettings = defaultSettings;
      }
    } else {
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

