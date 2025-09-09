// app/api/songs/batch-upload-with-excel/route.js
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Song } from '@/models/Songs';
import { connect } from '@/dbConnection/dbConfic';
import * as XLSX from 'xlsx';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    await connect();
    console.log('🚀 Starting enhanced batch upload with Excel data...');
    
    const data = await request.formData();
    const files = data.getAll('files');
    const excelFile = data.get('excelFile'); // The Excel spreadsheet
    
    console.log(`📁 Received ${files.length} song files`);
    console.log(`📊 Excel file: ${excelFile ? excelFile.name : 'Not provided'}`);
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No song files found' }, { status: 400 });
    }

    if (!excelFile) {
      return NextResponse.json({ error: 'Excel file is required' }, { status: 400 });
    }

    // Parse Excel file
    let songDatabase = [];
    try {
      const excelBuffer = Buffer.from(await excelFile.arrayBuffer());
      const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      // Clean and normalize the Excel data
      songDatabase = rawData.map(row => ({
        song: row.Song?.toString().trim() || '',
        artist: row.Artist?.toString().trim() || '',
        primaryInstrumentFocus: row.Primary_Instrument_Focus?.toString().trim() || '',
        genre: row.Genre?.toString().trim() || '',
        difficulty: row.Difficulty?.toString().trim() || '',
        year: row.Year ? parseInt(row.Year) : null,
        notes: row.Notes?.toString().trim() || '',
        skills: row.Skills?.toString().trim() || '',
        // Add more fields as they appear in your Excel
      }));
      
      console.log(`📋 Parsed ${songDatabase.length} songs from Excel`);
      console.log('📝 Sample Excel data:', songDatabase.slice(0, 2));
      
    } catch (error) {
      console.error('❌ Error parsing Excel file:', error);
      return NextResponse.json({ error: 'Failed to parse Excel file' }, { status: 400 });
    }

    // Define allowed file extensions
    const allowedExtensions = [
      '.mp3', '.gp', '.gp1', '.gp2', '.gp3', '.gp4', '.gp5', 
      '.gp6', '.gp7', '.gp8', '.gpx', '.dp', '.mxl'
    ];

    const results = {
      success: 0,
      failed: 0,
      errors: [],
      uploadedFiles: [],
      matchingStats: {
        matched: 0,
        unmatched: 0,
        duplicatesSkipped: 0
      }
    };

    // Helper function to find matching song data
    const findSongData = (filename) => {
      // Clean filename for matching (remove extension and clean up)
      const cleanFilename = filename
        .toLowerCase()
        .replace(/\.(gp\d?|gpx?|dp|mp3)$/i, '') // Remove extensions
        .replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      console.log(`🔍 Looking for match for: "${cleanFilename}"`);

      // Try different matching strategies
      const strategies = [
        // Strategy 1: Exact match with song name
        (clean, song) => clean === song.song.toLowerCase().replace(/\s+/g, ' ').trim(),
        
        // Strategy 2: Check if filename contains song name
        (clean, song) => clean.includes(song.song.toLowerCase().replace(/\s+/g, ' ').trim()),
        
        // Strategy 3: Check if song name contains filename
        (clean, song) => song.song.toLowerCase().replace(/\s+/g, ' ').trim().includes(clean),
        
        // Strategy 4: Fuzzy match - check if most words match
        (clean, song) => {
          const fileWords = clean.split(' ').filter(w => w.length > 2);
          const songWords = song.song.toLowerCase().split(' ').filter(w => w.length > 2);
          const matchedWords = fileWords.filter(word => 
            songWords.some(songWord => songWord.includes(word) || word.includes(songWord))
          );
          return matchedWords.length >= Math.min(fileWords.length * 0.6, songWords.length * 0.6);
        }
      ];

      // Try each strategy
      for (let i = 0; i < strategies.length; i++) {
        const match = songDatabase.find(song => strategies[i](cleanFilename, song));
        if (match) {
          console.log(`✅ Match found using strategy ${i + 1}: "${match.song}" by ${match.artist}`);
          return match;
        }
      }

      console.log(`❌ No match found for: "${cleanFilename}"`);
      return null;
    };

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n📤 Processing file ${i + 1}/${files.length}: ${file.name}`);
      
      try {
        // Validate file extension
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        if (!allowedExtensions.includes(fileExtension)) {
          throw new Error(`Invalid file type: ${fileExtension}`);
        }

        // Check file size (max 15MB)
        const maxSize = 15 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }

        // Find matching song data from Excel
        const songMetadata = findSongData(file.name);
        if (!songMetadata) {
          results.matchingStats.unmatched++;
          console.log(`⚠️ No Excel match found for ${file.name}, using filename data`);
        } else {
          results.matchingStats.matched++;
        }

        // Check for duplicates in database
        const title = songMetadata?.song || file.name.split('.')[0].replace(/[_-]/g, ' ');
        const artist = songMetadata?.artist || 'Unknown Artist';
        
        const existingSong = await Song.findOne({ 
          title: { $regex: new RegExp(`^${title}$`, 'i') },
          artist: { $regex: new RegExp(`^${artist}$`, 'i') }
        });

        if (existingSong) {
          results.matchingStats.duplicatesSkipped++;
          console.log(`⏭️ Skipping duplicate: "${title}" by ${artist}`);
          continue;
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Determine file type
        const isAudioFile = ['.mp3'].includes(fileExtension);
        const resourceType = isAudioFile ? 'video' : 'raw';

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadOptions = {
            resource_type: resourceType,
            folder: 'music-app/songs',
            public_id: `${Date.now()}-${file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_')}`,
            overwrite: false,
            context: {
              original_name: file.name,
              file_type: fileExtension,
              upload_date: new Date().toISOString(),
              title: title,
              artist: artist
            }
          };

          if (isAudioFile) {
            uploadOptions.audio_codec = 'mp3';
            uploadOptions.audio_frequency = '44100';
          }

          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                console.error('❌ Cloudinary error:', error);
                reject(error);
              } else {
                console.log('✅ Upload successful:', result.public_id);
                resolve(result);
              }
            }
          );
          
          uploadStream.end(buffer);
        });

        // Prepare song data with Excel metadata
        const songData = {
          // Basic info
          title: title,
          artist: artist,
          filename: file.name,
          mimeType: file.type || 'application/octet-stream',
          url: uploadResult.secure_url,
          fileType: isAudioFile ? 'audio' : 'tablature',
          extension: fileExtension,
          fileSize: uploadResult.bytes,
          
          // Cloudinary fields
          cloudinaryPublicId: uploadResult.public_id,
          cloudinaryResourceType: resourceType,
          cloudinaryFolder: 'music-app/songs',
          
          // Excel metadata (use Excel data if available, fallback to defaults)
          primaryInstrumentFocus: songMetadata?.primaryInstrumentFocus || 'Guitar',
          genre: songMetadata?.genre || 'Unknown',
          difficulty: songMetadata?.difficulty || 'Beginner',
          year: songMetadata?.year || null,
          notes: songMetadata?.notes || '',
          skills: songMetadata?.skills || '',
          
          // Guitar Pro specific
          guitarProVersion: fileExtension.match(/gp(\d+)/)?.[1] || (fileExtension === '.gp' ? 'legacy' : null),
          duration: uploadResult.duration || null,
          
          // Additional defaults
          tuning: 'E A D G B E',
          timeSignature: '4/4',
          capo: 0,
          downloadCount: 0,
          isActive: true
        };

        // Save to database
        const savedSong = await Song.create(songData);
        console.log('💾 Saved to database:', savedSong._id);

        results.success++;
        results.uploadedFiles.push({
          id: savedSong._id,
          title: savedSong.title,
          artist: savedSong.artist,
          filename: file.name,
          url: uploadResult.secure_url,
          genre: savedSong.genre,
          difficulty: savedSong.difficulty,
          year: savedSong.year,
          matchedFromExcel: !!songMetadata,
          uploadedAt: new Date().toISOString()
        });

      } catch (error) {
        console.error(`❌ Error uploading ${file.name}:`, error.message);
        results.failed++;
        results.errors.push(`${file.name}: ${error.message}`);
      }
    }

    console.log(`\n🎉 Enhanced batch upload complete!`);
    console.log(`📊 Results:`, results.matchingStats);
    
    return NextResponse.json({
      ...results,
      summary: {
        totalFiles: files.length,
        successRate: ((results.success / files.length) * 100).toFixed(1) + '%',
        matchingRate: ((results.matchingStats.matched / files.length) * 100).toFixed(1) + '%',
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 Server error:', error);
    return NextResponse.json(
      { 
        error: 'Server error during enhanced upload',
        details: error?.message || 'Unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';