import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
// import { request } from "http";

export const getDataFromToken=(request:NextRequest)=>{
    try{
        const cookieToken = request.cookies.get("token")?.value || "";
        const authHeader = request.headers.get("Authorization") || "";
        const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        const token = cookieToken || bearerToken;
       const decodedToken:any= jwt.verify(token,process.env.TOKEN_SECRET!)
       return decodedToken.id
    }
    catch(error:any){
        throw new Error(error.message)
    }
}