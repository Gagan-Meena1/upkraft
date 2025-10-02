// /Api/practice/cleanup-cloudinary/route.js
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { cloudinaryPublicId } = body;

    if (!cloudinaryPublicId) {
      return NextResponse.json({ 
        error: 'Missing cloudinaryPublicId' 
      }, { status: 400 });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(cloudinaryPublicId);
    
    if (result.result === 'ok') {
      return NextResponse.json({ 
        message: 'File deleted successfully from Cloudinary',
        result 
      });
    } else {
      return NextResponse.json({ 
        message: 'File may not exist or was already deleted',
        result 
      }, { status: 200 }); // Still return 200 since it's not really an error
    }

  } catch (error) {
    console.error('Error deleting Cloudinary file:', error);
    return NextResponse.json({ 
      error: 'Failed to delete file from Cloudinary',
      details: error.message 
    }, { status: 500 });
  }
}