// app/api/songs/batch-delete-by-titles/route.js
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Song } from '@/models/Songs';
import { connect } from '@/dbConnection/dbConfic';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request) {
  try {
    await connect();
    console.log('🗑️ Starting batch delete by song titles...');
    
    // Get the song titles from request body
    const { titles } = await request.json();
    
    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json({ 
        error: 'No song titles provided. Please provide an array of song titles.' 
      }, { status: 400 });
    }

    console.log(`🎵 Received ${titles.length} song titles for deletion`);
    console.log('📝 Sample titles:', titles.slice(0, 5));

    const results = {
      totalTitles: titles.length,
      found: 0,
      deleted: 0,
      failed: 0,
      errors: [],
      deletedSongs: [],
      notFound: []
    };

    // Process each title
    for (let i = 0; i < titles.length; i++) {
      const title = titles[i].trim();
      console.log(`\n🔍 Processing title ${i + 1}/${titles.length}: "${title}"`);
      
      try {
        // Find songs with matching titles (case-insensitive)
        const songsToDelete = await Song.find({ 
          title: { $regex: new RegExp(`^${title}$`, 'i') }
        });

        if (songsToDelete.length === 0) {
          console.log(`❌ No songs found with title: "${title}"`);
          results.notFound.push(title);
          continue;
        }

        console.log(`✅ Found ${songsToDelete.length} song(s) with title: "${title}"`);
        results.found += songsToDelete.length;

        // Delete each matching song
        for (const song of songsToDelete) {
          try {
            console.log(`🗑️ Deleting: "${song.title}" by ${song.artist} (ID: ${song._id})`);
            
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
                
                if (cloudinaryResult.result !== 'ok' && cloudinaryResult.result !== 'not found') {
                  console.warn(`⚠️ Cloudinary deletion warning: ${cloudinaryResult.result}`);
                }
              } catch (cloudinaryError) {
                console.error(`❌ Cloudinary deletion error:`, cloudinaryError.message);
                // Continue with database deletion even if Cloudinary fails
              }
            } else {
              console.log(`⚠️ No Cloudinary public ID found for: "${song.title}"`);
            }

            // Delete from database
            await Song.findByIdAndDelete(song._id);
            console.log(`✅ Deleted from database: ${song._id}`);
            
            results.deleted++;
            results.deletedSongs.push({
              id: song._id.toString(),
              title: song.title,
              artist: song.artist,
              filename: song.filename,
              cloudinaryPublicId: song.cloudinaryPublicId || 'N/A',
              deletedAt: new Date().toISOString()
            });

          } catch (songError) {
            console.error(`❌ Error deleting song ${song._id}:`, songError.message);
            results.failed++;
            results.errors.push(`${song.title} (${song._id}): ${songError.message}`);
          }
        }

      } catch (titleError) {
        console.error(`❌ Error processing title "${title}":`, titleError.message);
        results.failed++;
        results.errors.push(`Title "${title}": ${titleError.message}`);
      }
    }

    console.log(`\n🎉 Batch deletion complete!`);
    console.log(`📊 Results Summary:`);
    console.log(`   - Total titles processed: ${results.totalTitles}`);
    console.log(`   - Songs found: ${results.found}`);
    console.log(`   - Songs deleted: ${results.deleted}`);
    console.log(`   - Failed deletions: ${results.failed}`);
    console.log(`   - Titles not found: ${results.notFound.length}`);
    
    return NextResponse.json({
      ...results,
      summary: {
        totalTitlesProcessed: results.totalTitles,
        songsFound: results.found,
        songsDeleted: results.deleted,
        successRate: results.found > 0 ? ((results.deleted / results.found) * 100).toFixed(1) + '%' : '0%',
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 Server error during batch deletion:', error);
    return NextResponse.json(
      { 
        error: 'Server error during batch deletion',
        details: error?.message || 'Unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';