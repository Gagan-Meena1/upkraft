import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Parse incoming multipart form data
    const form = await req.formData();
    const audioFile = form.get("audio_file") as File | null;
    const rawRatingPath = (form.get("ratingPath") as string | null) || "";

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // 2️⃣ Normalize instrument → rating path
    const normalizeRatingPath = (instrument: string | null): string => {
      if (!instrument) return "guitar-ratings"; // fallback
      const key = instrument.toLowerCase();

      const ratingPathMap: Record<string, string> = {
        guitar: "guitar-ratings",
        piano: "piano-ratings",
        drums: "drums-ratings",
        vocals: "vocals-ratings",
      };

      return ratingPathMap[key] || `${key}-ratings`;
    };

    const ratingPath = normalizeRatingPath(rawRatingPath);

    // 3️⃣ Convert File → Buffer for axios FormData
    const fileBuffer = Buffer.from(await audioFile.arrayBuffer());
    const fileName = audioFile.name;

    // ✅ Handle both webm and mp3 files properly
    let mimeType = audioFile.type;
    
    console.log('📝 Original file type:', mimeType);
    console.log('📝 File name:', fileName);
    console.log('📝 File size:', fileBuffer.length, 'bytes');
    
    // Normalize MIME type
    if (mimeType === "video/webm" || mimeType === "audio/webm" || fileName.endsWith('.webm')) {
      mimeType = "audio/webm";
    } else if (mimeType === "audio/mpeg" || fileName.endsWith('.mp3')) {
      mimeType = "audio/mpeg";
    } else if (fileName.endsWith('.wav')) {
      mimeType = "audio/wav";
    }
    
    console.log('📝 Normalized MIME type:', mimeType);

    const forwardForm = new FormData();
    forwardForm.append("audio_file", fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });
    forwardForm.append("ratingPath", ratingPath);

    // 4️⃣ Forward to external API
    const url = `https://wjyumkogkkfxtoq4j4bmhyqznu0mmdkd.lambda-url.ap-south-1.on.aws/audio/${ratingPath}/upload`;
    
    console.log('📤 Forwarding to:', url);
    console.log('📤 Rating path:', ratingPath);
    
    const response = await axios.post(url, forwardForm, {
      headers: forwardForm.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000, // 2 minutes timeout for large files
    });

    console.log('✅ External API response:', response.status);
    console.log('✅ Response data:', response.data);

    // 5️⃣ Send upstream response back to client
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error(
      "❌ Proxy upload failed:",
      error.response?.data || error.message
    );

    return NextResponse.json(
      {
        error: "Failed to upload practice audio",
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}