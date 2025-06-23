import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import  jwt  from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { NextRequest,NextResponse } from 'next/server'
// import{sendEmail} from '@/helper/mailer'


export async function POST(request : NextRequest ){
    try{
        console.log("[API/signup] Received POST request.");
        // Connect to the database
        await connect();

         const reqBody=await request.json();
         const {username,email,password,category,contact}=reqBody;
        //  validation
        console.log("[API/signup] Request body:", { username, email, category, contact });

        const normalizedEmail = email.toLowerCase();

        const token = request.cookies.get("token")?.value;
        const decodedToken = token ? jwt.decode(token) : null;
        const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        console.log("[API/signup] Decoded token from cookie.", { instructorId });
      
         // Check if user with the same email already exists
        const userByEmail = await User.findOne({ email: { $regex: `^${normalizedEmail}$`, $options: 'i' } });
        if (userByEmail) {
            console.warn("[API/signup] User with this email already exists.", { email });

            return NextResponse.json({
                error: "User with this email already exists",
                success: false
            });
        }

        // Check if user with the same username already exists
        const userByUsername = await User.findOne({ username });
        if (userByUsername) {
            console.warn("[API/signup] Username already taken.", { username });
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
            email: normalizedEmail,
            password:hashedPassword,
            category,
            age,
            address,
            contact,
            

        })
        if (instructorId) {
            newUser.instructorId = Array.isArray(instructorId) ? instructorId : [instructorId];
        }
        console.log("[API/signup] Creating new user object.", { user: newUser.toObject() });
        

        const savedUser=await newUser.save();
        console.log("[API/signup] Successfully saved new user.", { userId: savedUser._id });

        // // send verification email
        // await sendEmail({email,emailType:"VERIFY",userId:savedUser._id})

        return NextResponse.json({
            message:"User registered successfully",
            success:true,
            savedUser
        })

    }
    catch(error:any){
        console.error("[API/signup] An exception occurred.", { error: error.message, stack: error.stack });
        return NextResponse.json({error:error.message})
    }
}