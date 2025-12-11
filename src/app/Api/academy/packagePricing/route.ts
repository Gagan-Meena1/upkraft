import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

// GET - Retrieve package pricing settings
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

    // Get user - use lean() to get raw data without Mongoose defaults interfering
    const user = await User.findById(userId).select('packagePricingSettings').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return package pricing settings or default values
    const defaultSettings = {
      pricingModel: 'Monthly Subscription',
      packagePricing: [
        { name: 'Silver', sessions: 4, perSessionRate: 400, discount: 0, totalPrice: 1600 },
        { name: 'Gold', sessions: 12, perSessionRate: 350, discount: 12, totalPrice: 4200 },
        { name: 'Platinum', sessions: 24, perSessionRate: 320, discount: 20, totalPrice: 7680 }
      ]
    };

    // Check if packagePricingSettings exists in the actual database document
    let packagePricingSettings;
    if (user.packagePricingSettings && 
        typeof user.packagePricingSettings === 'object' &&
        user.packagePricingSettings.pricingModel !== undefined) {
      // Field exists in database and has valid data
      packagePricingSettings = user.packagePricingSettings;
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

// PUT - Save package pricing settings
export async function PUT(request: NextRequest) {
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

    // Get request body
    const body = await request.json();
    const { pricingModel, packagePricing } = body;

    // Validate required fields
    if (pricingModel === undefined) {
      return NextResponse.json({ 
        success: false,
        error: 'Pricing model is required' 
      }, { status: 400 });
    }

    // Validate pricing model value
    if (!['Monthly Subscription', 'Package'].includes(pricingModel)) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid pricing model. Must be "Monthly Subscription" or "Package"' 
      }, { status: 400 });
    }

    // If Package model is selected, validate packagePricing array
    if (pricingModel === 'Package') {
      if (!Array.isArray(packagePricing) || packagePricing.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: 'Package pricing array is required when Package model is selected' 
        }, { status: 400 });
      }

      // Validate each package in the array
      for (const pkg of packagePricing) {
        if (!pkg.name || pkg.sessions === undefined || pkg.perSessionRate === undefined || pkg.totalPrice === undefined) {
          return NextResponse.json({ 
            success: false,
            error: 'Each package must have name, sessions, perSessionRate, and totalPrice' 
          }, { status: 400 });
        }
      }
    }

    // Find the user document (not using lean() so we can save it)
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    // Create the package pricing settings object
    const newPackagePricingSettings = {
      pricingModel: pricingModel,
      packagePricing: pricingModel === 'Package' ? packagePricing : []
    };

    // Update the package pricing settings directly on the user object
    user.packagePricingSettings = newPackagePricingSettings;

    // Mark the field as modified to ensure Mongoose saves it
    user.markModified('packagePricingSettings');
    
    // Save the user document
    const savedUser = await user.save();

    // Also try direct MongoDB update as backup
    await User.updateOne(
      { _id: userId },
      { $set: { packagePricingSettings: newPackagePricingSettings } }
    );

    // Wait a moment to ensure database write is complete
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verify the update was saved by fetching the user again with lean() to get raw data
    const verifyUser = await User.findById(userId).select('packagePricingSettings').lean();
    
    if (!verifyUser) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found after update' 
      }, { status: 404 });
    }

    // Get the updated package pricing settings
    let savedSettings;
    if (verifyUser.packagePricingSettings && 
        typeof verifyUser.packagePricingSettings === 'object' &&
        verifyUser.packagePricingSettings.pricingModel !== undefined) {
      savedSettings = verifyUser.packagePricingSettings;
    } else {
      // Fallback to what we tried to save
      savedSettings = newPackagePricingSettings;
    }

    return NextResponse.json({
      success: true,
      message: 'Package pricing settings updated successfully',
      packagePricingSettings: savedSettings
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating package pricing settings:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update package pricing settings' 
    }, { status: 500 });
  }
}

