import mongoose from 'mongoose';
import { type } from 'os';

const feedbackDrumsSchema = new mongoose.Schema({
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
  
  techniqueAndFundamentals: { 
    type: String, 
  },
  timingAndTempo: { 
    type: String, 
  },
  coordinationAndIndependence:{
    type:String
  },
  dynamicsAndMusicality:{
    type:String
  },
  patternKnowledgeAndReading:{
    type:String
  },
  progressAndPracticeHabits:{
    type:String
  }

}, {
  timestamps: true
});

export default mongoose.models.feedbackDrums || mongoose.model('feedbackDrums', feedbackDrumsSchema);