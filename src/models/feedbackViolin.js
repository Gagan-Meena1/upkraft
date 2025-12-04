import mongoose from 'mongoose';
import { type } from 'os';

const feedbackViolinSchema = new mongoose.Schema({
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
  
  postureAndInstrumentHold: { 
    type: String, 
  },
  bowingTechnique: { 
    type: String, 
  },
  intonationAndPitchAccuracy:{
    type:String
  },
  toneQualityAndSoundProduction:{
    type:String
  },
  rhythmMusicalityAndExpression:{
    type:String
  },
  progressAndPracticeHabits:{
    type:String
  }

}, {
  timestamps: true
});

export default mongoose.models.feedbackViolin || mongoose.model('feedbackViolin', feedbackViolinSchema);