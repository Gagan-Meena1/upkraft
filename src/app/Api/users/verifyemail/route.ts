import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import { NextRequest,NextResponse } from 'next/server'
import{sendEmail} from '@/helper/mailer'
// import { console } from 'inspector'

connect()
export async function POST(request:NextRequest) {
    try{
        const reqBody=await request.json();
        const {token}=reqBody;
        console.log(token);

        const user=await User.findOne({verifyToken:token,
            verifyTokenExpiry:{$gt:Date.now()}
        })

        if(!user)
        {
            return NextResponse.json({error:"Invalid token"})

        }
        console.log(user);
        user.isVerified=true;
        user.verifyToken=undefined;
        user.verifyTokenExpiry=undefined;

        await user.save();
        return NextResponse.json({
            message:"Email verified successfully",
            success:true
        })


        
        
    }
    catch(error:any){
        return NextResponse.json({error:error.message})
    }
}