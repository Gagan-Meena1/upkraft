import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import mongoose from 'mongoose';
import { getDataFromToken } from '@/helper/getDataFromToken';

connect();

/**
 * Caller id, or null when unauthenticated.
 *
 * This used to read `cookies.token` and `jwt.decode` it directly, which meant
 * (a) an unverified signature was trusted and (b) the React Native app, which
 * authenticates with an `Authorization: Bearer` header and has no cookie jar,
 * always got a 401. `getDataFromToken` covers the cookie, impersonation and
 * bearer cases and verifies the signature.
 */
function callerId(request: NextRequest): string | null {
  try {
    return getDataFromToken(request) ?? null;
  } catch {
    return null;
  }
}

/** The caller's liked song ids — the mobile library's favourites state. */
export async function GET(request: NextRequest) {
  try {
    const userId = callerId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await User.findById(userId).select('_id likedSongs');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      likedSongs: (user.likedSongs ?? []).map((id: any) => String(id)),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to read liked songs' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = callerId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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