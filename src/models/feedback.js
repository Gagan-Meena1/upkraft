import mongoose from 'mongoose';
import { type } from 'os';

const feedbackSchema = new mongoose.Schema({
  attendance: { 
    type: Number, 
  },
  instructorId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users",
    required:true
  },
  
  rhythm: { 
    type: String, 
  },
  theoreticalUnderstanding: { 
    type: String, 
  },
  performance:{
    type:String
  },
  earTraining:{
    type:String
  },
  assignment:{
    type:String
  },
  technique:{
    type:String
  },
  personalFeedback:{
    type:String
  }

}, {
  timestamps: true
});

export default mongoose.models.feedback || mongoose.model('feedback', feedbackSchema);