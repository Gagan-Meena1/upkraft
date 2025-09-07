// app/api/songs/batch-upload/route.js
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Song } from '@/models/Songs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    console.log('🚀 Starting batch upload...');
    
    // Parse form data
    const data = await request.formData();
    const files = data.getAll('files');
    
    console.log(`📁 Received ${files.length} files`);
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files found' }, { status: 400 });
    }

    // ✅ Define allowed file extensions for GP files
    const allowedExtensions = [
      '.mp3',           // Audio files
      '.gp',            // Guitar Pro base
      '.gp1', '.gp2', '.gp3', '.gp4', '.gp5', 
      '.gp6', '.gp7', '.gp8',  // Guitar Pro versions 1-8
      '.gpx',           // Guitar Pro X
      '.dp'             // Additional format
    ];

    const results = {
      success: 0,
      failed: 0,
      errors: [],
      uploadedFiles: []
    };

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📤 Processing file ${i + 1}/${files.length}: ${file.name}`);
      
      try {
        // ✅ Validate file extension
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        if (!allowedExtensions.includes(fileExtension)) {
          throw new Error(`Invalid file type: ${fileExtension}. Allowed: ${allowedExtensions.join(', ')}`);
        }

        // ✅ Check file size (max 15MB for GP files)
        const maxSize = 15 * 1024 * 1024; // 15MB
        if (file.size > maxSize) {
          throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 15MB`);
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        console.log(`📊 File: ${file.name} | Size: ${(buffer.length / 1024 / 1024).toFixed(2)}MB | Type: ${fileExtension}`);

        // ✅ Determine resource type based on file extension
        const isAudioFile = ['.mp3'].includes(fileExtension);
        const resourceType = isAudioFile ? 'video' : 'raw'; // Use 'raw' for GP files

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadOptions = {
            resource_type: resourceType,
            folder: 'music-app/songs',
            public_id: `${Date.now()}-${file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_')}`,
            overwrite: false,
            // Add original filename as metadata
            context: {
              original_name: file.name,
              file_type: fileExtension,
              upload_date: new Date().toISOString()
            }
          };

          // ✅ Audio specific options only for MP3 files
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

        // ✅ Add to successful uploads with enhanced metadata
        results.success++;
        
        // ✅ Save to database
        const songData = {
          title: file.name.split('.')[0].replace(/[_-]/g, ' '), // Clean filename as title
          filename: file.name,
          mimeType: file.type || 'application/octet-stream',
          url: uploadResult.secure_url,
          fileType: isAudioFile ? 'audio' : 'tablature',
          extension: fileExtension,
          fileSize: uploadResult.bytes,
          cloudinaryPublicId: uploadResult.public_id,
          cloudinaryResourceType: resourceType,
          cloudinaryFolder: 'music-app/songs',
          duration: uploadResult.duration || null,
          guitarProVersion: fileExtension.match(/gp(\d+)/)?.[1] || (fileExtension === '.gp' ? 'legacy' : null),
        };

        const savedSong = await Song.create(songData);
        console.log('💾 Saved to database:', savedSong._id);

        results.uploadedFiles.push({
          id: savedSong._id,
          filename: file.name,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          size: uploadResult.bytes,
          format: uploadResult.format,
          fileType: fileExtension,
          resourceType: resourceType,
          duration: uploadResult.duration || null,
          uploadedAt: new Date().toISOString(),
          // GP file specific metadata
          isGuitarProFile: fileExtension.startsWith('.gp'),
          isAudioFile: isAudioFile
        });

      } catch (error:any) {
        console.error(`❌ Error uploading ${file.name}:`, error.message);
        results.failed++;
        results.errors.push(`${file.name}: ${error.message}`);
      }
    }

    console.log(`🎉 Batch upload complete: ${results.success} success, ${results.failed} failed`);
    
    // ✅ Enhanced response with summary
    return NextResponse.json({
      ...results,
      summary: {
        totalFiles: files.length,
        successRate: ((results.success / files.length) * 100).toFixed(1) + '%',
        processedAt: new Date().toISOString()
      }
    });

  } catch (error:any) {
    console.error('💥 Server error:', error);
    return NextResponse.json(
      { 
        error: 'Server error during upload',
        details: error?.message || 'Unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}

// Configure API route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';