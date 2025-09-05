// app/api/songs/batch-upload/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import fs from "fs";
import path from "path";
import { Song } from "@/models/Songs";

export const runtime = "nodejs";

// Add CORS headers helper
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 200, 
    headers: corsHeaders() 
  });
}

export async function POST(req: Request) {
  console.log("📤 Batch upload API called");
  
  try {
    // Connect to database
    console.log("🔗 Connecting to database...");
    await connect();
    console.log("✅ Database connected");

    // Parse form data
    console.log("📝 Parsing form data...");
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    
    console.log(`📦 Received ${files.length} files`);
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { 
          status: 400,
          headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json',
          }
        }
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

      console.log(`🔄 Processing file ${i + 1}/${files.length}: ${file.name}`);

      try {
        if (!allowedExtensions.includes(ext)) {
          errors.push(`${file.name}: Invalid file type (${ext})`);
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
        console.log(`✅ Successfully processed: ${file.name}`);

      } catch (error: any) {
        console.error(`❌ Error processing ${file.name}:`, error);
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    console.log(`🎉 Batch upload completed. Success: ${results.length}, Failed: ${errors.length}`);

    return NextResponse.json({
      success: results.length,
      failed: errors.length,
      results,
      errors,
    }, { 
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      }
    });

  } catch (err: any) {
    console.error("❌ Batch upload error:", err);
    return NextResponse.json(
      { 
        error: err.message || "Batch upload failed",
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { 
        status: 500,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json',
        }
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