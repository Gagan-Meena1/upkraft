// app/api/songs/cleanup/route.js
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
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'all'; // 'all', 'db-only', 'cloudinary-only'
    
    console.log(`🧹 Starting cleanup with action: ${action}`);
    
    await connect();
    
    let results = {
      action,
      mongoDeleted: 0,
      cloudinaryDeleted: 0,
      cloudinaryBatches: 0,
      folderDeleted: false,
      errors: [],
      details: []
    };

    // Handle database cleanup
    if (action === 'all' || action === 'db-only') {
      try {
        console.log('💾 Clearing Song collection from MongoDB...');
        const deleteResult = await Song.deleteMany({});
        results.mongoDeleted = deleteResult.deletedCount;
        results.details.push(`Deleted ${deleteResult.deletedCount} songs from database`);
        console.log(`✅ Deleted ${deleteResult.deletedCount} songs from database`);
      } catch (error) {
        console.error('❌ Error clearing database:', error);
        results.errors.push(`Database: ${error.message}`);
      }
    }

    // Handle Cloudinary cleanup
    if (action === 'all' || action === 'cloudinary-only') {
      try {
        console.log('📁 Clearing "music-app/songs" folder from Cloudinary...');
        
        // Cloudinary has limits, so we need to delete in batches
        let totalDeleted = 0;
        let hasMore = true;
        let batchCount = 0;
        
        while (hasMore) {
          batchCount++;
          console.log(`🔄 Processing batch ${batchCount}...`);
          
          try {
            // Delete up to 100 resources at a time (Cloudinary limit)
            const deleteResult = await cloudinary.api.delete_resources_by_prefix(
              'music-app/songs',
              { 
                resource_type: 'raw',
                max_results: 100 
              }
            );
            
            const deletedCount = Object.keys(deleteResult.deleted || {}).length;
            totalDeleted += deletedCount;
            console.log(`  ✅ Batch ${batchCount}: Deleted ${deletedCount} raw files`);
            
            // If we deleted less than 100, we're done with this resource type
            if (deletedCount < 100) {
              hasMore = false;
            }
          } catch (batchError) {
            console.error(`  ❌ Error in batch ${batchCount}:`, batchError.message);
            hasMore = false; // Stop on error
          }
        }

        // Also delete video resources (for .mp3 files)
        console.log('🎵 Deleting audio files (video resource type)...');
        try {
          const audioDeleteResult = await cloudinary.api.delete_resources_by_prefix(
            'music-app/songs',
            { 
              resource_type: 'video',
              max_results: 100 
            }
          );
          const audioDeleted = Object.keys(audioDeleteResult.deleted || {}).length;
          totalDeleted += audioDeleted;
          console.log(`  ✅ Deleted ${audioDeleted} audio files`);
        } catch (audioError) {
          console.log(`  ℹ️ No audio files or error:`, audioError.message);
        }

        results.cloudinaryDeleted = totalDeleted;
        results.cloudinaryBatches = batchCount;
        results.details.push(`Deleted ${totalDeleted} files from Cloudinary in ${batchCount} batches`);

        // Wait a bit for Cloudinary to process deletions
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to delete the empty folder
        console.log('🗑️ Attempting to delete folder...');
        try {
          await cloudinary.api.delete_folder('music-app/songs');
          results.folderDeleted = true;
          results.details.push('Folder deleted from Cloudinary');
          console.log('✅ Folder deleted from Cloudinary');
        } catch (folderError) {
          const errorMsg = folderError.error?.message || folderError.message || '';
          if (errorMsg.includes('not found') || errorMsg.includes('not empty') || errorMsg.includes('Can\'t find folder')) {
            console.log('ℹ️ Folder not found, already deleted, or still processing');
            results.folderDeleted = true; // Consider this success
            results.details.push('Folder deletion skipped (not found or still processing)');
          } else {
            console.error('❌ Error deleting folder:', folderError);
            results.errors.push(`Folder deletion: ${errorMsg}`);
          }
        }

      } catch (error) {
        console.error('❌ Error clearing Cloudinary:', error);
        results.errors.push(`Cloudinary: ${error.message}`);
      }
    }

    console.log('🎉 Cleanup completed!');
    console.log('📊 Results:', results);

    const hasErrors = results.errors.length > 0;

    return NextResponse.json({
      success: !hasErrors,
      message: hasErrors ? 'Cleanup completed with errors' : 'Cleanup completed successfully',
      results,
      summary: {
        totalDeleted: results.mongoDeleted + results.cloudinaryDeleted,
        databaseCleared: results.mongoDeleted > 0,
        cloudinaryCleared: results.cloudinaryDeleted > 0,
        hasErrors: hasErrors
      }
    }, { status: hasErrors ? 207 : 200 }); // 207 = Multi-Status

  } catch (error) {
    console.error('💥 Server error during cleanup:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Server error during cleanup',
        details: error?.message || 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}

// Add CORS headers if needed
export async function OPTIONS(request) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';