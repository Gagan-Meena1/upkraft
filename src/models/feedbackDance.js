import mongoose from 'mongoose';
import { type } from 'os';

const feedbackDanceSchema = new mongoose.Schema({
    technique: { 
    type: String, 
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
  
  musicality: { 
    type: String, 
  },
  retention: { 
    type: String, 
  },
  performance:{
    type:String
  },
  effort:{
    type:String
  },
  personalFeedback:{
    type:String
  }

}, {
  timestamps: true
});

export default mongoose.models.feedbackDance || mongoose.model('feedbackDance', feedbackDanceSchema);