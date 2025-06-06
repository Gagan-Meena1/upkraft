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
//   daysOfWeek: { 
//     type: [String], 
//     // required: true,
//     enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] 
//   },
  recording:{
    type:String,
  },
  performanceVideo:{
    type:String,
  },
  // recordingProcessed:{
  //   type:Number,
  //   min: [0, "Processed must be at least 0%"], // Minimum value
  //   max: [100, "Processed must not exceed 100%"], // Maximum value
  //   default: 0 // Default value
  // }
//   maxCapacity: { 
//     type: Number, 
//     required: true 
//   },
//   currentEnrollment: { 
//     type: Number, 
//     default: 0 
//   },
//   location: { 
//     type: String, 
//     required: true 
//   },
//   color: { 
//     type: String, 
//     default: '#3498db' 
//   }
}, {
  timestamps: true
});

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);