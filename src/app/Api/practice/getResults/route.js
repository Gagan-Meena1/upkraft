// pages/api/practice/getResults.js or app/api/practice/getResults/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConnection/dbConfic';
import { PianoResult, GuitarResult } from '@/models/practiceResult';
import User from '@/models/userModel';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // Connect to database
    await connect();

    // Get userId from query params or JWT token
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');

    // Check if userId is null, undefined, or the string "null"
    if (!userId || userId === 'null' || userId === 'undefined') {
      // Get token from cookies
      const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
      if (!token) {
        return NextResponse.json({ error: "No token found" }, { status: 401 });
      }
     
      const decodedToken = jwt.decode(token);
      if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
     
      userId = decodedToken.id;
    }

    // Final validation - ensure we have a valid userId
    if (!userId || userId === 'null' || userId === 'undefined') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).lean();

    // Fetch all results from both collections
    const pianoResults = await PianoResult.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    
    const guitarResults = await GuitarResult.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Combine all results
    const allResults = [...pianoResults, ...guitarResults];

    // Separate results by instrument type
    const results = {
      piano: allResults.filter(r => r.instrument === 'piano'),
      guitar: allResults.filter(r => r.instrument === 'guitar'),
      drums: allResults.filter(r => r.instrument === 'drums'),
      vocals: allResults.filter(r => r.instrument === 'vocals'),
      other: allResults.filter(r => r.instrument === 'other')
    };

    // Calculate stats
    const stats = {
      totalSessions: allResults.length,
      pianoSessions: results.piano.length,
      guitarSessions: results.guitar.length,
      drumsSessions: results.drums.length,
      vocalsSessions: results.vocals.length,
      otherSessions: results.other.length,
      lastActivity: null
    };

    // Find last activity
    if (allResults.length > 0) {
      stats.lastActivity = allResults.reduce((latest, current) => {
        return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
      }).createdAt;
    }

    return NextResponse.json({
      success: true,
      data: results,
      category: user.category,
      stats
    });

  } catch (error) {
    console.error('Error fetching practice results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice results', details: error.message },
      { status: 500 }
    );
  }
}