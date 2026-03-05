import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

await connect();

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token =
      authHeader?.replace('Bearer ', '') ??
      request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.decode(token) as any;
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { expoPushToken } = await request.json();
    if (!expoPushToken) {
      return NextResponse.json({ error: 'expoPushToken is required' }, { status: 400 });
    }

    await User.findByIdAndUpdate(decoded.id, { expoPushToken });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving push token:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
