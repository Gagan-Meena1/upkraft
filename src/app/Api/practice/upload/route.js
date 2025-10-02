// /Api/practice/upload/route.js
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const instrument = formData.get('instrument');

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (!instrument) {
      return NextResponse.json({ error: 'No instrument specified' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Original file info:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // STEP 1: Upload original file to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'practice-recordings',
          public_id: `practice_${instrument}_${Date.now()}_original`,
          overwrite: false
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    console.log('Upload successful:', {
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes
    });

    // STEP 2: Create MP3 version using Cloudinary transformation
    let mp3Result = null;
    let mp3Url = null;

    try {
      // Generate MP3 transformation URL
      mp3Url = cloudinary.url(uploadResult.public_id, {
        resource_type: 'video', // Use video for audio transformations
        format: 'mp3',
        audio_codec: 'mp3',
        audio_frequency: 44100,
        bit_rate: '192k',
        quality: 'auto:good'
      });

      // Create a derived MP3 version explicitly
      const mp3PublicId = `${uploadResult.public_id}_mp3`;
      mp3Result = await cloudinary.uploader.explicit(uploadResult.public_id, {
        resource_type: 'video',
        type: 'upload',
        public_id: mp3PublicId,
        format: 'mp3',
        audio_codec: 'mp3',
        audio_frequency: 44100,
        bit_rate: '192k',
        overwrite: true
      });

      console.log('MP3 conversion successful:', {
        public_id: mp3Result.public_id,
        format: mp3Result.format,
        bytes: mp3Result.bytes
      });

    } catch (conversionError) {
      console.error('MP3 conversion failed:', conversionError);
      // Continue without MP3 version
    }

    // STEP 3: Return both original and MP3 URLs
    const response = {
      // Original file info
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      asset_id: uploadResult.asset_id,
      bytes: uploadResult.bytes,
      format: uploadResult.format,
      resource_type: uploadResult.resource_type,
      
      // MP3 version info (if successful)
      mp3_url: mp3Result ? mp3Result.secure_url : mp3Url,
      mp3_public_id: mp3Result ? mp3Result.public_id : null,
      mp3_bytes: mp3Result ? mp3Result.bytes : null,
      
      // Indicate if MP3 conversion was successful
      has_mp3_version: !!mp3Result,
      
      // Playback URL (prefer MP3 if available)
      playback_url: mp3Result ? mp3Result.secure_url : uploadResult.secure_url,
      download_url: mp3Result ? mp3Result.secure_url : uploadResult.secure_url
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({
      error: 'Failed to upload audio file',
      details: error.message
    }, { status: 500 });
  }
}

// Optional: Add a GET endpoint to check conversion status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID required' }, { status: 400 });
    }

    // Check if MP3 version exists
    try {
      const mp3Info = await cloudinary.api.resource(`${publicId}_mp3`, {
        resource_type: 'video'
      });

      return NextResponse.json({
        exists: true,
        mp3_url: mp3Info.secure_url,
        mp3_public_id: mp3Info.public_id,
        bytes: mp3Info.bytes,
        format: mp3Info.format
      });

    } catch (notFoundError) {
      return NextResponse.json({
        exists: false,
        message: 'MP3 version not found or still processing'
      });
    }

  } catch (error) {
    console.error('Error checking conversion status:', error);
    return NextResponse.json({
      error: 'Failed to check conversion status',
      details: error.message
    }, { status: 500 });
  }
}