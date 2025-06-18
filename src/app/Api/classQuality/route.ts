import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'item_id parameter is required' },
        { status: 400 }
      );
    }

    // Make the request to the external API
    const response = await axios.post(
      `http://62.72.59.204:8001/evaluate-video?item_id=${itemId}`,
      {},
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 120 seconds timeout for video analysis
      }
    );

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Error calling external class quality API:', error);
    
    if (error.response) {
      // The external API responded with an error status
      return NextResponse.json(
        { 
          error: error.response.data?.message || 'External API error',
          details: error.response.data 
        },
        { status: error.response.status }
      );
    } else if (error.request) {
      // Network error
      return NextResponse.json(
        { error: 'Unable to connect to class quality service. Please try again later.' },
        { status: 503 }
      );
    } else {
      // Other error
      return NextResponse.json(
        { error: 'An unexpected error occurred while analyzing class quality.' },
        { status: 500 }
      );
    }
  }
} 