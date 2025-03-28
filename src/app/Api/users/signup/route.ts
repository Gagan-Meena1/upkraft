import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import bcryptjs from 'bcryptjs'
import { NextRequest,NextResponse } from 'next/server'
import{sendEmail} from '@/helper/mailer'


connect();
export async function POST(request : NextRequest ){
    try{
        
         const reqBody=await request.json();
         const {username,email,password,category}=reqBody;
        //  validation
        console.log(reqBody);


        const user = await User.findOne({email})

        if(user)
        {
            return NextResponse.json({error:"User already exists"})
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword=await bcryptjs.hash(password,salt)

       const newUser= new User({
            username,
            email,
            password:hashedPassword,
            category,
            

        })

        const savedUser=await newUser.save();
        console.log(savedUser);

        // send verification email
        await sendEmail({email,emailType:"VERIFY",userId:savedUser._id})

        return NextResponse.json({
            message:"User registered successfully",
            success:true,
            savedUser
        })

    }
    catch(error:any){
        return NextResponse.json({error:error.message})
    }
}