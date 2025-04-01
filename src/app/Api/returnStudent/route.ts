import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";  // Ensure jwt is imported

export async function GET(req: NextRequest, { params }: { params: Record<string, string> })  {
  try {
    await connect();
    console.log("111111111111111111111111111111111")

    // Get the class ID from query parameters
    // const url = new URL(req.url);
    // const courseId = url.searchParams.get("courseId");
    // Get token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "No token found" }, { status: 401 });

    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // const userId = decodedToken.id;
    // console.log("User ID:", userId);
    // console.log("User ID:", req);

    // Fix database query - Ensure user is found
    const user = await User.find({ category: "Student" });
    console.log("2222222222222222222222222222222222222222222222222222222");
    console.log(user);
    
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // user.age?user.age=user.age:user.age=18;
    // user.address?user.address=user.address:user.address="";
    // user.contact?user.contact=user.contact:user.contact="";

    const respo= NextResponse.json({ 
    //   _id: user._id, 
    //   name: user.username, 
    //   email: user.email,  // Fix: use `user.email`
    //   category: user.category ,
    //   age:user.age,
    //   address:user.address,
    //   contact:user.contact,
    //   courses:user.courses,
    //   createdAt: user.createdAt // ✅ Send createdAt in response
    user

    });
    console.log("333333333333333333333333333333333333333333333");
    
    return respo;
    
  } catch (error:any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
