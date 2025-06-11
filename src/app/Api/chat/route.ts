import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // TODO: Replace this with your actual API integration
    // This is just a mock response
    const mockResponse = {
      response: `This is a mock response to: "${message}". Replace this with your actual API integration.`
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 