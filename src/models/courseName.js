import mongoose from 'mongoose';
import { type } from 'os';

const courseNameSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  instructorId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users",
    required:true
  },
  class: { 
    type: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Class"
        }
         ]
  },
  description: { 
    type: String, 
  },
  duration: { 
    type: String, 
  },
  price:{
    type:Number
  },
  curriculum:{
    type:[{
      sessionNo:String,
      topic: String,
      tangibleOutcome:String
    }]
  },
  performanceScores: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    dateRecorded: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.models.courseName || mongoose.model('courseName', courseNameSchema);