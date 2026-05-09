import mongoose from 'mongoose';
import { type } from 'os';

const SocietySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  city:{
    type: String,
    required: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  tutors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],



}, {
  timestamps: true
});



export default mongoose.models.society || mongoose.model('society', SocietySchema);
