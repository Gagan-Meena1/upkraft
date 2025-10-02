import { NextRequest, NextResponse } from 'next/server';
import { Song } from '@/models/Songs'; 
import {connect} from '@/dbConnection/dbConfic'; 

export async function GET(request: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q || q.trim().length < 2) {
      return NextResponse.json(
        { message: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const searchQuery = q.trim();
    
    const songs = await Song.find({
      $or: [
        { searchText: { $regex: searchQuery, $options: 'i' } },
        { title: { $regex: searchQuery, $options: 'i' } },
        { artist: { $regex: searchQuery, $options: 'i' } },
        { genre: { $regex: searchQuery, $options: 'i' } },
        { primaryInstrumentFocus: { $regex: searchQuery, $options: 'i' } },
        { skills: { $regex: searchQuery, $options: 'i' } },
        { notes: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ],
      isActive: { $ne: false }
    })
    .select('title artist genre difficulty primaryInstrumentFocus year')
    .limit(10)
    .sort({ title: 1, artist: 1 });

    return NextResponse.json({
      success: true,
      songs,
      count: songs.length
    });

  } catch (error) {
    console.error('Song search error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
