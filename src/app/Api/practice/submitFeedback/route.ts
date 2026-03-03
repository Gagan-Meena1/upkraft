import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import { PianoResult, GuitarResult } from '@/models/practiceResult';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connect();

    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const decodedToken = jwt.decode(token);
    const user = decodedToken && typeof decodedToken === 'object' ? decodedToken : null;

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { resultId, score, instrument, feedback } = await request.json();

    if (!resultId || score === undefined || !instrument) {
      return NextResponse.json(
        { success: false, error: 'Result ID, score, and instrument are required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Result ID format' },
        { status: 400 }
      );
    }

    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 1 || numericScore > 10) {
      return NextResponse.json(
        { success: false, error: 'Score must be a number between 1 and 10' },
        { status: 400 }
      );
    }

    const Model = instrument.toLowerCase() === 'piano' ? PianoResult : GuitarResult;
    
    const updatedResult = await Model.findByIdAndUpdate(
      resultId,
      { $set: { tutorScore: numericScore, tutorFeedback: feedback } },
      { new: true }
    );

    if (!updatedResult) {
      return NextResponse.json(
        { success: false, error: 'Practice result not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: updatedResult,
    });

  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit feedback',
        message: error.message || 'An internal server error occurred',
      },
      { status: 500 }
    );
  }
}