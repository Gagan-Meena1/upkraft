import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import { log } from 'console';
import jwt from 'jsonwebtoken'
import { NextRequest,NextResponse } from 'next/server'
import { getDataFromToken } from '@/helper/getDataFromToken';

connect()

export async function GET(request : NextRequest ){
    try {
        const userId= await getDataFromToken(request);
        const user=await User.findOne({_id:userId}).select("-password");
        if (!user) {
            return NextResponse.json({error:"User not found"}, {status: 404});
        }
        return NextResponse.json({
            message:"User found",
            data:user
        });
    } catch(error:any) {
        return NextResponse.json({error: error.message || "Unauthorized"}, {status: 401});
    }
}