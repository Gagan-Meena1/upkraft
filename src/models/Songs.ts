// models/Songs.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISong extends Document {
  title: string;
  artist?: string;
  filename: string;
  mimeType: string;
  url: string;
  uploadDate: Date;
  fileType?: 'audio' | 'tablature';
  extension?: string;
  fileSize?: number;
  tags?: string[];
  // Additional metadata for Guitar Pro files
  guitarProVersion?: string;
  tuning?: string;
  tempo?: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

const SongSchema = new Schema<ISong>({
  title: { 
    type: String, 
    required: true,
    trim: true,
  },
  artist: { 
    type: String, 
    default: "",
    trim: true,
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
  fileType: {
    type: String,
    enum: ['audio', 'tablature'],
    default: 'tablature',
  },
  extension: {
    type: String,
  },
  fileSize: {
    type: Number, // in bytes
  },
  tags: [{
    type: String,
    trim: true,
  }],
  // Additional metadata for Guitar Pro files
  guitarProVersion: {
    type: String, // e.g., "5.2", "6.0", "7.5", "8.0"
  },
  tuning: {
    type: String, // e.g., "E A D G B E"
  },
  tempo: {
    type: Number, // BPM
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
});

// Index for search functionality
SongSchema.index({ title: 'text', artist: 'text' });
SongSchema.index({ uploadDate: -1 });
SongSchema.index({ fileType: 1 });
SongSchema.index({ extension: 1 });

export const Song = mongoose.models.Song || mongoose.model<ISong>("Song", SongSchema);