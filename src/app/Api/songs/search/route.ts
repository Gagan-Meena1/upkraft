// app/api/songs/search/route.js - Updated MongoDB version
import { NextResponse } from 'next/server';
import { Song } from '@/models/Songs'; // Adjust path as needed
import mongoose from 'mongoose';
import {connect} from '@/dbConnection/dbConfic'

// Connect to MongoDB if not already connected
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await connect();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = parseInt(searchParams.get("limit")) || 50;
    const page = parseInt(searchParams.get("page")) || 1;
    const fileType = searchParams.get("fileType"); // 'audio' or 'tablature'
    const skip = (page - 1) * limit;
    
    console.log(`🔍 Searching for: "${q}"`);

    // Build search query
    let searchQuery = { isActive: { $ne: false } }; // Only active songs

    // Add file type filter if specified
    if (fileType && ['audio', 'tablature'].includes(fileType)) {
      searchQuery.fileType = fileType;
    }

    // Add text search if query provided
    if (q && q.length >= 1) {
      const searchRegex = new RegExp(q, 'i');
      searchQuery.$or = [
        { title: searchRegex },
        { artist: searchRegex },
        { filename: searchRegex },
        { primaryInstrumentFocus: searchRegex },
        { genre: searchRegex },
        { difficulty: searchRegex },
        { skills: searchRegex },
        { notes: searchRegex },
        { tags: { $in: [searchRegex] } },
        { searchText: searchRegex } // Use the searchText field for comprehensive search
      ];
    }

    // Execute search with pagination
    const [songs, totalCount] = await Promise.all([
      Song.find(searchQuery)
        .select('-__v -searchText') // Exclude version field and searchText from results
        .sort({ uploadDate: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .lean(), // Better performance
      Song.countDocuments(searchQuery)
    ]);

    console.log(`📊 Found ${totalCount} total results, returning ${songs.length} items`);

    // Transform results to match frontend expectations
    const items = songs.map(song => {
      // Parse title and artist from filename if needed
      let title = song.title || 'Untitled';
      let artist = song.artist || 'Unknown Artist';
      
      // If title contains numbers/underscores, try to parse from filename
      if (song.filename && (title === 'Untitled' || title.match(/^\d+/))) {
        const cleanFilename = song.filename.replace(/^\d+-\d+-/, '').replace(/\.[^.]+$/, '');
        const parts = cleanFilename.split('_').join(' ').split('-').join(' - ');
        
        if (parts.includes(' - ')) {
          const splitParts = parts.split(' - ');
          if (splitParts.length >= 2) {
            artist = splitParts[0].trim();
            title = splitParts.slice(1).join(' - ').trim();
          }
        } else {
          title = parts.trim();
        }
      }

      return {
        id: song._id.toString(),
        title: title,
        artist: artist,
        url: song.url,
        
        // New fields from schema
        primaryInstrumentFocus: song.primaryInstrumentFocus,
        genre: song.genre,
        difficulty: song.difficulty,
        year: song.year,
        notes: song.notes,
        skills: song.skills,
        
        // Keep some original fields for compatibility
        fileType: song.fileType,
        mimeType: song.mimeType,
        filename: song.filename,
        extension: song.extension,
        uploadedAt: song.uploadDate || song.createdAt,
        
        // Additional useful fields
        key: song.key,
        tempo: song.tempo,
        tuning: song.tuning,
        timeSignature: song.timeSignature,
        capo: song.capo,
        practiceLevel: song.practiceLevel,
        learningObjectives: song.learningObjectives,
        
        // Guitar Pro specific fields
        guitarProVersion: song.guitarProVersion,
        isGuitarProFile: song.fileType === 'tablature',
        isAudioFile: song.fileType === 'audio',
        
        // Stats
        downloadCount: song.downloadCount || 0,
        size: song.fileSize || 0,
        duration: song.duration || null,
      };
    });

    const response = NextResponse.json({
      items,
      total: items.length,
      totalCount,
      query: q,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + items.length < totalCount,
      searchedAt: new Date().toISOString(),
      fileType: fileType || 'all'
    });

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;

  } catch (error) {
    console.error("❌ Search error:", error);
    
    const fallbackResponse = NextResponse.json({
      items: [],
      total: 0,
      totalCount: 0,
      error: "Search temporarily unavailable",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });

    fallbackResponse.headers.set("Access-Control-Allow-Origin", "*");
    fallbackResponse.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    fallbackResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return fallbackResponse;
  }
}

// Handle preflight OPTIONS requests for CORS
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// Configure API route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';