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

      // Map supported instruments explicitly (extendable)
      const ratingPathMap: Record<string, string> = {
        guitar: "guitar-ratings",
        piano: "piano-ratings",
      };

      // If not found, build dynamically as "<instrument>-ratings"
      return ratingPathMap[key] || `${key}-ratings`;
    };

    const ratingPath = normalizeRatingPath(rawRatingPath);

    // 3️⃣ Convert File → Buffer for axios FormData

    // After parsing formData
    const fileBuffer = Buffer.from(await audioFile.arrayBuffer());
    const fileName = audioFile.name;

    // If the type is video/webm, rename or change the extension
    const mimeType =
      audioFile.type === "video/webm" ? "audio/webm" : audioFile.type;

    const forwardForm = new FormData();
    forwardForm.append("audio_file", fileBuffer, {
      filename: fileName.replace(/^practice_recording.*$/, fileName),
      contentType: mimeType,
    });
    forwardForm.append("ratingPath", ratingPath);

    // const fileBuffer = Buffer.from(await audioFile.arrayBuffer());
    // const forwardForm = new FormData();
    // forwardForm.append("audio_file", fileBuffer, audioFile.name);
    // forwardForm.append("ratingPath", ratingPath);

    // 4️⃣ Forward to external API
    const url = `http://168.231.103.13:8000/audio/${ratingPath}/upload`;
    const response = await axios.post(url, forwardForm, {
      headers: forwardForm.getHeaders(),
      maxBodyLength: Infinity, // Support large uploads
    });

    // 5️⃣ Send upstream response back to client
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error(
      "Proxy upload failed:",
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
