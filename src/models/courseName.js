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
  courseQuality:{
    type:Number
  },
  performanceScores:[{
    userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"users"
    },
    score:{
      type:Number
    },
    date:{
      type:Date,
      default:Date.now
    }
  }],
  curriculum:{
    type:[{
      sessionNo:String,
      topic: String,
      tangibleOutcome:String
    }]
  }
}, {
  timestamps: true
});

db.coursenames.createIndex({ _id: 1 });


export default mongoose.models.courseName || mongoose.model('courseName', courseNameSchema);
