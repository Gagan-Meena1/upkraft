import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import { log } from 'console';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { NextRequest,NextResponse } from 'next/server'

connect()

export async function POST(request : NextRequest ){
    try{
      console.log("PRINT 0");
        const reqBody=await request.json();
         const {email,password}=reqBody;
        //  validation
        console.log(reqBody);
        console.log("PRINT 1");


        const user=await User.findOne({email});
        console.log("PRINT 2");
        if(!user){
          console.log("PRINT 3");
            return NextResponse.json({error:"User does not exists"})
           
        }

        console.log("User exists");
        

       const validPassword=await bcryptjs.compare(password,user.password);
       console.log("PRINT 4");
       if(!validPassword)
       {
                console.log("PRINT 5");

        return NextResponse.json({error:"check your credentials"})

       }
  console.log("Print 5.1");
  
       const tokenData={
        id:user._id,
        username:user.username,
        email:user.email,
        category:user.category
       }
       console.log("PRINT 6");
      const token=await jwt.sign(tokenData,process.env.TOKEN_SECRET!,{expiresIn:'1d'});
      console.log("PRINT 7");
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
       console.log("PRINT 8");
      return response

    }
    catch(error:any){
      console.log("PRINT 9");
      console.log(error.message);
      
        return NextResponse.json({error:error.message})
    }


    
}
