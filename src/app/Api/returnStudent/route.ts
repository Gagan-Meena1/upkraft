import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";  // Ensure jwt is imported

export async function GET(req: NextRequest)  {
  try {
    // Auth: check category from token (no DB call)
    const token = req.cookies.get("token")?.value || "";
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const decoded: any = jwt.decode(token);
    if (!decoded?.id) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    const normalizedCat = String(decoded.category || "").toLowerCase().replace(/\s/g, "");
    if (normalizedCat !== "admin") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    await connect();
 

    // Fix database query - Ensure user is found
    const user = await User.find({ category: "Student" }).select("-password");
    console.log("2222222222222222222222222222222222222222222222222222222");
    console.log(user);
    
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // user.age?user.age=user.age:user.age=18;
    // user.address?user.address=user.address:user.address="";
    // user.contact?user.contact=user.contact:user.contact="";

    const respo= NextResponse.json({ 
 
    user

    });
    console.log("333333333333333333333333333333333333333333333");
    
    return respo;
    
  } catch (error:any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
