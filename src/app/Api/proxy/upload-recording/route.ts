import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const itemId = url.searchParams.get('item_id');
    
    console.log('=== Starting video upload proxy ===');
    console.log('Class ID:', itemId);
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', (file as File).name);
    
    const response = await axios.post(
      `http://62.72.59.204:8001/upload-recording?item_id=${itemId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    console.log('Upload successful:', response.data.message);

    return NextResponse.json({
      upload: {
        success: response.data.success || response.data.message?.includes('successfully'),
        message: response.data.message || 'Video uploaded successfully'
      }
    });
      
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Upload failed',
        details: error.response?.data || error.message
      },
      { status: error.response?.status || 500 }
    );
  }
} 