// app/api/songs/batch-upload-with-excel/route.js
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Song } from '@/models/Songs';
import { connect } from '@/dbConnection/dbConfic';
import * as XLSX from 'xlsx';

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
    const excelFile = data.get('excelFile');
    
    console.log(`📁 Received ${files.length} song files`);
    console.log(`📊 Excel file: ${excelFile ? excelFile.name : 'Not provided'}`);
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No song files found' }, { status: 400 });
    }

    if (!excelFile) {
      return NextResponse.json({ error: 'Excel file is required' }, { status: 400 });
    }

    let songDatabase = [];
    try {
      const excelBuffer = Buffer.from(await excelFile.arrayBuffer());
      const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('🔍 Excel Headers:', Object.keys(rawData[0] || {}));
      
      songDatabase = rawData.map(row => ({
  song: row.Song?.toString().trim().replace(/\([^)]*\)/g, '').trim() || '',  // ← Remove brackets HERE
  artist: row.Artist?.toString().trim() || '',
  primaryInstrumentFocus: row.Primary_Instrument_Focus?.toString().trim() || '',
  genre: row.Genre?.toString().trim() || '',
  difficulty: row.Difficulty?.toString().trim() || '',
  year: row.Year ? parseInt(row.Year) : null,
  notes: row.Notes?.toString().trim() || '',
  skills: row.Skills?.toString().trim() || '',
  
}));
      
      
      console.log(`📋 Parsed ${songDatabase.length} songs from Excel`);
      console.log('📝 First 3 songs:', songDatabase.slice(0, 3).map(s => `"${s.song}" by ${s.artist}`));
      
    } catch (error) {
      console.error('❌ Error parsing Excel file:', error);
      return NextResponse.json({ 
        error: 'Failed to parse Excel file',
        details: error.message 
      }, { status: 400 }); 
    }

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

    const normalizeString = (str) => {

  return str
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[''`]/g, '')
    .replace(/\btumhi\b/g, 'tum hi')      // ← ADD THIS: normalize "tumhi" to "tum hi"
    .replace(/[_-]/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

    // Add this improved findSongData function with better matching

const findSongData = (filename) => {
  const cleanFilename = filename
    .toLowerCase()
    .replace(/\.(gp\d?|gpx?|dp|mp3|mxl)$/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  console.log(`\n🔍 Matching: "${filename}" → cleaned: "${cleanFilename}"`);

  // Extract potential artist from filename (usually at end)
  const filenameParts = cleanFilename.split(' ');
  const possibleArtistInFilename = filenameParts.slice(-2).join(' '); // last 2 words

  const strategies = [
    // Strategy 1: Exact match (case-insensitive)
    (clean, song) => {
      const normalizedSong = normalizeString(song.song);
      const normalizedFile = normalizeString(clean);
      return normalizedSong === normalizedFile;
    },
    
    // Strategy 2: File contains song title
    (clean, song) => {
      const normalizedSong = normalizeString(song.song);
      const normalizedFile = normalizeString(clean);
      return normalizedFile.length >= 3 && normalizedFile.includes(normalizedSong);
    },
    
    // Strategy 3: Song title contains file
    (clean, song) => {
      const normalizedSong = normalizeString(song.song);
      const normalizedFile = normalizeString(clean);
      return normalizedSong.length >= 3 && normalizedSong.includes(normalizedFile);
    },
    
    // Strategy 4: Check if artist name is in filename
    (clean, song) => {
      if (!song.artist || song.artist === 'Unknown Artist') return false;
      
      const normalizedArtist = normalizeString(song.artist);
      const normalizedFile = normalizeString(clean);
      
      // Split artist by "/" or "&" to handle multiple artists
      const artistNames = normalizedArtist.split(/[\/&]/).map(a => a.trim());
      
      // Check if any artist name is in filename
      const artistInFilename = artistNames.some(artist => {
        const artistWords = artist.split(' ').filter(w => w.length > 2);
        return artistWords.some(word => normalizedFile.includes(word));
      });
      
      if (!artistInFilename) return false;
      
      // Now check if song title words are in filename
      const normalizedSong = normalizeString(song.song);
      const songWords = normalizedSong.split(' ').filter(w => w.length > 2);
      const fileWords = normalizedFile.split(' ');
      
      // Count matching words
      const matchingWords = songWords.filter(songWord => 
        fileWords.some(fileWord => {
          // Handle "tumhi" vs "tum hi" - check if they're similar
          if (songWord === fileWord) return true;
          if (fileWord.includes(songWord) || songWord.includes(fileWord)) {
            const longer = fileWord.length > songWord.length ? fileWord : songWord;
            const shorter = fileWord.length > songWord.length ? songWord : fileWord;
            return shorter.length >= 3 && shorter.length / longer.length >= 0.7;
          }
          return false;
        })
      );
      
      // Require at least 60% of song words to match
      return matchingWords.length >= songWords.length * 0.6;
    },
    
   // Strategy 5: Fuzzy word matching (70% threshold)
(clean, song) => {
  const normalizedSong = normalizeString(song.song);
  const fileWords = normalizeString(clean).split(' ').filter(w => w.length > 2);
  const songWords = normalizedSong.split(' ').filter(w => w.length > 2);
  
  if (fileWords.length === 0 || songWords.length === 0) return false;
  
  const matchedWords = fileWords.filter(word => 
    songWords.some(songWord => {
      const longer = word.length > songWord.length ? word : songWord;
      const shorter = word.length > songWord.length ? songWord : word;
      
      // Exact match or very similar
      return word === songWord || 
             (shorter.length >= 3 && longer.startsWith(shorter) && shorter.length / longer.length >= 0.6);
    })
  );
  
  // Require 70% match (changed from 85%)
  const matchThreshold = 0.70;
  return matchedWords.length >= Math.min(fileWords.length, songWords.length) * matchThreshold;
}
  ];

  // Try each strategy
  for (let i = 0; i < strategies.length; i++) {
    const match = songDatabase.find(song => strategies[i](cleanFilename, song));
    if (match) {
      console.log(`   ✅ Strategy ${i + 1} matched: "${match.song}" by ${match.artist}`);
      console.log(`   📊 Fields: ${match.primaryInstrumentFocus} | ${match.genre} | ${match.difficulty}`);
      return match;
    }
  }

  console.log(`   ❌ No match found`);
  return null;
};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📤 [${i + 1}/${files.length}] Processing: ${file.name}`);
      
      try {
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        if (!allowedExtensions.includes(fileExtension)) {
          throw new Error(`Invalid file type: ${fileExtension}`);
        }

        const maxSize = 15 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }

        const songMetadata = findSongData(file.name);
        
        if (!songMetadata) {
          results.matchingStats.unmatched++;
          console.log(`   ⚠️ Using filename only (no Excel match)`);
        } else {
          results.matchingStats.matched++;
        }

        const title = songMetadata?.song || file.name.split('.')[0].replace(/[_-]/g, ' ');
        const artist = songMetadata?.artist || 'Unknown Artist';
        
        const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedArtist = artist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        const existingSong = await Song.findOne({ 
          title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') },
          artist: { $regex: new RegExp(`^${escapedArtist}$`, 'i') },
          extension: fileExtension
        });

        // if (existingSong) {
        //   results.matchingStats.duplicatesSkipped++;
        //   console.log(`   ⏭️ SKIPPED (duplicate): "${title}" by ${artist} [${fileExtension}]`);
        //   continue;
        // }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const isAudioFile = ['.mp3'].includes(fileExtension);
        const resourceType = isAudioFile ? 'video' : 'raw';

        console.log(`   ☁️ Uploading to Cloudinary...`);

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
                console.error('   ❌ Cloudinary error:', error);
                reject(error);
              } else {
                console.log('   ✅ Cloudinary success');
                resolve(result);
              }
            }
          );
          
          uploadStream.end(buffer);
        });

        const songData = {
          title: title,
          artist: artist,
          filename: file.name,
          mimeType: file.type || 'application/octet-stream',
          url: uploadResult.secure_url,
          fileType: isAudioFile ? 'audio' : 'tablature',
          extension: fileExtension,
          fileSize: uploadResult.bytes,
          
          cloudinaryPublicId: uploadResult.public_id,
          cloudinaryResourceType: resourceType,
          cloudinaryFolder: 'music-app/songs',
          
          primaryInstrumentFocus: songMetadata?.primaryInstrumentFocus || 'Guitar',
          genre: songMetadata?.genre || 'Unknown',
          difficulty: songMetadata?.difficulty || 'Beginner',
          year: songMetadata?.year || null,
          notes: songMetadata?.notes || '',
          skills: songMetadata?.skills || '',
          
          guitarProVersion: fileExtension.match(/gp(\d+)/)?.[1] || (fileExtension === '.gp' ? 'legacy' : null),
          duration: uploadResult.duration || null,
          
          tuning: 'E A D G B E',
          timeSignature: '4/4',
          capo: 0,
          downloadCount: 0,
          isActive: true
        };

        console.log(`   💾 Saving to database...`);
        const savedSong = await Song.create(songData);
        
        console.log(`   ✅ SAVED!`);
        console.log(`   📊 Applied: ${savedSong.primaryInstrumentFocus} | ${savedSong.genre} | ${savedSong.difficulty} | Year: ${savedSong.year || 'N/A'}`);

        results.success++;
        results.uploadedFiles.push({
          id: savedSong._id,
          title: savedSong.title,
          artist: savedSong.artist,
          filename: file.name,
          url: uploadResult.secure_url,
          primaryInstrumentFocus: savedSong.primaryInstrumentFocus,
          genre: savedSong.genre,
          difficulty: savedSong.difficulty,
          year: savedSong.year,
          skills: savedSong.skills,
          matchedFromExcel: !!songMetadata,
          uploadedAt: new Date().toISOString()
        });

      } catch (error) {
        console.error(`   ❌ ERROR: ${error.message}`);
        results.failed++;
        results.errors.push({
          filename: file.name,
          error: error.message
        });
      }
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎉 BATCH UPLOAD COMPLETE!`);
    console.log(`   ✅ Success: ${results.success}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   🎯 Excel Matched: ${results.matchingStats.matched}`);
    console.log(`   ⚠️ No Match: ${results.matchingStats.unmatched}`);
    console.log(`   ⏭️ Duplicates Skipped: ${results.matchingStats.duplicatesSkipped}`);
    
    return NextResponse.json({
      success: results.failed === 0,
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