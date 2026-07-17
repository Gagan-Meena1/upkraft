import { connect } from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import { log } from 'console';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'


export async function POST(request: NextRequest) {
  try {
    await connect();

    const reqBody = await request.json();
    const { email, password } = reqBody;


    console.log("email : ", email);

    const emailLowerCase = email.toLowerCase();

    console.log("email : ", email)
    const user = await User.findOne({ email: emailLowerCase });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("User exists");


    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("[Valid Password]");

    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
      category: user.category
    }

    // Generate JWT token
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: '1d' });
    console.log("[Token generated]");
    const response = NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        category: user.category,
        isVerified: user.isVerified,

      },

    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    console.log("[Login successful]");
    return response

  }
  catch (error: any) {
    console.log("[Error during login]");
    console.log(error.message);

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
