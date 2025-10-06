import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import mongoose from 'mongoose';

const referTutorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    trim: true,
    lowercase: true,
  },
  mobile: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    trim: true,
  },
  cityAndCountry: {
    type: String,
    required: [true, 'Please provide city and country'],
    trim: true,
  },
  primaryInstrument: {
    type: String,
    required: [true, 'Please select a primary instrument'],
  },
  experienceInYears: {
    type: Number,
    required: [true, 'Please provide years of experience'],
  },
  preferredContactTime: {
    type: String,
    required: [true, 'Please provide preferred contact time'],
  },
  referralCode: {
    type: String,
    required: [true, 'Please provide a referral code'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const ReferTutorModel = mongoose.models.ReferTutor || mongoose.model('ReferTutor', referTutorSchema);

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();

    const {
      name,
      email,
      mobile,
      cityAndCountry,
      primaryInstrument,
      experienceInYears,
      preferredContactTime,
      referralCode,
    } = body;

    if (!name || !email || !mobile || !cityAndCountry || !primaryInstrument || 
        !experienceInYears || !preferredContactTime || !referralCode) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    const newReferTutor = new ReferTutorModel({
      name,
      email,
      mobile,
      cityAndCountry,
      primaryInstrument,
      experienceInYears: Number(experienceInYears),
      preferredContactTime,
      referralCode,
    });

    await newReferTutor.save();


    return NextResponse.json({
      success: true,
      message: 'Tutor referral submitted successfully!',
      data: {
        id: newReferTutor._id,
        name: newReferTutor.name,
        email: newReferTutor.email,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting tutor referral:', error);
    
    if (error instanceof Error && error.name === 'MongoError' && (error as any).code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'This tutor has already been referred.'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connect();
    
      const referrals = await ReferTutorModel.find().sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: referrals
    });
  } catch (error) {
    console.error('Error fetching tutor referrals:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}