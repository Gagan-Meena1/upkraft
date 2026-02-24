import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

// GET - Retrieve academy tax settings for student
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

    // Get student user to find academyId
    const student = await User.findById(userId).select('academyId category').lean();

    if (!student) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is a student
    if (student.category !== 'Student') {
      return NextResponse.json({ error: 'Unauthorized - Not a student' }, { status: 403 });
    }

    // Check if student has an academyId
    if (!student.academyId) {
      return NextResponse.json({ 
        success: true,
        taxSettings: null,
        message: 'Student is not associated with any academy'
      }, { status: 200 });
    }

    // Get academy's tax settings
    const academy = await User.findById(student.academyId).select('taxSettings').lean();

    if (!academy) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    // Return tax settings or default values
    const defaultSettings = {
      defaultGSTRate: '18%',
      academyGSTIN: '',
      invoicePrefix: 'INV',
      nextInvoiceNumber: 125
    };

    // Check if taxSettings exists in the academy document
    let taxSettings;
    if (academy.taxSettings && 
        typeof academy.taxSettings === 'object' &&
        academy.taxSettings.defaultGSTRate !== undefined) {
      // Field exists in database and has valid data
      taxSettings = academy.taxSettings;
    } else {
      // Field doesn't exist or is empty - use defaults
      taxSettings = defaultSettings;
    }

    return NextResponse.json({
      success: true,
      taxSettings: taxSettings
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching tax settings:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch tax settings' 
    }, { status: 500 });
  }
}

