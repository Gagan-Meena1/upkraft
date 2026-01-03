import { NextRequest, NextResponse } from 'next/server';
import { Song } from '@/models/Songs';
import { connect } from '@/dbConnection/dbConfic';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting song...');
    await connect();

    // Get song ID, title, or artist from query parameter or request body
    const { searchParams } = new URL(request.url);
    let songId = searchParams.get('id');
    let title = searchParams.get('title');
    let artist = searchParams.get('artist');

    // If not in query params, try to get from request body
    if (!songId || !title || !artist) {
      try {
        const body = await request.json();
        songId = songId || body.id;
        title = title || body.title;
        artist = artist || body.artist;
      } catch (e) {
        // Request body might be empty, that's okay
      }
    }

    // If no ID provided, try to find by title and artist
    if (!songId && title && artist) {
      console.log(`🔍 Searching for song by title and artist: "${title}" by ${artist}`);
      const songByTitle = await Song.findOne({
        title: { $regex: new RegExp(`^${title}$`, 'i') },
        artist: { $regex: new RegExp(`^${artist}$`, 'i') }
      });
      
      if (songByTitle) {
        songId = songByTitle._id.toString();
        console.log(`✅ Found song by title/artist. ID: ${songId}`);
      } else {
        return NextResponse.json(
          { 
            error: 'Song not found by title and artist',
            searchedTitle: title,
            searchedArtist: artist,
            hint: 'Make sure the title and artist match exactly (case-insensitive)'
          },
          { status: 404 }
        );
      }
    }

    if (!songId) {
      return NextResponse.json(
        { 
          error: 'Song identifier is required. Provide either:',
          options: [
            'Query parameter: ?id=...',
            'Request body: { "id": "..." }',
            'Query parameters: ?title=...&artist=...',
            'Request body: { "title": "...", "artist": "..." }'
          ]
        },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return NextResponse.json(
        { 
          error: 'Invalid song ID format',
          receivedId: songId,
          hint: 'Song ID must be a valid MongoDB ObjectId (24 character hex string)'
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Looking for song with ID: ${songId}`);

    // Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(songId);

    // Try to find the song - search without any filters (including isActive)
    // This ensures we can delete even if the song is marked as inactive
    let song = await Song.findById(objectId);
    
    // If not found with findById, try findOne with _id
    if (!song) {
      console.log(`⚠️ Song not found with findById, trying findOne with _id...`);
      song = await Song.findOne({ _id: objectId });
    }
    
    // Also try without ObjectId wrapper (string match)
    if (!song) {
      console.log(`⚠️ Song not found with ObjectId, trying string match...`);
      song = await Song.findOne({ _id: songId });
    }
    
    if (!song) {
      // Get some sample songs to help debug
      const sampleSongs = await Song.find({}).select('_id title artist').limit(10).lean();
      const sampleIds = sampleSongs.map(s => ({
        id: s._id.toString(),
        title: s.title,
        artist: s.artist
      }));
      
      // Also check if there's a song with a similar ID (maybe a typo)
      const similarIdSongs = await Song.find({
        $or: [
          { _id: { $gte: objectId } },
          { _id: { $lte: objectId } }
        ]
      }).select('_id title artist').limit(5).lean();
      
      console.log(`📋 Sample song IDs in database:`, sampleIds);
      console.log(`🔍 Searched for ID: ${songId} (ObjectId: ${objectId.toString()})`);
      
      return NextResponse.json(
        { 
          error: 'Song not found',
          receivedId: songId,
          objectIdFormat: objectId.toString(),
          sampleSongs: sampleIds,
          similarIds: similarIdSongs.map(s => ({
            id: s._id.toString(),
            title: s.title,
            artist: s.artist
          })),
          hint: 'The song ID might be incorrect, or the song may have already been deleted. Check the sample songs above to find the correct ID.'
        },
        { status: 404 }
      );
    }

    console.log(`✅ Found song: "${song.title}" by ${song.artist}`);

    const deletionResults = {
      songId: song._id.toString(),
      title: song.title,
      artist: song.artist,
      localFileDeleted: false,
      cloudinaryFileDeleted: false,
      databaseDeleted: false,
      errors: [] as string[]
    };

    // Delete local file if it exists
    if (song.url && song.url.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', song.url);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted local file: ${filePath}`);
          deletionResults.localFileDeleted = true;
        } else {
          console.log(`⚠️ Local file not found: ${filePath}`);
        }
      } catch (localFileError: any) {
        console.error(`❌ Error deleting local file:`, localFileError.message);
        deletionResults.errors.push(`Local file: ${localFileError.message}`);
        // Continue with other deletions even if local file deletion fails
      }
    }

    // Delete from Cloudinary if cloudinaryPublicId exists
    if (song.cloudinaryPublicId) {
      try {
        console.log(`☁️ Deleting from Cloudinary: ${song.cloudinaryPublicId}`);
        
        // Determine resource type for deletion
        const resourceType = song.cloudinaryResourceType || 
          (song.fileType === 'audio' ? 'video' : 'raw');
        
        const cloudinaryResult = await cloudinary.uploader.destroy(
          song.cloudinaryPublicId,
          { 
            resource_type: resourceType,
            invalidate: true 
          }
        );
        
        console.log(`✅ Cloudinary deletion result:`, cloudinaryResult.result);
        
        if (cloudinaryResult.result === 'ok' || cloudinaryResult.result === 'not found') {
          deletionResults.cloudinaryFileDeleted = true;
        } else {
          console.warn(`⚠️ Cloudinary deletion warning: ${cloudinaryResult.result}`);
          deletionResults.errors.push(`Cloudinary: ${cloudinaryResult.result}`);
        }
      } catch (cloudinaryError: any) {
        console.error(`❌ Cloudinary deletion error:`, cloudinaryError.message);
        deletionResults.errors.push(`Cloudinary: ${cloudinaryError.message}`);
        // Continue with database deletion even if Cloudinary fails
      }
    } else {
      console.log(`ℹ️ No Cloudinary public ID found for this song`);
    }

    // Delete from database
    try {
      await Song.findByIdAndDelete(songId);
      console.log(`✅ Deleted from database: ${songId}`);
      deletionResults.databaseDeleted = true;
    } catch (dbError: any) {
      console.error(`❌ Database deletion error:`, dbError.message);
      deletionResults.errors.push(`Database: ${dbError.message}`);
      return NextResponse.json(
        { 
          error: 'Failed to delete song from database',
          details: dbError.message,
          partialResults: deletionResults
        },
        { status: 500 }
      );
    }

    console.log(`🎉 Song deletion complete!`);

    return NextResponse.json({
      success: true,
      message: 'Song deleted successfully',
      deletedSong: {
        id: deletionResults.songId,
        title: deletionResults.title,
        artist: deletionResults.artist
      },
      deletionDetails: {
        localFileDeleted: deletionResults.localFileDeleted,
        cloudinaryFileDeleted: deletionResults.cloudinaryFileDeleted,
        databaseDeleted: deletionResults.databaseDeleted,
        errors: deletionResults.errors.length > 0 ? deletionResults.errors : undefined
      },
      deletedAt: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('💥 Error deleting song:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete song',
        details: error?.message || 'Unknown error occurred',
      }, 
      { status: 500 }
    );
  }
}

// Configure API route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';