import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

// GET - Retrieve payment methods settings
export async function GET(request: NextRequest) {
  try {
    await connect();

    // Get token from cookies
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
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
    const user = await User.findById(userId).select('paymentMethodsSettings').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('GET /Api/academy/paymentMethods - Raw user data:', JSON.stringify(user, null, 2));
    console.log('GET /Api/academy/paymentMethods - User paymentMethodsSettings:', user.paymentMethodsSettings);
    console.log('GET /Api/academy/paymentMethods - Type of paymentMethodsSettings:', typeof user.paymentMethodsSettings);
    console.log('GET /Api/academy/paymentMethods - Is paymentMethodsSettings null/undefined?', user.paymentMethodsSettings == null);

    // Return payment methods settings or default values
    const defaultSettings = {
      selectedMethods: ['UPI', 'Net Banking', 'Card', 'Cash'],
      preferredMethod: 'UPI',
      paymentGateway: 'Razorpay',
      currency: 'INR'
    };

    // Check if paymentMethodsSettings exists in the actual database document
    // When using lean(), we get the raw MongoDB document, so if the field doesn't exist, it will be undefined
    let paymentMethods;
    if (user.paymentMethodsSettings && 
        typeof user.paymentMethodsSettings === 'object' &&
        user.paymentMethodsSettings.selectedMethods && 
        Array.isArray(user.paymentMethodsSettings.selectedMethods) &&
        user.paymentMethodsSettings.selectedMethods.length > 0) {
      // Field exists in database and has valid data
      paymentMethods = user.paymentMethodsSettings;
      console.log('GET /Api/academy/paymentMethods - Using saved settings from DB');
    } else {
      // Field doesn't exist or is empty - use defaults
      paymentMethods = defaultSettings;
      console.log('GET /Api/academy/paymentMethods - Using default settings (field not found in DB)');
    }

    console.log('GET /Api/academy/paymentMethods - Returning:', paymentMethods);

    return NextResponse.json({
      success: true,
      paymentMethods: paymentMethods
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch payment methods' 
    }, { status: 500 });
  }
}

// PUT - Save payment methods settings
export async function PUT(request: NextRequest) {
  try {
    await connect();

    // Get token from cookies
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
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
    console.log('PUT /Api/academy/paymentMethods - Request body:', body);
    const { selectedMethods, preferredMethod, paymentGateway, currency } = body;

    // Validate required fields
    if (!selectedMethods || !Array.isArray(selectedMethods) || selectedMethods.length === 0) {
      console.log('Validation failed: No payment methods selected');
      return NextResponse.json({ 
        success: false,
        error: 'At least one payment method must be selected' 
      }, { status: 400 });
    }

    console.log('Updating payment methods for user:', userId, 'with methods:', selectedMethods);

    // Find the user document (not using lean() so we can save it)
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    console.log('Existing user paymentMethodsSettings before update:', user.paymentMethodsSettings);

    // Update the payment methods settings directly on the user object
    user.paymentMethodsSettings = {
      selectedMethods: selectedMethods,
      preferredMethod: preferredMethod || 'UPI',
      paymentGateway: paymentGateway || 'Razorpay',
      currency: currency || 'INR'
    };

    // Mark the field as modified to ensure Mongoose saves it
    user.markModified('paymentMethodsSettings');
    
    // Save the user document
    const savedUser = await user.save();

    console.log('User saved. Saved user paymentMethodsSettings:', savedUser.paymentMethodsSettings);

    // Wait a moment to ensure database write is complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify the update was saved by fetching the user again with lean() to get raw data
    const verifyUser = await User.findById(userId).select('paymentMethodsSettings').lean();
    
    if (!verifyUser) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found after update' 
      }, { status: 404 });
    }

    console.log('Verification - User from DB after update:', JSON.stringify(verifyUser, null, 2));
    console.log('Verification - paymentMethodsSettings:', verifyUser.paymentMethodsSettings);

    // Get the updated payment methods settings
    const savedSettings = verifyUser.paymentMethodsSettings || {
      selectedMethods,
      preferredMethod: preferredMethod || 'UPI',
      paymentGateway: paymentGateway || 'Razorpay',
      currency: currency || 'INR'
    };
    
    console.log('Payment methods updated successfully. Final saved settings:', savedSettings);

    const response = NextResponse.json({
      success: true,
      message: 'Payment methods updated successfully',
      paymentMethods: savedSettings
    }, { status: 200 });
    
    console.log('Response being sent:', {
      success: true,
      message: 'Payment methods updated successfully',
      paymentMethods: savedSettings
    });
    
    return response;

  } catch (error: any) {
    console.error('Error updating payment methods:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update payment methods' 
    }, { status: 500 });
  }
}

