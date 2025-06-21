import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { connect } from '@/dbConnection/dbConfic';

export async function POST(request: NextRequest) {
  console.log('--- POST /Api/classQuality ---');
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');

    if (!itemId) {
      console.error('item_id is missing');
      return NextResponse.json(
        { error: 'item_id parameter is required' },
        { status: 400 }
      );
    }

    // Make the request to the external API
    console.log(`Calling external API for item_id: ${itemId}`);
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
    console.log('External API response received:', response.data);

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Error calling external class quality API:', error);
    
    if (error.response) {
      // The external API responded with an error status
      console.error('External API responded with error:', { status: error.response.status, data: error.response.data });
      return NextResponse.json(
        { 
          error: error.response.data?.message || 'External API error',
          details: error.response.data 
        },
        { status: error.response.status }
      );
    } else if (error.request) {
      // Network error
      console.error('Network error while calling external API:', error.message);
      return NextResponse.json(
        { error: 'Unable to connect to class quality service. Please try again later.' },
        { status: 503 }
      );
    } else {
      // Other error
      console.error('An unexpected error occurred:', error.message);
      return NextResponse.json(
        { error: 'An unexpected error occurred while analyzing class quality.' },
        { status: 500 }
      );
    }
  }
}

export async function GET(request: NextRequest) {
  console.log('--- GET /Api/classQuality ---');
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    console.log('GET API called with classId:', classId);

    if (!classId) {
      console.error('classId is missing');
      return NextResponse.json(
        { error: 'classId parameter is required' },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    await connect();
    console.log('Database connected.');

    // Import the Class model since evaluation data is stored in the Class collection
    const { default: Class } = await import('@/models/Class');

    // Find the class document by its _id
    console.log(`Finding class with ID: ${classId}`);
    const classData = await Class.findById(classId);
    
    if (!classData) {
      console.warn(`Class with ID ${classId} not found.`);
      return NextResponse.json(
        { error: 'Class not found.' },
        { status: 404 }
      );
    }
    console.log('Class data found.');

    // Convert to plain object to avoid Mongoose issues
    const classObj = classData.toObject();

    // Check if evaluation data exists using the plain object
    if (!classObj.evaluation) {
      console.log('Evaluation data not found. Upload may be in progress.');
      return NextResponse.json(
        { 
          error: 'Video upload is in progress. Analysis will be available once the recording is fully processed.',
          isProcessing: true,
          hasEvaluation: false
        },
        { status: 202 } // 202 Accepted - request is being processed
      );
    }

    // Check if evaluation data is complete (has at least overall_quality_score)
    if (!classObj.evaluation.overall_quality_score && classObj.evaluation.overall_quality_score !== 0) {
      console.log('Evaluation data is incomplete. Analysis may be in progress.');
      return NextResponse.json(
        { 
          error: 'Analysis is still being processed. Please try again in a few moments.',
          isProcessing: true,
          hasEvaluation: false
        },
        { status: 202 }
      );
    }

    console.log('Returning complete evaluation data.');
    return NextResponse.json({
      ...classObj.evaluation,
      hasEvaluation: true,
      isProcessing: false
    });

  } catch (error: any) {
    console.error('GET - Error fetching class quality data:', error);
    
    return NextResponse.json(
      { 
        error: 'An error occurred while fetching class quality data.',
        isProcessing: false,
        hasEvaluation: false
      },
      { status: 500 }
    );
  }
} 