// app/api/songs/update-instruments/route.js
import { NextResponse } from 'next/server';
import { Song } from '@/models/Songs';
import { connect } from '@/dbConnection/dbConfic';
import * as XLSX from 'xlsx';

export async function POST(request) {
  try {
    await connect();
    console.log('🚀 Starting instrument update from Excel...');
    
    const data = await request.formData();
    const excelFile = data.get('excelFile');
    
    if (!excelFile) {
      return NextResponse.json({ error: 'Excel file is required' }, { status: 400 });
    }

    // Parse Excel file
    let songsToUpdate = [];
    try {
      const excelBuffer = Buffer.from(await excelFile.arrayBuffer());
      const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('🔍 Excel Headers:', Object.keys(rawData[0] || {}));
      
      songsToUpdate = rawData.map(row => ({
        song: row.Song?.toString().trim().replace(/\([^)]*\)/g, '').trim() || '',
        artist: row.Artist?.toString().trim() || '',
        primaryInstrumentFocus: row.Primary_Instrument_Focus?.toString().trim() || '',
      })).filter(item => item.song && item.primaryInstrumentFocus);
      
      console.log(`📋 Parsed ${songsToUpdate.length} songs from Excel`);
      
    } catch (error) {
      console.error('❌ Error parsing Excel file:', error);
      return NextResponse.json({ 
        error: 'Failed to parse Excel file',
        details: error.message 
      }, { status: 400 }); 
    }

    const normalizeString = (str) => {
      return str
        .toLowerCase()
        .replace(/\([^)]*\)/g, '')
        .replace(/\[[^\]]*\]/g, '')
        .replace(/[''`]/g, '')
        .replace(/\btumhi\b/g, 'tum hi')
        .replace(/[_-]/g, ' ')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const results = {
      success: 0,
      failed: 0,
      notFound: 0,
      errors: [],
      updatedSongs: []
    };

    // Process each song from Excel
    for (let i = 0; i < songsToUpdate.length; i++) {
      const item = songsToUpdate[i];
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🔄 [${i + 1}/${songsToUpdate.length}] Processing: "${item.song}" by ${item.artist}`);
      
      try {
        const normalizedTitle = normalizeString(item.song);
        const normalizedArtist = normalizeString(item.artist);
        
        // Find the song in database
        // Try exact match first
        let song = await Song.findOne({
          $expr: {
            $and: [
              { $eq: [{ $toLower: '$title' }, item.song.toLowerCase()] },
              { $eq: [{ $toLower: '$artist' }, item.artist.toLowerCase()] }
            ]
          }
        });

        // If not found, try normalized matching
        if (!song) {
          const allSongs = await Song.find({}).select('title artist primaryInstrumentFocus');
          
          song = allSongs.find(s => {
            const dbTitle = normalizeString(s.title);
            const dbArtist = normalizeString(s.artist);
            return dbTitle === normalizedTitle && dbArtist === normalizedArtist;
          });
        }

        if (!song) {
          console.log(`   ❌ Song not found in database`);
          results.notFound++;
          results.errors.push({
            song: item.song,
            artist: item.artist,
            error: 'Song not found in database'
          });
          continue;
        }

        // Update the instrument
        const oldInstrument = song.primaryInstrumentFocus;
        song.primaryInstrumentFocus = item.primaryInstrumentFocus;
        await song.save();

        console.log(`   ✅ Updated: ${oldInstrument} → ${item.primaryInstrumentFocus}`);
        
        results.success++;
        results.updatedSongs.push({
          id: song._id,
          title: song.title,
          artist: song.artist,
          oldInstrument: oldInstrument,
          newInstrument: item.primaryInstrumentFocus
        });

      } catch (error) {
        console.error(`   ❌ ERROR: ${error.message}`);
        results.failed++;
        results.errors.push({
          song: item.song,
          artist: item.artist,
          error: error.message
        });
      }
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎉 INSTRUMENT UPDATE COMPLETE!`);
    console.log(`   ✅ Success: ${results.success}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   🔍 Not Found: ${results.notFound}`);
    
    return NextResponse.json({
      success: results.failed === 0 && results.notFound === 0,
      ...results,
      summary: {
        totalSongs: songsToUpdate.length,
        successRate: ((results.success / songsToUpdate.length) * 100).toFixed(1) + '%',
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 Server error:', error);
    return NextResponse.json(
      { 
        error: 'Server error during instrument update',
        details: error?.message || 'Unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';