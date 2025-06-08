import { NextRequest, NextResponse } from "next/server";

console.log("[Meeting API] Module initialized");

export async function POST(request: NextRequest) {
  try {
    console.log("[Meeting API] Received request");
    const { classId } = await request.json();
    console.log("[Meeting API] Class ID:", classId);
    
    if (!process.env.DAILY_API_KEY) {
      console.error("[Meeting API] Daily API key not found in environment variables");
      throw new Error("Daily API key not configured");
    }

    // Generate a unique room name
    const roomName = `class-${classId}-${Date.now()}`;
    console.log("[Meeting API] Creating Daily.co room:", roomName);

    // Create a Daily.co room
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "public",
        properties: {
          exp: Math.round(Date.now() / 1000) + 3600, // Room expires in 1 hour
          enable_chat: true,
          enable_screenshare: true,
          start_audio_off: true,
          start_video_off: true,
          max_participants: 20,
          enable_knocking: false,
          enable_prejoin_ui: true
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Meeting API] Daily.co error response:", errorData);
      throw new Error(errorData.info || "Failed to create meeting room");
    }

    const data = await response.json();
    console.log("[Meeting API] Daily.co success response:", data);

    if (!data.url) {
      throw new Error("Meeting URL not received from Daily.co");
    }

    console.log("[Meeting API] Room created successfully:", data.url);
    return NextResponse.json({
      success: true,
      url: data.url,
      roomName: data.name,
    });

  } catch (error: any) {
    console.error("[Meeting API] Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to create meeting",
        details: error.stack
      },
      { status: 500 }
    );
  }
} 