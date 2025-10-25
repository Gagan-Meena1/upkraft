// models/knowledgeHub.js
import mongoose from 'mongoose';

const knowledgeHubSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the knowledgeHub'],
    trim: true,
  },
  description: {
    type: String,
    // required: [true, 'Please provide a description for the knowledgeHub'],
  },
  youtubeId: {
    type: String,
    // Not required as it's optional
  },
  courseTitle: {
    type: String,
    // Not required as it's optional
  },
  thumbnail: {
    type: String
  },
  
},
{ timestamps: true }
);

// Check if the model already exists to prevent overwriting during hot reloads
const knowledgeHub = mongoose.models.knowledgeHub || mongoose.model('knowledgeHub', knowledgeHubSchema);
// db.knowledgeHubs.createIndex({ courseId: 1, status: 1 });


export default knowledgeHub;
