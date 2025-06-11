import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import { log } from 'console';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { NextRequest,NextResponse } from 'next/server'

connect()

export async function POST(request : NextRequest ){
    try{
        const reqBody=await request.json();
         const {email,password}=reqBody;
        const emailLowerCase = email.toLowerCase();


        const user = await User.findOne({
          $or: [
            { email: email },
            { emailLowerCase: emailLowerCase }
          ]
        });
        
        if(!user){
            return NextResponse.json({error:"User does not exists"})
           
        }

        console.log("User exists");
        

       const validPassword=await bcryptjs.compare(password,user.password);
       if(!validPassword)
       {
          console.log("[Invalid Password]");
          return NextResponse.json({error:"check your credentials"})

       }

       console.log("[Valid Password]");
       
       const tokenData={
        id:user._id,
        username:user.username,
        email:user.email,
        category:user.category
       }

        // Generate JWT token
      const token=await jwt.sign(tokenData,process.env.TOKEN_SECRET!,{expiresIn:'1d'});
      console.log("[Token generated]");
      const response=NextResponse.json({
        message: "Login successful",
        token, // Send token if using authentication
        user: {
          id: user._id,
          email: user.email,
          category: user.category, // Student, Tutor, etc.
          isVerified: user.isVerified, // Include verification status
        },
      });

      response.cookies.set("token",token,{
        httpOnly:true
      })

       console.log("[Login successful]");
       return response

    }
    catch(error:any){
      console.log("[Error during login]");
      console.log(error.message);
      
        return NextResponse.json({error:error.message})
    }


    
}
