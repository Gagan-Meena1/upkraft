import mongoose from 'mongoose';
import { type } from 'os';

const feedbackDrawingSchema = new mongoose.Schema({
    observationalSkills: { 
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
  
  lineQuality: { 
    type: String, 
  },
  proportionPerspective: { 
    type: String, 
  },
   valueShading:{
    type:String
  },
  compositionCreativity:{
    type:String
  },
  personalFeedback:{
    type:String
  }

}, {
  timestamps: true
});

export default mongoose.models.feedbackDrawing || mongoose.model('feedbackDrawing', feedbackDrawingSchema);