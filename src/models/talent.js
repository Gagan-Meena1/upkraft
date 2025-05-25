// models/Assignment.js
import mongoose, { Mongoose } from 'mongoose';

const talentSchema = new mongoose.Schema({
  recommendation: {
    type: String,
    required: [true, 'Please provide a description for the assignment'],
  },
  fileUrl: {
    type: String,
    // Not required as it's optional
  },
  fileName: {
    type: String,
    // Not required as it's optional
  },
  studentId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model already exists to prevent overwriting during hot reloads
const talent = mongoose.models.talent || mongoose.model('talent', talentSchema);

export default talent;