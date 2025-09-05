// app/api/songs/search/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import { Song } from "@/models/Songs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    await connect();

    const filter = q
      ? {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { artist: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const items = await Song.find(filter).sort({ uploadDate: -1 }).limit(50);

    const res = NextResponse.json({ items });

    // ✅ Add CORS headers
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return res;
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: err.message || "Search failed" },
      { status: 500 }
    );
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
