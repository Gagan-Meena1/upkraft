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
      folderDeleted: false,
      errors: []
    };

    // Handle database cleanup
    if (action === 'all' || action === 'db-only') {
      try {
        console.log('💾 Clearing Song collection from MongoDB...');
        const deleteResult = await Song.deleteMany({});
        results.mongoDeleted = deleteResult.deletedCount;
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
        
        // Delete all resources in the folder by prefix
        const folderDeleteResult = await cloudinary.api.delete_resources_by_prefix('music-app/songs');
        results.cloudinaryDeleted = Object.keys(folderDeleteResult.deleted || {}).length;
        console.log(`✅ Deleted ${results.cloudinaryDeleted} files from Cloudinary`);

        // Try to delete the empty folder
        try {
          await cloudinary.api.delete_folder('music-app/songs');
          results.folderDeleted = true;
          console.log('✅ Folder deleted from Cloudinary');
        } catch (folderError) {
          if (folderError.error && folderError.error.message.includes('not found')) {
            console.log('ℹ️ Folder not found or already empty');
            results.folderDeleted = true; // Consider this success
          } else {
            console.error('❌ Error deleting folder:', folderError);
            results.errors.push(`Folder deletion: ${folderError.message}`);
          }
        }

      } catch (error) {
        console.error('❌ Error clearing Cloudinary:', error);
        results.errors.push(`Cloudinary: ${error.message}`);
      }
    }

    console.log('🎉 Cleanup completed!');
    console.log('📊 Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      results
    });

  } catch (error) {
    console.error('💥 Server error during cleanup:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Server error during cleanup',
        details: error?.message || 'Unknown error occurred'
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