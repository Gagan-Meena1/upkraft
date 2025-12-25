import mongoose from 'mongoose';
import { type } from 'os';

const feedbackVocalSchema = new mongoose.Schema({
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
  
  vocalTechniqueAndControl: { 
    type: String, 
  },
  toneQualityAndRange: { 
    type: String, 
  },
  rhythmTimingAndMusicality:{
    type:String
  },
  dictionAndArticulation:{
    type:String
  },
  expressionAndPerformance:{
    type:String
  },
  progressAndPracticeHabits:{
    type:String
  },
  personalFeedback: {
    type: String,
  }

}, {
  timestamps: true
});

export default mongoose.models.feedbackVocal || mongoose.model('feedbackVocal', feedbackVocalSchema);