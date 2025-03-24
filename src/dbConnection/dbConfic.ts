import { log } from "console";
import mongoose from "mongoose";


export async function connect(){
    try{
        log(process.env.MONGO_URL)
        mongoose.connect(process.env.MONGO_URL!)
        const connection=mongoose.connection;
        connection.on('connected',()=>{
            console.log("Mongo DB connected");
        })
        mongoose.connection.on('error', (err) => {
            console.error("MongoDB connection error:", err);
        });
        
    }
    catch(error){
        console.log("something went wrong in connecting DB");
        console.log(error);
    }
}