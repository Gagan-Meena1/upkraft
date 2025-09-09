// scripts/cleanup-all-data.js
import { v2 as cloudinary } from 'cloudinary';
import { Song } from '../models/Songs.js'; // Adjust path as needed
import { connect } from '../dbConnection/dbConfic.js'; // Adjust path as needed

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function cleanupAllData() {
  try {
    console.log('🧹 Starting complete cleanup...');
    
    // Connect to database
    await connect();
    console.log('✅ Connected to database');

    // Step 1: Get all songs from database to get their Cloudinary public IDs
    const songs = await Song.find({});
    console.log(`📊 Found ${songs.length} songs in database`);

    const cloudinaryPublicIds = songs
      .map(song => song.cloudinaryPublicId)
      .filter(id => id); // Remove any null/undefined IDs

    console.log(`🗂️ Found ${cloudinaryPublicIds.length} Cloudinary public IDs to delete`);

    // Step 2: Delete individual files from Cloudinary (if any exist in database)
    let cloudinaryDeletedCount = 0;
    if (cloudinaryPublicIds.length > 0) {
      console.log('🗑️ Deleting individual files from Cloudinary...');
      
      // Delete in batches of 100 (Cloudinary's limit)
      const batchSize = 100;
      for (let i = 0; i < cloudinaryPublicIds.length; i += batchSize) {
        const batch = cloudinaryPublicIds.slice(i, i + batchSize);
        try {
          const deleteResult = await cloudinary.api.delete_resources(batch);
          const deletedInBatch = Object.keys(deleteResult.deleted).length;
          cloudinaryDeletedCount += deletedInBatch;
          console.log(`   ✅ Deleted ${deletedInBatch} files from batch ${Math.floor(i/batchSize) + 1}`);
        } catch (error) {
          console.error(`   ❌ Error deleting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        }
      }
    }

    // Step 3: Delete entire folder from Cloudinary (this will catch any remaining files)
    console.log('📁 Deleting entire "music-app/songs" folder from Cloudinary...');
    try {
      // Delete all resources in the folder
      const folderDeleteResult = await cloudinary.api.delete_resources_by_prefix('music-app/songs');
      console.log(`   ✅ Folder deletion result:`, {
        deleted: Object.keys(folderDeleteResult.deleted || {}).length,
        not_found: Object.keys(folderDeleteResult.not_found || {}).length
      });

      // Delete the empty folder itself
      await cloudinary.api.delete_folder('music-app/songs');
      console.log('   ✅ Empty folder deleted');
    } catch (error) {
      if (error.error && error.error.message.includes('not found')) {
        console.log('   ℹ️ Folder not found or already empty');
      } else {
        console.error('   ❌ Error deleting folder:', error.message);
      }
    }

    // Step 4: Clear MongoDB Song collection
    console.log('💾 Clearing Song collection from MongoDB...');
    const deleteResult = await Song.deleteMany({});
    console.log(`   ✅ Deleted ${deleteResult.deletedCount} songs from database`);

    // Final summary
    console.log('\n🎉 Cleanup completed!');
    console.log('📊 Summary:');
    console.log(`   • MongoDB songs deleted: ${deleteResult.deletedCount}`);
    console.log(`   • Cloudinary files deleted: ${cloudinaryDeletedCount}+`);
    console.log(`   • Cloudinary folder: music-app/songs (cleaned)`);
    
    process.exit(0);

  } catch (error) {
    console.error('💥 Error during cleanup:', error);
    process.exit(1);
  }
}

// Alternative function to just clear database (keeping Cloudinary intact)
async function clearDatabaseOnly() {
  try {
    console.log('🧹 Clearing database only...');
    
    await connect();
    const deleteResult = await Song.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} songs from database`);
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Error clearing database:', error);
    process.exit(1);
  }
}

// Alternative function to just clear Cloudinary folder (keeping database intact)
async function clearCloudinaryOnly() {
  try {
    console.log('🧹 Clearing Cloudinary folder only...');
    
    // Delete all resources in the folder
    const folderDeleteResult = await cloudinary.api.delete_resources_by_prefix('music-app/songs');
    console.log(`✅ Deleted ${Object.keys(folderDeleteResult.deleted || {}).length} files`);

    // Delete the empty folder
    await cloudinary.api.delete_folder('music-app/songs');
    console.log('✅ Folder deleted');
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Error clearing Cloudinary:', error);
    process.exit(1);
  }
}

// Export functions for use in other scripts
export { cleanupAllData, clearDatabaseOnly, clearCloudinaryOnly };

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const action = process.argv[2];
  
  switch (action) {
    case 'db-only':
      clearDatabaseOnly();
      break;
    case 'cloudinary-only':
      clearCloudinaryOnly();
      break;
    case 'all':
    default:
      cleanupAllData();
      break;
  }
}