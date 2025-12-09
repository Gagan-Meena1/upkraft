// models/Songs.ts - Enhanced with all spreadsheet fields
import mongoose, { Schema, Document } from "mongoose";

export interface ISong extends Document {
  // Basic song info
  title: string;
  artist: string;
  filename: string;
  mimeType: string;
  url: string;
  uploadDate: Date;
  
  // File metadata
  fileType?: 'audio' | 'tablature';
  extension?: string;
  fileSize?: number;
  tags?: string[];
  
  // ✅ NEW: From your spreadsheet
  primaryInstrumentFocus?: string;  // Guitar, Piano, Bass, Drums, etc.
  genre?: string;                   // Hard Rock, Pop, Jazz, etc.
  difficulty?: 'Easy' | 'Beginner' | 'Beginner-Intermediate' | 'Intermediate' | 'Advanced' | 'Expert';
  year?: number;                    // Release year
  notes?: string;                   // Practice notes, techniques, etc.
  skills?: string; 
  institution?: string;             // Institution name (e.g., "Trinity")
  
  // Cloudinary fields
  cloudinaryPublicId?: string;
  cloudinaryResourceType?: 'video' | 'raw';
  cloudinaryFolder?: string;
  
  // Guitar Pro specific metadata
  guitarProVersion?: string;
  tuning?: string;
  tempo?: number;
  
  // Enhanced metadata
  duration?: number;
  downloadCount?: number;
  isActive?: boolean;
  
  // ✅ Additional useful fields
  key?: string;                     // Musical key (C, G, Am, etc.)
  timeSignature?: string;           // 4/4, 3/4, etc.
  capo?: number;                    // Capo position
  alternativeTunings?: string[];    // Alternative tunings
  practiceLevel?: 'Beginner' | 'Intermediate' | 'Advanced'; // Different from difficulty
  learningObjectives?: string[];    // What you'll learn from this song
  relatedSongs?: mongoose.Types.ObjectId[]; // References to similar songs
  
  // Search optimization
  searchText?: string;
}

const SongSchema = new Schema<ISong>({
  // Basic fields
  title: {
    type: String,
    required: true,
    trim: true,
    index: true, // ✅ Add index for better search
  },
  artist: {
    type: String,
    required: true, // ✅ Make required since you have this data
    trim: true,
    index: true,
  },
  filename: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  
  // File metadata
  fileType: {
    type: String,
    default: 'tablature',
  },
  extension: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  
  // ✅ NEW FIELDS from your spreadsheet
  primaryInstrumentFocus: {
    type: String,
    trim: true,
    index: true,

  },
  genre: {
    type: String,
    trim: true,
    index: true,
    // Common genres - you can extend this list
 
  },
  difficulty: {
    type: String,
    index: true,
  },
  year: {
    type: Number,
    max: new Date().getFullYear() + 1,
    index: true,
  },
  notes: {
    type: String,
    trim: true,
    // Store practice notes, techniques, tips
  },
  skills: {
    type: String,
    trim: true,
    // Store required skills as comma-separated string
  },
  institution: {
    type: String,
    default: 'Trinity'
  },
  
  // Cloudinary fields
  cloudinaryPublicId: {
    type: String,
  },
  cloudinaryResourceType: {
    type: String,
  },
  cloudinaryFolder: {
    type: String,
    default: 'music-app/songs',
  },
  
  // Guitar Pro metadata
  guitarProVersion: {
    type: String,
  },
  tuning: {
    type: String,
    default: 'E A D G B E', // Standard tuning
  },
  tempo: {
    type: Number,
    min: 40,
    max: 300,
  },
  
  // Enhanced fields
  duration: {
    type: Number,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // ✅ Additional useful fields
  key: {
    type: String,
    trim: true,
    // Musical keys like C, G, Am, F#m, etc.
  },
  timeSignature: {
    type: String,
    default: '4/4',
  },
  capo: {
    type: Number,
    min: 0,
    max: 12,
    default: 0,
  },
  alternativeTunings: [{
    type: String,
    trim: true,
  }],
  practiceLevel: {
    type: String,
  },
  learningObjectives: [{
    type: String,
    trim: true,
  }],
  relatedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  
  // Search optimization
  searchText: {
    type: String,
    index: true,
  },
}, {
  timestamps: true,
});

// ✅ Enhanced pre-save middleware
SongSchema.pre('save', function(next) {
  // Build comprehensive search text
  const searchableFields = [
    this.title,
    this.artist,
    this.genre,
    this.primaryInstrumentFocus,
    this.skills,
    this.notes,
    this.key,
    ...(this.tags || []),
    ...(this.learningObjectives || [])
  ].filter(Boolean);
  
  this.searchText = searchableFields.join(' ').toLowerCase();
  next();
});



export const Song = mongoose.models.Song || mongoose.model<ISong>("Song", SongSchema);