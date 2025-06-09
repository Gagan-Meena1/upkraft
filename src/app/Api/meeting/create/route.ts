import { NextRequest, NextResponse } from "next/server";

console.log("[Meeting API] Module initialized");

export async function POST(request: NextRequest) {
  try {
    console.log("[Meeting API] Received request");
    const { classId, userId, userRole } = await request.json();
    console.log("[Meeting API] Class ID:", classId, "User ID:", userId, "Role:", userRole);
        
    if (!process.env.DAILY_API_KEY) {
      console.error("[Meeting API] Daily API key not found in environment variables");
      throw new Error("Daily API key not configured");
    }

    // Generate a unique room name
    const roomName = `UpKraftclass-${classId}`;
    console.log("[Meeting API] Room name:", roomName);

    let roomUrl = '';
    let roomExists = false;

    // First, try to get the existing room
    console.log("[Meeting API] Checking if room exists...");
    const checkResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
    });

    if (checkResponse.ok) {
      // Room already exists
      const existingRoom = await checkResponse.json();
      console.log("[Meeting API] Room already exists:", existingRoom.url);
      roomUrl = existingRoom.url;
      roomExists = true;
    } else {
      // Room doesn't exist, create a new one
      console.log("[Meeting API] Room doesn't exist, creating new room...");
      const createResponse = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name: roomName,
          privacy: "public", // Keep as public but use meeting tokens for access control
          properties: {
            exp: Math.round(Date.now() / 1000) + 86400, // Room expires in 24 hours
            enable_chat: true,
            enable_screenshare: true,
            start_audio_off: false, // Changed to false for better UX
            start_video_off: false, // Changed to false for better UX
            max_participants: 20,
            enable_knocking: false,
            enable_prejoin_ui: false, // Disable prejoin to avoid conflicts
            // Add these properties for better multi-user support
            enable_network_ui: true,
            enable_people_ui: true,
            owner_only_broadcast: false,
          },
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error("[Meeting API] Daily.co create error response:", errorData);
        
        // If room already exists error, try to get the existing room again
        if (errorData.error && errorData.error.includes("already exists")) {
          console.log("[Meeting API] Room was created by another request, trying to get existing room...");
          const retryResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
            },
          });
          
          if (retryResponse.ok) {
            const existingRoom = await retryResponse.json();
            console.log("[Meeting API] Retrieved existing room after creation conflict:", existingRoom.url);
            roomUrl = existingRoom.url;
            roomExists = true;
          }
        } else {
          throw new Error(errorData.info || "Failed to create meeting room");
        }
      } else {
        const newRoom = await createResponse.json();
        console.log("[Meeting API] New room created successfully:", newRoom.url);
        roomUrl = newRoom.url;
      }
    }

    if (!roomUrl) {
      throw new Error("Meeting URL not received from Daily.co");
    }

    // Create a meeting token for this user (IMPORTANT for multi-user support)
    console.log("[Meeting API] Creating meeting token for user...");
    const tokenResponse = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: `${userRole}-${userId}`, // Include role in username
          exp: Math.round(Date.now() / 1000) + 86400, // Token expires in 24 hours
          is_owner: userRole === 'tutor', // Only tutors are owners
          // Add user-specific permissions
          enable_screenshare: true,
          enable_recording: userRole === 'tutor',
          start_audio_off: false,
          start_video_off: false,
        },
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json();
      console.error("[Meeting API] Token creation error:", tokenError);
      // Continue without token if it fails - room will still work
    }

    const tokenData = tokenResponse.ok ? await tokenResponse.json() : null;
    const meetingToken = tokenData?.token || null;

    return NextResponse.json({
      success: true,
      url: roomUrl,
      roomName: roomName,
      token: meetingToken,
      message: roomExists ? "Joined existing room" : "Created new room",
      userRole: userRole,
      userId: userId
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