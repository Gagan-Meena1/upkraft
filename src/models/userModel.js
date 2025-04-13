import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
    username: {
        type:String,
        required : [true , "Please provide a username"],
        // unique:[true , "username is not unique"]
    },
    age: {
        type:Number,
        default:1  
    },
    address: {
        type:String,
        default:""
    },
    contact: {
        type:String,
        default:""
    },
    email: {
        type:String,
        required : [true , "Please provide a email"],
        unique:[true , "email is not unique"]
    },
    password: {
        type:String,
        required : [true , "Please provide a password"],
    },
    instructorId:{type:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"users"
        }
    ]
},
    category:{
        type:String,
        required:[true,"please state your role"]
    },
    courses:{
        type:[
            {
            type:mongoose.Schema.Types.ObjectId,
            ref:"courseName",
            }
        ]
    }
    ,
    isVerified:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class" // Should match mongoose.model("classes", classSchema)
    }]
    ,
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry:Date,
    verifyToken:String,
    verifyTokenExpiry:Date,
},
{timestamps:true}
)

const User = mongoose.models.users || mongoose.model("users",userSchema)
export default User