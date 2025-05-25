// models/Assignment.js
import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the assignment'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for the assignment'],
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide a deadline for the assignment'],
  },
  status:{
    type:Boolean,
    
  },
  fileUrl: {
    type: String,
    // Not required as it's optional
  },
  fileName: {
    type: String,
    // Not required as it's optional
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Please provide a class ID'],
  },
   
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courseName',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model already exists to prevent overwriting during hot reloads
const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);

export default Assignment;