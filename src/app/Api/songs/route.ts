import { NextRequest, NextResponse } from 'next/server';
import { Song } from '@/models/Songs';
import { connect } from '@/dbConnection/dbConfic';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

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
    const institution = searchParams.get('institution') || '';
    
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

    if (institution) {
      query.institution = { $regex: institution, $options: 'i' };
    }
    
    console.log('🔍 Query filters:', query);
    
    // Fetch songs with pagination
    const skip = (page - 1) * limit;
    
    const [songs, totalCount] = await Promise.all([
      Song.find(query)
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
          cloudinaryPublicId: 1,
          institution: 1 
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

export async function PUT(request: NextRequest) {
  try {
    console.log("Updating song");
    await connect();

    const contentType = request.headers.get("content-type") || "";
    let id;
    let updateData: any = {};

    // Handle File Upload (FormData)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      id = formData.get("id") as string;
      
      // Extract text fields
      updateData.title = formData.get("title") as string;
      updateData.artist = formData.get("artist") as string;
      updateData.genre = formData.get("genre") as string;
      updateData.difficulty = formData.get("difficulty") as string;
      updateData.primaryInstrumentFocus = formData.get("primaryInstrumentFocus") as string;
      updateData.year = formData.get("year") as string;
      updateData.skills = formData.get("skills") as string;
      updateData.institution = formData.get("institution") as string;

      const file = formData.get("file") as File | null;
      
      // If a new file is provided, save it
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), "public/uploads/music");
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const safeName = Date.now() + "-" + file.name.replace(/\s+/g, "_");
        const filePath = path.join(uploadDir, safeName);
        
        await writeFile(filePath, buffer);
        
        // Update file metadata
        updateData.url = `/uploads/music/${safeName}`;
        updateData.filename = safeName;
        updateData.mimeType = file.type;
        updateData.fileSize = file.size;
        
        const ext = path.extname(file.name).toLowerCase();
        updateData.extension = ext;
        updateData.fileType = (ext === '.mp3' || ext === '.wav') ? 'audio' : 'tablature';
      }

    } else {
      // Handle JSON (Metadata only)
      const body = await request.json();
      id = body.id;
      const { id: _, ...rest } = body;
      updateData = rest;
    }

    if (!id) {
      return NextResponse.json({ error: "Song ID is required" }, { status: 400 });
    }

    const song = await Song.findById(id);
    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Apply updates
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        song[key] = updateData[key];
      }
    });

    await song.save();
    return NextResponse.json({ message: "Song updated successfully", song });
    
  } catch (error: any) {
    console.error('💥 Error updating song:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update song',
        details: error?.message || 'Unknown error occurred',
      }, 
      { status: 500 }
    );
  }
}

// Configure API route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';