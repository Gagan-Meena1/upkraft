import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import  jwt  from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { NextRequest,NextResponse } from 'next/server'
import{sendEmail} from '@/helper/mailer'


export async function POST(request : NextRequest ){
    try{
        console.log("Request received at /signup route");
        // Connect to the database
        await connect();

         const reqBody=await request.json();
         const {username,email,password,category,contact}=reqBody;
        //  validation
        console.log(reqBody);

        const token = request.cookies.get("token")?.value;
        const decodedToken = token ? jwt.decode(token) : null;
        const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        console.log("decodedToken : ",decodedToken);
        console.log("instructorId : ",instructorId);

      
         // Check if user with the same email already exists
        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
            console.log("print 2");

            return NextResponse.json({
                error: "User with this email already exists",
                success: false
            });
        }

        // Check if user with the same username already exists
        const userByUsername = await User.findOne({ username });
        if (userByUsername) {
            return NextResponse.json({
                error: "Username already taken. Please choose a different username",
                success: false
            });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword=await bcryptjs.hash(password,salt)
        const age = 1;
        const address = "";
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