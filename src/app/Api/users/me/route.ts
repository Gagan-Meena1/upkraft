import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import { log } from 'console';
import jwt from 'jsonwebtoken'
import { NextRequest,NextResponse } from 'next/server'
import { getDataFromToken } from '@/helper/getDataFromToken';

connect()

export async function GET(request : NextRequest ){
    // extract data from token
   const userId= await getDataFromToken(request);
    const user=await User.findOne({_id:userId}).select("-password");
    // check if there is no user
    return NextResponse.json({
        message:"User found",
        data:user
    })
}