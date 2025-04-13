import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import  jwt  from 'jsonwebtoken'
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

        const token = request.cookies.get("token")?.value;
        const decodedToken = token ? jwt.decode(token) : null;
        const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        console.log("decodedToken : ",decodedToken);
        console.log("instructorId : ",instructorId);

        const user = await User.findOne({email})

        if(user)
        {
            return NextResponse.json({error:"User already exists"})
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword=await bcryptjs.hash(password,salt)
        const age = 1;
        const address = "";
        const contact = "";
       const newUser= new User({
            username,
            email,
            password:hashedPassword,
            category,
            age,
            address,
            contact,
            

        })
        if (instructorId) {
            newUser.instructorId = Array.isArray(instructorId) ? instructorId : [instructorId];
        }
        console.log(newUser);
        

        const savedUser=await newUser.save();
        console.log("savedUser : ",savedUser);

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