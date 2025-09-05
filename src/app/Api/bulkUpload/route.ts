// app/api/songs/batch-upload/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import fs from "fs";
import path from "path";
import { Song } from "@/models/Songs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connect();

    const form = await req.formData();
    const files = form.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const allowedExtensions = [".mp3", ".gp", ".gp3", ".gp4", ".gp5", ".gp6", ".gp7", ".gp8", ".dp"];
    const uploadDir = path.join(process.cwd(), "public/uploads/music");
    fs.mkdirSync(uploadDir, { recursive: true });

    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.name).toLowerCase();

      try {
        if (!allowedExtensions.includes(ext)) {
          errors.push(`${file.name}: Invalid file type`);
          continue;
        }

        // Extract title and artist from filename
        const { title, artist } = extractMetadataFromFilename(file.name);
        
        // Determine file type
        const fileType = ext === '.mp3' ? 'audio' : 'tablature';

        // Save file
        const safeName = Date.now() + "-" + i + "-" + file.name.replace(/\s+/g, "_");
        const filePath = path.join(uploadDir, safeName);
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        const fileUrl = `/uploads/music/${safeName}`;

        // Save to database
        const newSong = await Song.create({
          title,
          artist,
          filename: safeName,
          mimeType: file.type || "application/octet-stream",
          url: fileUrl,
          fileType,
          extension: ext,
          fileSize: file.size,
        });

        results.push(newSong);
      } catch (error: any) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: results.length,
      failed: errors.length,
      results,
      errors,
    }, { 
      status: 200,
      headers: corsHeaders()
    });

  } catch (err: any) {
    console.error("Batch upload error:", err);
    return NextResponse.json(
      { 
        error: err.message || "Batch upload failed",
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { 
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}

// Helper function to extract metadata from filename
function extractMetadataFromFilename(filename: string) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // Try to split by common delimiters
  const patterns = [
    /^(.+?)\s*-\s*(.+)$/, // "Artist - Title"
    /^(.+?)\s*_\s*(.+)$/, // "Artist_Title"
    /^(.+?)\s+(.+)$/, // "Artist Title"
  ];

  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern);
    if (match) {
      return {
        title: match[2].trim(),
        artist: match[1].trim(),
      };
    }
  }

  // If no pattern matches, use entire filename as title
  return {
    title: nameWithoutExt.trim(),
    artist: "",
  };
}