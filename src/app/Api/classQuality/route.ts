import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { connect } from '@/dbConnection/dbConfic';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    console.log('GET API called with classId:', classId);

    if (!classId) {
      return NextResponse.json(
        { error: 'classId parameter is required' },
        { status: 400 }
      );
    }

    await connect();

    // Import the Class model since evaluation data is stored in the Class collection
    const { default: Class } = await import('@/models/Class');

    // Find the class document by its _id
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found.' },
        { status: 404 }
      );
    }

    // Convert to plain object to avoid Mongoose issues
    const classObj = classData.toObject();

    // Check if evaluation data exists using the plain object
    if (!classObj.evaluation) {
      return NextResponse.json(
        { 
          error: 'Class quality analysis not found. The recording may still be processing.',
          isProcessing: true 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(classObj.evaluation);

  } catch (error: any) {
    console.error('GET - Error fetching class quality data:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while fetching class quality data.' },
      { status: 500 }
    );
  }
} 