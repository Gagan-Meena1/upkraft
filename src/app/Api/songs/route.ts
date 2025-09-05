// app/api/songs/list/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import { Song } from "@/models/Songs"; 
export async function GET() {
  try {
    await connect(); // connect to MongoDB

    // Fetch all songs sorted by uploadDate
    const items = await Song.find().sort({ uploadDate: -1 });

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("List error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list" },
      { status: 500 }
    );
  }
}
