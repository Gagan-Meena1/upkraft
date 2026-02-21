// src/app/Api/knowledgeHub/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import knowledgeHub from "@/models/knowledgeHub";
import jwt from "jsonwebtoken";

await connect();

// GET - Fetch all knowledge hub videos
export async function GET(request: NextRequest) {
  try {
    console.log("Fetching knowledge hub videos...");

    const videos = await knowledgeHub.find({}).sort({ createdAt: -1 });

    console.log(`Found ${videos.length} videos`);

    return NextResponse.json(
      {
        message: "Videos fetched successfully",
        success: true,
        data: videos,
        count: videos.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error while fetching videos:", error);
    return NextResponse.json(
      {
        message: "Server error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new knowledge hub video
export async function POST(request: NextRequest) {
  try {
    console.log("Creating new knowledge hub video...");

    // Verify authentication (optional - remove if you want public access)
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    const userId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please login", success: false },
        { status: 401 }
      );
    }

    const body = await request.json();
const { title, description, youtubeId, courseTitle, thumbnail, contentType } = body;

    console.log("Received data:", { title, youtubeId, courseTitle });

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        {
          error: "Title is required",
          success: false,
        },
        { status: 400 }
      );
    }

    if (!youtubeId || !youtubeId.trim()) {
      return NextResponse.json(
        {
          error: "YouTube ID is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Check if video with same YouTube ID already exists
    const existingVideo = await knowledgeHub.findOne({ youtubeId });
    if (existingVideo) {
      return NextResponse.json(
        {
          error: "A video with this YouTube ID already exists",
          success: false,
        },
        { status: 400 }
      );
    }

 const newVideo = new knowledgeHub({
  title,
  description: description || "",
  youtubeId,
  courseTitle: courseTitle || "",
  thumbnail: thumbnail || "",
  contentType: contentType || 'video', // NEW
});

    const savedVideo = await newVideo.save();

    console.log("Video created successfully:", savedVideo._id);

    return NextResponse.json(
      {
        message: "Video added successfully",
        success: true,
        data: savedVideo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Server error while creating video:", error);
    return NextResponse.json(
      {
        message: "Server error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update an existing video
export async function PUT(request: NextRequest) {
  try {
    console.log("Updating knowledge hub video...");

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required", success: false },
        { status: 400 }
      );
    }

    // Verify authentication (optional)
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    const userId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please login", success: false },
        { status: 401 }
      );
    }

    const existingVideo = await knowledgeHub.findById(videoId);
    if (!existingVideo) {
      return NextResponse.json(
        { error: "Video not found", success: false },
        { status: 404 }
      );
    }

    const body = await request.json();
const { title, description, youtubeId, courseTitle, thumbnail, contentType } = body;

    console.log("Update data:", { title, youtubeId, courseTitle });

    if (!title || !title.trim()) {
      return NextResponse.json(
        {
          error: "Title is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Check if another video with same YouTube ID exists (exclude current video)
    if (youtubeId) {
      const duplicateVideo = await knowledgeHub.findOne({
        youtubeId,
        _id: { $ne: videoId },
      });
      if (duplicateVideo) {
        return NextResponse.json(
          {
            error: "Another video with this YouTube ID already exists",
            success: false,
          },
          { status: 400 }
        );
      }
    }

    const updatedVideo = await knowledgeHub.findByIdAndUpdate(
  videoId,
  {
    title,
    description: description || "",
    youtubeId: youtubeId || "",
    courseTitle: courseTitle || "",
    thumbnail: thumbnail || "",
    contentType: contentType || 'video', // NEW
  },
  { new: true, runValidators: true }
);
    console.log("Video updated successfully:", updatedVideo?._id);

    return NextResponse.json(
      {
        message: "Video updated successfully",
        success: true,
        data: updatedVideo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error while updating video:", error);
    return NextResponse.json(
      {
        message: "Server error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a video
export async function DELETE(request: NextRequest) {
  try {
    console.log("Deleting knowledge hub video...");

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required", success: false },
        { status: 400 }
      );
    }

    // Verify authentication (optional)
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    const decodedToken = token ? jwt.decode(token) : null;
    const userId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please login", success: false },
        { status: 401 }
      );
    }

    const existingVideo = await knowledgeHub.findById(videoId);
    if (!existingVideo) {
      return NextResponse.json(
        { error: "Video not found", success: false },
        { status: 404 }
      );
    }

    console.log("Found video to delete:", existingVideo);

    await knowledgeHub.findByIdAndDelete(videoId);

    console.log("Video deleted successfully");

    return NextResponse.json(
      {
        message: "Video deleted successfully",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error while deleting video:", error);
    return NextResponse.json(
      {
        message: "Server error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}