// pages/api/practice/getResults.js or app/api/practice/getResults/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConnection/dbConfic'; // Adjust path as needed
import { PianoResult, GuitarResult } from '@/models/practiceResult'; // Adjust path as needed
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
      const token = request.cookies.get("token")?.value;
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

    // Get instrument filter if provided
    const instrument = searchParams.get('instrument');

    let results = {};

    if (!instrument || instrument === 'piano') {
      // Fetch piano results
      const pianoResults = await PianoResult.find({ userId })
        .sort({ createdAt: -1 })
        .lean();
      results.piano = pianoResults;
    }

    if (!instrument || instrument === 'guitar') {
      // Fetch guitar results
      const guitarResults = await GuitarResult.find({ userId })
        .sort({ createdAt: -1 })
        .lean();
      results.guitar = guitarResults;
    }

    // Calculate some stats
    const stats = {
      totalSessions: (results.piano?.length || 0) + (results.guitar?.length || 0),
      pianoSessions: results.piano?.length || 0,
      guitarSessions: results.guitar?.length || 0,
      lastActivity: null
    };

    // Find last activity
    const allResults = [...(results.piano || []), ...(results.guitar || [])];
    if (allResults.length > 0) {
      stats.lastActivity = allResults.reduce((latest, current) => {
        return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
      }).createdAt;
    }

    return NextResponse.json({
      success: true,
      data: results,
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