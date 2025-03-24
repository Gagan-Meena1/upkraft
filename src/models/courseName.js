import mongoose from 'mongoose';

const courseName = new mongoose.Schema({
  title: { 
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
  
}, {
  timestamps: true
});

export default mongoose.models.courseName || mongoose.model('courseName', courseNameSchema);