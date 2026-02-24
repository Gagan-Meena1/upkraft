import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

connect();

export async function PUT(request: NextRequest) {
  try {
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.decode(token);
    const userId = decoded && typeof decoded === 'object' ? (decoded as any).id : null;
    if (!userId) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { songId, action } = await request.json();
    if (!songId || !mongoose.Types.ObjectId.isValid(songId)) {
      return NextResponse.json({ error: 'Valid songId is required' }, { status: 400 });
    }
    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: 'action must be "add" or "remove"' }, { status: 400 });
    }

    const update =
      action === 'add'
        ? { $addToSet: { likedSongs: songId } }
        : { $pull: { likedSongs: songId } };

    const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select('_id likedSongs');
    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, likedSongs: updated.likedSongs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to update liked songs' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';