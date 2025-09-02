// Enhanced User Schema with Tutor Profile Fields
// models/userModel.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide a username"],
    },
    age: {
        type: Number,
        default: 1  
    },
    address: {
        type: String,
        default: ""
    },
    contact: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: [true, "email is not unique"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    instructorId: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users"
            }
        ]
    },
    category: {
        type: String,
        required: [true, "please state your role"]
    },
    courses: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "courseName",
            }
        ]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    }],
    // Additional Tutor Profile Fields
    profileImage: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
   
    skills: {
        type: String,
        default: ""
    },
    experience: {
        type: Number,
        default: 0
    },
    education: {
        type: String,
        default: ""
    },
    studentsCoached: {
        type: Number,
        default: 0
    },
    teachingMode: {
        type: String,
        enum: ["Online", "In-person", "Both", ""],
        default: ""
    },
    instagramLink:{
        type:String,
        default:""
    },
    assignment:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment"
    }],
    aboutMyself: {
        type: String,
        default: ""
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
},
{timestamps: true}
);

const User = mongoose.models.users || mongoose.model("users", userSchema);
export default User;