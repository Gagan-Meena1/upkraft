import { NextResponse } from "next/server";
import Owner from "@/models/Owner";  // use your new Owner schema
import mongoose from "mongoose";

// MongoDB connection
async function connectDB() {
  if (mongoose.connection.readyState === 1) return; // already connected
  await mongoose.connect(process.env.MONGO_URI || "");
}

// GET Owner by ID
export async function GET(req: Request) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Owner ID is required" }, { status: 400 });
    }

    const owner = await Owner.findById(id);
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    return NextResponse.json(owner, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch owner" }, { status: 500 });
  }
}

// POST / Create or Update Owner
export async function POST(req: Request) {
  await connectDB();

  try {
    const data = await req.json();
    let owner;

    if (data._id) {
      // Update existing owner
      owner = await Owner.findByIdAndUpdate(data._id, data, { new: true });
      if (!owner) {
        return NextResponse.json({ error: "Owner not found" }, { status: 404 });
      }
    } else {
      // Create new owner
      owner = new Owner(data);
      await owner.save();
    }

    return NextResponse.json(
      { message: "Owner saved successfully", owner },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save owner" }, { status: 500 });
  }
}
