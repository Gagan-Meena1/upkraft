import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";

export async function GET(req: NextRequest, { params }: { params: Record<string, string> })  {
  try {
    await connect();
 

    // Fix database query - Ensure user is found
    const user = await User.find({ category: "Tutor" }).select("-password");
    console.log("2222222222222222222222222222222222222222222222222222222");
    console.log(user);
    
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
   

    const respo= NextResponse.json({ user});
    console.log("333333333333333333333333333333333333333333333");
    
    return respo;
    
  } catch (error:any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
