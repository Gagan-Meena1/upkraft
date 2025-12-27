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

    // Try using native MongoDB first for more reliable data retrieval
    const mongoose = await import('mongoose');
    const db = mongoose.default.connection.db;
    const usersCollection = db.collection('users');
    const objectId = new mongoose.default.Types.ObjectId(userId);
    
    // Get user using native MongoDB
    const userDoc = await usersCollection.findOne(
      { _id: objectId },
      { projection: { packagePricingSettings: 1 } }
    );

    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('GET /Api/academy/packagePricing - Raw user data (native MongoDB):', JSON.stringify(userDoc, null, 2));
    console.log('GET /Api/academy/packagePricing - User packagePricingSettings:', userDoc.packagePricingSettings);
    console.log('GET /Api/academy/packagePricing - Type of packagePricingSettings:', typeof userDoc.packagePricingSettings);
    console.log('GET /Api/academy/packagePricing - Is packagePricingSettings null/undefined?', userDoc.packagePricingSettings == null);

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

    // Check if packagePricingSettings exists in the actual database document
    let packagePricingSettings;
    if (userDoc.packagePricingSettings && 
        typeof userDoc.packagePricingSettings === 'object' &&
        userDoc.packagePricingSettings.pricingModel !== undefined) {
      // Field exists in database and has valid data
      packagePricingSettings = userDoc.packagePricingSettings;
      console.log('GET /Api/academy/packagePricing - Using saved settings from DB');
      console.log('GET /Api/academy/packagePricing - Saved pricingModel:', packagePricingSettings.pricingModel);
      console.log('GET /Api/academy/packagePricing - Saved packagePricing length:', packagePricingSettings.packagePricing?.length || 0);
      console.log('GET /Api/academy/packagePricing - Saved monthlySubscriptionPricing length:', packagePricingSettings.monthlySubscriptionPricing?.length || 0);
    } else {
      // Field doesn't exist or is empty - use defaults
      packagePricingSettings = defaultSettings;
      console.log('GET /Api/academy/packagePricing - Using default settings (field not found in DB)');
    }

    console.log('GET /Api/academy/packagePricing - Returning:', JSON.stringify(packagePricingSettings, null, 2));

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
    const { pricingModel, packagePricing, monthlySubscriptionPricing, applyToAll, selectedStudentIds } = body;

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

    // If Monthly Subscription model is selected, validate monthlySubscriptionPricing array
    if (pricingModel === 'Monthly Subscription') {
      if (!Array.isArray(monthlySubscriptionPricing) || monthlySubscriptionPricing.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: 'Monthly subscription pricing array is required when Monthly Subscription model is selected' 
        }, { status: 400 });
      }

      // Validate each subscription in the array
      const validMonths = [1, 3, 6, 9, 12];
      for (const subscription of monthlySubscriptionPricing) {
        if (subscription.months === undefined || !validMonths.includes(subscription.months)) {
          return NextResponse.json({ 
            success: false,
            error: 'Each subscription must have a valid months value (1, 3, 6, 9, or 12)' 
          }, { status: 400 });
        }
        if (subscription.discount === undefined || subscription.discount < 0 || subscription.discount > 100) {
          return NextResponse.json({ 
            success: false,
            error: 'Each subscription must have a valid discount value (0-100)' 
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

    // Get existing settings to preserve the inactive model's data
    const existingSettings = user.packagePricingSettings || {};
    
    // Create the package pricing settings object
    // Preserve both arrays so students can see both models
    const newPackagePricingSettings = {
      pricingModel: pricingModel,
      packagePricing: pricingModel === 'Package' ? packagePricing : (existingSettings.packagePricing || []),
      monthlySubscriptionPricing: pricingModel === 'Monthly Subscription' ? monthlySubscriptionPricing : (existingSettings.monthlySubscriptionPricing || []),
      applyToAll: applyToAll !== undefined ? applyToAll : true,
      selectedStudentIds: Array.isArray(selectedStudentIds) ? selectedStudentIds : []
    };

    console.log('PUT /Api/academy/packagePricing - Saving settings:', JSON.stringify(newPackagePricingSettings, null, 2));

    // Use native MongoDB for more reliable persistence
    const mongoose = await import('mongoose');
    const db = mongoose.default.connection.db;
    const usersCollection = db.collection('users');
    const objectId = new mongoose.default.Types.ObjectId(userId);

    // Use native MongoDB update
    const updateResult = await usersCollection.updateOne(
      { _id: objectId },
      { $set: { packagePricingSettings: newPackagePricingSettings } }
    );

    console.log('PUT /Api/academy/packagePricing - Native MongoDB update result:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged
    });

    // Also try Mongoose save as backup
    user.packagePricingSettings = newPackagePricingSettings;
    user.markModified('packagePricingSettings');
    await user.save();

    // Update students' pricing settings
    if (newPackagePricingSettings.applyToAll) {
      // Apply to all students in this academy
      const studentsCollection = db.collection('users');
      const academyObjectId = new mongoose.default.Types.ObjectId(userId);
      await studentsCollection.updateMany(
        { 
          category: 'Student',
          academyId: academyObjectId
        },
        { 
          $set: { 
            appliedPricingSettings: {
              academyId: userId,
              pricingModel: newPackagePricingSettings.pricingModel,
              packagePricing: newPackagePricingSettings.packagePricing,
              monthlySubscriptionPricing: newPackagePricingSettings.monthlySubscriptionPricing,
              appliedAt: new Date()
            }
          } 
        }
      );
    } else if (Array.isArray(selectedStudentIds) && selectedStudentIds.length > 0) {
      // Apply to selected students only
      const studentsCollection = db.collection('users');
      const studentObjectIds = selectedStudentIds.map((id: string) => new mongoose.default.Types.ObjectId(id));
      await studentsCollection.updateMany(
        { 
          _id: { $in: studentObjectIds },
          category: 'Student'
        },
        { 
          $set: { 
            appliedPricingSettings: {
              academyId: userId,
              pricingModel: newPackagePricingSettings.pricingModel,
              packagePricing: newPackagePricingSettings.packagePricing,
              monthlySubscriptionPricing: newPackagePricingSettings.monthlySubscriptionPricing,
              appliedAt: new Date()
            }
          } 
        }
      );
    }

    // Wait a moment to ensure database write is complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify the update was saved using native MongoDB
    const verifyDoc = await usersCollection.findOne(
      { _id: objectId },
      { projection: { packagePricingSettings: 1 } }
    );
    
    if (!verifyDoc) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found after update' 
      }, { status: 404 });
    }

    console.log('PUT /Api/academy/packagePricing - Verification (native MongoDB):', JSON.stringify(verifyDoc.packagePricingSettings, null, 2));

    // Get the updated package pricing settings
    let savedSettings;
    if (verifyDoc.packagePricingSettings && 
        typeof verifyDoc.packagePricingSettings === 'object' &&
        verifyDoc.packagePricingSettings.pricingModel !== undefined) {
      savedSettings = verifyDoc.packagePricingSettings;
      console.log('PUT /Api/academy/packagePricing - Using verified settings from DB');
    } else {
      // Fallback to what we tried to save
      savedSettings = newPackagePricingSettings;
      console.log('PUT /Api/academy/packagePricing - Using fallback settings (DB verification failed)');
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

