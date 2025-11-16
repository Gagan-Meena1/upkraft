import mongoose from 'mongoose';
import { type } from 'os';

const feedbackSchema = new mongoose.Schema({
  attendance: { 
    type: Number, 
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users",
    required:true
  },
  classId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Class",
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

feedbackSchema.index({ userId: 1, classId: 1 });


export default mongoose.models.feedback || mongoose.model('feedback', feedbackSchema);