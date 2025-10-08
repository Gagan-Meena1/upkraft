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

  recordingUrl: {
    type: String, // Storing the public S3 URL
    required: false, // Or true, if a recording is always expected
  },

  performanceVideo: {
    type: String, // Public S3 URL for the performance video
  },
  performanceVideoFileName: String, // Original filename
  
  // Class Quality Evaluation Data
  evaluation: {
    session_focus_clarity_score: Number,
    session_focus_clarity_score_justification: String,
    content_delivery_score: Number,
    content_delivery_justification: String,
    student_engagement_score: Number,
    student_engagement_justification: String,
    student_progress_score: Number,
    student_progress_justification: String,
    key_performance_score: Number,
    key_performance_justification: String,
    communication_score: Number,
    communication_justification: String,
    overall_quality_score: Number,
    overall_quality_justification: String
  }
  
}, {
  timestamps: true
});

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);
db.classes.createIndex({ startTime: 1 });
db.classes.createIndex({ _id: 1, startTime: 1 });