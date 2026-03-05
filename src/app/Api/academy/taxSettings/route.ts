import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

// GET - Retrieve tax settings
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
    const user = await User.findById(userId).select('taxSettings').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('GET /Api/academy/taxSettings - Raw user data:', JSON.stringify(user, null, 2));
    console.log('GET /Api/academy/taxSettings - User taxSettings:', user.taxSettings);
    console.log('GET /Api/academy/taxSettings - Type of taxSettings:', typeof user.taxSettings);
    console.log('GET /Api/academy/taxSettings - Is taxSettings null/undefined?', user.taxSettings == null);

    // Return tax settings or default values
    const defaultSettings = {
      defaultGSTRate: '18%',
      academyGSTIN: '',
      invoicePrefix: 'INV',
      nextInvoiceNumber: 125
    };

    // Check if taxSettings exists in the actual database document
    // When using lean(), we get the raw MongoDB document, so if the field doesn't exist, it will be undefined
    let taxSettings;
    if (user.taxSettings && 
        typeof user.taxSettings === 'object' &&
        user.taxSettings.defaultGSTRate !== undefined) {
      // Field exists in database and has valid data
      taxSettings = user.taxSettings;
      console.log('GET /Api/academy/taxSettings - Using saved settings from DB');
    } else {
      // Field doesn't exist or is empty - use defaults
      taxSettings = defaultSettings;
      console.log('GET /Api/academy/taxSettings - Using default settings (field not found in DB)');
    }

    console.log('GET /Api/academy/taxSettings - Returning:', taxSettings);

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

// PUT - Save tax settings
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
    console.log('PUT /Api/academy/taxSettings - Request body:', body);
    const { defaultGSTRate, academyGSTIN, invoicePrefix, nextInvoiceNumber } = body;

    // Validate required fields
    if (defaultGSTRate === undefined) {
      console.log('Validation failed: Default GST rate is required');
      return NextResponse.json({ 
        success: false,
        error: 'Default GST rate is required' 
      }, { status: 400 });
    }

    console.log('Updating tax settings for user:', userId, 'with settings:', { defaultGSTRate, academyGSTIN, invoicePrefix, nextInvoiceNumber });

    // Find the user document (not using lean() so we can save it)
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    console.log('Existing user taxSettings before update:', user.taxSettings);
    console.log('User document _id:', user._id);

    // Create the tax settings object
    const newTaxSettings = {
      defaultGSTRate: defaultGSTRate || '18%',
      academyGSTIN: academyGSTIN || '',
      invoicePrefix: invoicePrefix || 'INV',
      nextInvoiceNumber: nextInvoiceNumber !== undefined ? parseInt(nextInvoiceNumber.toString()) : 125
    };

    console.log('New tax settings to save:', newTaxSettings);

    // Update the tax settings directly on the user object
    user.taxSettings = newTaxSettings;

    // Mark the field as modified to ensure Mongoose saves it
    user.markModified('taxSettings');
    
    console.log('User taxSettings after assignment:', user.taxSettings);
    console.log('User isModified taxSettings:', user.isModified('taxSettings'));
    
    // Save the user document
    const savedUser = await user.save();
    
    console.log('After save - savedUser.taxSettings:', savedUser.taxSettings);
    
    // Also try direct MongoDB update as backup
    await User.updateOne(
      { _id: userId },
      { $set: { taxSettings: newTaxSettings } }
    );
    
    console.log('After direct MongoDB update');

    console.log('User saved. Saved user taxSettings:', savedUser.taxSettings);
    console.log('User saved. Type of savedUser.taxSettings:', typeof savedUser.taxSettings);
    console.log('User saved. Is savedUser.taxSettings null/undefined?', savedUser.taxSettings == null);

    // Wait a moment to ensure database write is complete
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verify the update was saved by fetching the user again with lean() to get raw data
    const verifyUser = await User.findById(userId).select('taxSettings').lean();
    
    if (!verifyUser) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found after update' 
      }, { status: 404 });
    }

    console.log('Verification - User from DB after update:', JSON.stringify(verifyUser, null, 2));
    console.log('Verification - taxSettings:', verifyUser.taxSettings);
    console.log('Verification - Type of taxSettings:', typeof verifyUser.taxSettings);
    console.log('Verification - Is taxSettings null/undefined?', verifyUser.taxSettings == null);

    // Get the updated tax settings
    let savedSettings;
    if (verifyUser.taxSettings && 
        typeof verifyUser.taxSettings === 'object' &&
        verifyUser.taxSettings.defaultGSTRate !== undefined) {
      savedSettings = verifyUser.taxSettings;
      console.log('Using verified settings from DB');
    } else {
      // Fallback to what we tried to save
      savedSettings = {
        defaultGSTRate: defaultGSTRate || '18%',
        academyGSTIN: academyGSTIN || '',
        invoicePrefix: invoicePrefix || 'INV',
        nextInvoiceNumber: nextInvoiceNumber !== undefined ? parseInt(nextInvoiceNumber.toString()) : 125
      };
      console.log('Using fallback settings (DB verification failed)');
    }
    
    console.log('Tax settings updated successfully. Final saved settings:', savedSettings);

    const response = NextResponse.json({
      success: true,
      message: 'Tax settings updated successfully',
      taxSettings: savedSettings
    }, { status: 200 });
    
    console.log('Response being sent:', {
      success: true,
      message: 'Tax settings updated successfully',
      taxSettings: savedSettings
    });
    
    return response;

  } catch (error: any) {
    console.error('Error updating tax settings:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update tax settings' 
    }, { status: 500 });
  }
}

