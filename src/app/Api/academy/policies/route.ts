import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

// GET - Retrieve policies settings
export async function GET(request: NextRequest) {
  try {
    await connect();

    // Get token from cookies
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Decode token to get user ID
    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.id;

    // Get user - use lean() to get raw data without Mongoose defaults interfering
    const user = await User.findById(userId).select('policiesSettings').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return policies settings or default values
    const defaultSettings = {
      lateFeePolicy: '₹200 per day (Max ₹1,500)',
      daysUntilOverdue: 3,
      earlyPaymentDiscount: 0,
      autoSuspendAfter: 7
    };

    // Check if policiesSettings exists in the actual database document
    let policies;
    if (user.policiesSettings && 
        typeof user.policiesSettings === 'object' &&
        user.policiesSettings.lateFeePolicy !== undefined) {
      // Field exists in database and has valid data
      policies = user.policiesSettings;
    } else {
      // Field doesn't exist or is empty - use defaults
      policies = defaultSettings;
    }

    return NextResponse.json({
      success: true,
      policies: policies
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching policies:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch policies' 
    }, { status: 500 });
  }
}

// PUT - Save policies settings
export async function PUT(request: NextRequest) {
  try {
    await connect();

    // Get token from cookies
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Decode token to get user ID
    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.id;

    // Get request body
    const body = await request.json();
    const { lateFeePolicy, daysUntilOverdue, earlyPaymentDiscount, autoSuspendAfter } = body;

    // Validate required fields
    if (lateFeePolicy === undefined || daysUntilOverdue === undefined) {
      return NextResponse.json({ 
        success: false,
        error: 'Late fee policy and days until overdue are required' 
      }, { status: 400 });
    }

    // Find the user document (not using lean() so we can save it)
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    // Update the policies settings directly on the user object
    user.policiesSettings = {
      lateFeePolicy: lateFeePolicy || '₹200 per day (Max ₹1,500)',
      daysUntilOverdue: daysUntilOverdue !== undefined ? parseInt(daysUntilOverdue.toString()) : 3,
      earlyPaymentDiscount: earlyPaymentDiscount !== undefined ? parseInt(earlyPaymentDiscount.toString()) : 0,
      autoSuspendAfter: autoSuspendAfter !== undefined ? parseInt(autoSuspendAfter.toString()) : 7
    };

    // Mark the field as modified to ensure Mongoose saves it
    user.markModified('policiesSettings');
    
    // Save the user document
    const savedUser = await user.save();

    // Get the updated policies settings
    const savedSettings = savedUser.policiesSettings || {
      lateFeePolicy: lateFeePolicy || '₹200 per day (Max ₹1,500)',
      daysUntilOverdue: daysUntilOverdue !== undefined ? parseInt(daysUntilOverdue.toString()) : 3,
      earlyPaymentDiscount: earlyPaymentDiscount !== undefined ? parseInt(earlyPaymentDiscount.toString()) : 0,
      autoSuspendAfter: autoSuspendAfter !== undefined ? parseInt(autoSuspendAfter.toString()) : 7
    };

    return NextResponse.json({
      success: true,
      message: 'Policies updated successfully',
      policies: savedSettings
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating policies:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update policies' 
    }, { status: 500 });
  }
}



