import mongoose from "mongoose";
import User from "./src/models/userModel.js";

async function main() {
    await mongoose.connect("mongodb+srv://developer:6kI3Z840H69sEOfP@cluster0.hft47.mongodb.net/upkraft?retryWrites=true&w=majority&appName=Cluster0");
    
    // The studentId from the url is 69817ceafc3bd995778ed163
    const student = await User.findById("69817ceafc3bd995778ed163").populate("courses");
    console.log("Student courses:");
    student.courses.forEach(c => console.log(c.title || c.courseName || c.name));
    
    process.exit(0);
}

main();
