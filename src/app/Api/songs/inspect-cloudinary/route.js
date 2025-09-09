// app/api/songs/inspect-cloudinary/route.js
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request) {
  try {
    console.log('🔍 Inspecting Cloudinary folder: music-app/songs');
    
    let inspection = {
      uploadResources: [],
      rawResources: [],
      folders: [],
      totalFiles: 0,
      totalSize: 0,
      errors: []
    };

    // Check for 'upload' type resources (images, videos, audio)
    try {
      const uploadResult = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'music-app/songs',
        max_results: 500
      });
      
      inspection.uploadResources = uploadResult.resources.map(resource => ({
        public_id: resource.public_id,
        format: resource.format,
        resource_type: resource.resource_type,
        bytes: resource.bytes,
        created_at: resource.created_at,
        url: resource.secure_url
      }));
      
      console.log(`📤 Found ${uploadResult.resources.length} upload resources`);
    } catch (error) {
      inspection.errors.push(`Upload resources: ${error.message}`);
    }

    // Check for 'raw' type resources (other files like .gp, .txt, etc.)
    try {
      const rawResult = await cloudinary.api.resources({
        type: 'raw',
        prefix: 'music-app/songs',
        max_results: 500
      });
      
      inspection.rawResources = rawResult.resources.map(resource => ({
        public_id: resource.public_id,
        format: resource.format,
        resource_type: resource.resource_type,
        bytes: resource.bytes,
        created_at: resource.created_at,
        url: resource.secure_url
      }));
      
      console.log(`📁 Found ${rawResult.resources.length} raw resources`);
    } catch (error) {
      inspection.errors.push(`Raw resources: ${error.message}`);
    }

    // Check for folders
    try {
      const folderResult = await cloudinary.api.sub_folders('music-app');
      inspection.folders = folderResult.folders.map(folder => folder.name);
      console.log(`📂 Found folders:`, inspection.folders);
    } catch (error) {
      inspection.errors.push(`Folders: ${error.message}`);
    }

    // Calculate totals
    const allResources = [...inspection.uploadResources, ...inspection.rawResources];
    inspection.totalFiles = allResources.length;
    inspection.totalSize = allResources.reduce((sum, resource) => sum + (resource.bytes || 0), 0);

    // Summary
    const summary = {
      totalFiles: inspection.totalFiles,
      totalSizeMB: (inspection.totalSize / 1024 / 1024).toFixed(2),
      uploadFiles: inspection.uploadResources.length,
      rawFiles: inspection.rawResources.length,
      hasErrors: inspection.errors.length > 0
    };

    console.log('🔍 Inspection complete:', summary);

    return NextResponse.json({
      success: true,
      summary,
      details: inspection
    });

  } catch (error) {
    console.error('💥 Error during inspection:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error inspecting Cloudinary folder',
        details: error?.message || 'Unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}