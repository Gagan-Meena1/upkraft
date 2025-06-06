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
  }
}, {
  timestamps: true
});

export default mongoose.models.courseName || mongoose.model('courseName', courseNameSchema);