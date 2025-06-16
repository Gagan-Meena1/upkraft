import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  // sessionNo:{
  //   type:Number,
  //   required:true
  // },
  course: { 
    type:mongoose.Schema.Types.ObjectId,
    ref: "courseName"
       
    },
  instructor: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  feedbackId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"feedback"
  },
  assignmentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Assignment"
  },
  description: { 
    type: String, 
    required: true 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  },

  recording:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "GridFSFile" // Reference to GridFS file

  }  ,
  recordingFileName: String,      // Original filename
  performanceVideo:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "GridFSFile" // Reference to GridFS file
  }, 
  performanceVideoFileName: String, // Original filename
  
}, {
  timestamps: true
});

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);