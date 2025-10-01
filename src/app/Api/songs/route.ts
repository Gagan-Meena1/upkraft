import { NextResponse } from 'next/server';
import { Song } from '@/models/Songs';
import { connect } from '@/dbConnection/dbConfic';

export async function GET(request: Request) {
  try {
    console.log('🔍 Fetching all songs...');
    
    // Connect to database
    await connect();
    
    // Parse URL parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1') || 1;
    const limit = parseInt(searchParams.get('limit') || '20') || 20;
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const instrument = searchParams.get('instrument') || '';
    
    // Build query filters with proper typing
    const query: any = {};
    
    // Only filter by isActive if the field exists in your schema
    // Comment this out if you don't have isActive field
    // query.isActive = { $ne: false };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (genre) {
      query.genre = genre;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (instrument) {
      query.primaryInstrumentFocus = instrument;
    }
    
    console.log('🔍 Query filters:', JSON.stringify(query));
    
    // Fetch songs with pagination
    const skip = (page - 1) * limit;
    
    // First, let's check if there are any songs at all
    const totalCount = await Song.countDocuments(query);
    console.log('📊 Total songs matching query:', totalCount);
    
    if (totalCount === 0) {
      // Check if there are ANY songs in the database
      const anySongs = await Song.countDocuments({});
      console.log('📊 Total songs in database:', anySongs);
    }
    
    const songs = await Song.find(query)
      .select({
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
      .sort({ uploadDate: -1, _id: -1 }) // Added _id as secondary sort
      .skip(skip)
      .limit(limit)
      .lean();
    
    console.log(`✅ Found ${songs.length} songs out of ${totalCount} total`);
    
    // Get unique values for filters
    const [genres, difficulties, instruments] = await Promise.all([
      Song.distinct('genre').catch(() => []),
      Song.distinct('difficulty').catch(() => []),
      Song.distinct('primaryInstrumentFocus').catch(() => [])
    ]);
    
    // Count file types
    const audioCount = await Song.countDocuments({ ...query, fileType: 'audio' }).catch(() => 0);
    const tablatureCount = await Song.countDocuments({ ...query, fileType: 'tablature' }).catch(() => 0);
    
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
        genres: genres.filter((g: any) => g).sort(),
        difficulties: ['Beginner', 'Beginner-Intermediate', 'Intermediate', 'Advanced', 'Expert'],
        instruments: instruments.filter((i: any) => i).sort()
      },
      summary: {
        totalSongs: totalCount,
        audioFiles: audioCount,
        tablatureFiles: tablatureCount,
        fetchedAt: new Date().toISOString()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 Error fetching songs:', error);
    
    // Type guard for error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    if (errorStack) {
      console.error('Stack trace:', errorStack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch songs',
        details: errorMessage,
        songs: [],
        pagination: { 
          currentPage: 1, 
          totalPages: 0, 
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        filters: { genres: [], difficulties: [], instruments: [] },
        summary: {
          totalSongs: 0,
          audioFiles: 0,
          tablatureFiles: 0,
          fetchedAt: new Date().toISOString()
        }
      }, 
      { status: 500 }
    );
  }
}

// Configure API route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';