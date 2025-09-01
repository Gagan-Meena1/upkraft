import { NextResponse, NextRequest } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { connect } from '@/dbConnection/dbConfic';
export async function POST(req: NextRequest) {
  try {
    await connect();
    const form = await req.formData()

    // accept either "file" or "audio_file"
    const incoming = form.get("file") || form.get("audio_file")
    if (!(incoming instanceof Blob)) {
      return Response.json({ error: "Missing file. Send as 'file' or 'audio_file' in form-data." }, { status: 400 })
    }

    // build upstream form with exact fields your AI API expects
    const upstreamForm = new FormData()
    const filename = (incoming as any).name || "recording.webm"
    const type = incoming.type || "audio/webm"
    const fileForUpstream = new File([incoming], filename, { type })

    upstreamForm.append("audio_file", fileForUpstream)
    upstreamForm.append("model", "gemini-2.5-pro")

    const upstream = await fetch("http://localhost:8000/audio/guitar-ratings/upload", {
      method: "POST",
      body: upstreamForm,
    })

    const data = await upstream.json()
    return Response.json(data, { status: upstream.status })
  } catch (err: any) {
    return Response.json(
      { error: "Failed to forward file to AI API", details: err?.message || String(err) },
      { status: 500 },
    )
  }
}
