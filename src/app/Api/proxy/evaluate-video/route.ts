import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const itemId = url.searchParams.get('item_id');
    
    console.log('=== Starting video evaluation ===');
    console.log('Class ID:', itemId);
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const response = await axios.post(
      `http://62.72.59.204:8001/evaluate-video?item_id=${itemId}`,
      '',
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    console.log('Evaluation generated successfully');

    return NextResponse.json({
      success: true,
      message: 'Video evaluation generated successfully'
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to start video evaluation',
        details: error.response?.data || error.message
      },
      { status: error.response?.status || 500 }
    );
  }
} 