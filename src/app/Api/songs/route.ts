import { NextResponse } from 'next/server';
import { Song } from '@/models/Songs';
import { connect } from '@/dbConnection/dbConfic'; // Adjust path as needed
export async function GET(request) {
  try {
    console.log('🔍 Fetching all songs...');
    
    // Connect to database
    await connect();
    
    // Parse URL parameters for filtering/pagination (optional)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 100; // Default to 100 songs
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const instrument = searchParams.get('instrument') || '';
    
    // Build query filters
    const query = { isActive: { $ne: false } }; // Only active songs
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { searchText: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (genre) {
      query.genre = genre;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (instrument) {
      query.primaryInstrumentFocus = { $regex: instrument, $options: 'i' };
    }
    
    console.log('🔍 Query filters:', query);
    
    // Fetch songs with pagination
    const skip = (page - 1) * limit;
    
    const [songs, totalCount] = await Promise.all([
      Song.find(query)
        .select({
          // Select only the fields we need for the table
          title: 1,
          artist: 1,
          primaryInstrumentFocus: 1,
          genre: 1,
          difficulty: 1,
          year: 1,
          notes: 1,
          skills: 1,
          url: 1,
          fileType: 1,
          extension: 1,
          fileSize: 1,
          uploadDate: 1,
          downloadCount: 1,
          cloudinaryPublicId: 1
        })
        .sort({ uploadDate: -1 }) // Latest first
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      
      Song.countDocuments(query)
    ]);
    
    console.log(`✅ Found ${songs.length} songs (${totalCount} total)`);
    
    // Get unique values for filters (useful for frontend dropdowns)
    const [genres, difficulties, instruments] = await Promise.all([
      Song.distinct('genre', { genre: { $exists: true, $ne: null } }),
      Song.distinct('difficulty', { difficulty: { $exists: true, $ne: null } }),
      Song.distinct('primaryInstrumentFocus', { primaryInstrumentFocus: { $exists: true, $ne: null } })
    ]);
    
    const response = {
      songs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      },
      filters: {
        genres: genres.sort(),
        difficulties: ['Beginner', 'Beginner-Intermediate', 'Intermediate', 'Advanced', 'Expert'],
        instruments: instruments.sort()
      },
      summary: {
        totalSongs: totalCount,
        audioFiles: await Song.countDocuments({ fileType: 'audio' }),
        tablatureFiles: await Song.countDocuments({ fileType: 'tablature' }),
        fetchedAt: new Date().toISOString()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 Error fetching songs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch songs',
        details: error?.message || 'Unknown error occurred',
        songs: [],
        pagination: { currentPage: 1, totalPages: 0, totalCount: 0 },
        filters: { genres: [], difficulties: [], instruments: [] }
      }, 
      { status: 500 }
    );
  }
}

// Configure API route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';