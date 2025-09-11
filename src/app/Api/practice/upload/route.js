import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};

export async function POST(request) {
  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(request, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    const instrument = Array.isArray(fields.instrument) ? fields.instrument[0] : fields.instrument;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(audioFile.filepath, {
      resource_type: 'auto',
      folder: 'practice-recordings',
      public_id: `practice_${instrument}_${Date.now()}`,
      overwrite: false
    });

    // Clean up temp file
    fs.unlinkSync(audioFile.filepath);

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      asset_id: result.asset_id,
      bytes: result.bytes
    });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({
      error: 'Failed to upload audio file',
      details: error.message
    }, { status: 500 });
  }
}