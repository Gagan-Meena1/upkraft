import { NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";  // Ensure jwt is imported

export async function GET(request) {
  try {
    await connect();
    console.log("Fetching user...");

    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "No token found" }, { status: 401 });

    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.id;
    console.log("User ID:", userId);

    // Fix database query - Ensure user is found
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      _id: user._id, 
      name: user.username, 
      email: user.email,  // Fix: use `user.email`
      category: user.category 
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
