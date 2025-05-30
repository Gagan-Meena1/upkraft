import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";  // Ensure jwt is imported

export async function GET(req: NextRequest)  {
  try {
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
