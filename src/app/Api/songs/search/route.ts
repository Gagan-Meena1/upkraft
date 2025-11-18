// app/api/songs/search/route.js - MongoDB version
import { NextResponse } from 'next/server';
import { Song } from '@/models/Songs'; // Adjust path as needed
import { connect } from '@/dbConnection/dbConfic';

export async function GET(req) {
  try {
    await connect();
    
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = parseInt(searchParams.get("limit")) || 50;
    const page = parseInt(searchParams.get("page")) || 1;
    const fileType = searchParams.get("fileType"); // 'audio' or 'tablature'
    const skip = (page - 1) * limit;
    
    console.log(`🔍 Searching for: "${q}"`);

    // Build search query
    let searchQuery: any = { isActive: { $ne: false } }; // Only active songs

    // Add file type filter if specified
    if (fileType && ['audio', 'tablature'].includes(fileType)) {
      searchQuery.fileType = fileType;
    }

    // Add text search if query provided - use regex search (more reliable, no index required)
    if (q && q.length >= 1) {
      const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      searchQuery.$or = [
        { title: searchRegex },
        { artist: searchRegex },
        { filename: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Execute search with pagination
    const [songs, totalCount] = await Promise.all([
      Song.find(searchQuery)
        .select('-__v') // Exclude version field
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
        url: song.url, // Keep as-is, frontend will handle URL construction
        type: song.extension || song.fileType || 'file',
        format: song.extension?.replace('.', '') || '',
        size: song.fileSize || 0,
        duration: song.duration || null,
        uploadedAt: song.uploadDate || song.createdAt,
        tags: `${title} ${artist} ${song.extension || ''} ${song.fileType || ''}`.toLowerCase(),
        
        // Additional metadata for frontend
        fileType: song.fileType,
        mimeType: song.mimeType,
        filename: song.filename,
        extension: song.extension,
        isGuitarProFile: song.fileType === 'tablature',
        isAudioFile: song.fileType === 'audio',
        
        // Guitar Pro specific fields
        guitarProVersion: song.guitarProVersion,
        tuning: song.tuning,
        tempo: song.tempo,
        difficulty: song.difficulty,
        
        // Stats
        downloadCount: song.downloadCount || 0,
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

  } catch (error: any) {
    console.error("❌ Search error:", error);
    console.error("❌ Error details:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.split('\n').slice(0, 3).join('\n')
    });
    
    const fallbackResponse = NextResponse.json({
      items: [],
      total: 0,
      totalCount: 0,
      error: "Search temporarily unavailable",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
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