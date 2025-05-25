import mongoose from 'mongoose';
import { type } from 'os';

const classQualitySchema = new mongoose.Schema({
   classDuration: { 
    type: String, 
    required: true 
  },
  sessionFocusAreaStatedClearly
: { 
    type: String, 
    required: true 
  },
  instructorId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users",
    // required:true
  },
  class: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class"
       
  },
  ContentDeliveredAligningToDriveSessionFocusArea: { 
    type: String, 
  },
   studentEngagement: { 
    type: String, 
  },
    studentPracticallyDemonstratedProgressOnConcept: { 
    type: String, 
  },
  KeyPerformance : { 
    type: String, 
  },
  tutorCommunicationTonality:{
    type: String, 

  },
 personalFeedback:{
    type: String, 

  },
 
}, {
  timestamps: true
});

export default mongoose.models.classQuality || mongoose.model('classQuality', classQualitySchema);