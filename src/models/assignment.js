// models/Assignment.js
import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the assignment'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for the assignment'],
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide a deadline for the assignment'],
  },
  status:{
    type:Boolean,
    
  },
  fileUrl: {
    type: String,
    // Not required as it's optional
  },
  fileName: {
    type: String,
    // Not required as it's optional
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Please provide a class ID'],
  },
   
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courseName',
  },
  userId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  songName:{
    type:String,

  },
  practiceStudio:{
    type:Boolean,
  },
  speed:{
    type:String,
    enum:['25%','50%','75%','100%'],
  },
  metronome:{
    type:String,
    enum:['25%','50%','75%','100%'],
  },
  cloudinaryPublicId: {
  type: String,
  // Store Cloudinary public_id for file management
}

});

// Check if the model already exists to prevent overwriting during hot reloads
const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);

db.assignments.createIndex({ courseId: 1, status: 1 });


export default Assignment;
