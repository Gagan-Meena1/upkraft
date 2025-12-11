// app/api/songs/upload/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import fs from "fs";
import path from "path";
import { Song } from "@/models/Songs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connect(); // connect to MongoDB via Mongoose

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const title = (form.get("title") as string | null)?.trim();
    const artist = (form.get("artist") as string | null)?.trim() || "";
    const genre = (form.get("genre") as string | null)?.trim();
    const difficulty = (form.get("difficulty") as string | null)?.trim();
    const primaryInstrumentFocus = (form.get("primaryInstrumentFocus") as string | null)?.trim();
    const year = (form.get("year") as string | null)?.trim();
    const skills = (form.get("skills") as string | null)?.trim();
    const institution = (form.get("institution") as string | null)?.trim(); // <--- ADD THIS

    if (!file || !title) {
      return NextResponse.json(
        { error: "Missing required fields: title, file" },
        { status: 400 }
      );
    }

    // Accept only .mp3, .gp5, .dp
    const allowedMimeTypes = [
      "audio/mpeg", // mp3
      "application/octet-stream", // fallback
    ];
    const allowedExtensions = [ '.mp3', '.gp', '.gp1', '.gp2', '.gp3', '.gp4', '.gp5', 
      '.gp6', '.gp7', '.gp8', '.gpx', '.dp', '.mxl'];
    const ext = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Only .mp3, .gp, .gp1, .gp2, .gp3, .gp4, .gp5, .gp6, .gp7, .gp8, .gpx, .dp, .mxl allowed." },
        { status: 400 }
      );
    }

    // Save file
    const uploadDir = path.join(process.cwd(), "public/uploads/music");
    fs.mkdirSync(uploadDir, { recursive: true });
    const safeName = Date.now() + "-" + file.name.replace(/\s+/g, "_");
    const filePath = path.join(uploadDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/music/${safeName}`;

    // Save metadata via Mongoose
    const newSong = await Song.create({
      title,
      artist,
      filename: safeName,
      mimeType: file.type || "application/octet-stream",
      url: fileUrl,
      genre,
      difficulty,
      primaryInstrumentFocus,
      year,
      skills,
      institution,
    });

    return NextResponse.json(newSong, { status: 201 });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
