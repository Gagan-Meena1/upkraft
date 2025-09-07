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
  
  // ✅ Cloudinary specific fields
  cloudinaryPublicId?: string;  // For file management/deletion
  cloudinaryResourceType?: 'video' | 'raw';  // Cloudinary resource type
  cloudinaryFolder?: string;    // Folder path in Cloudinary
  
  // Additional metadata for Guitar Pro files
  guitarProVersion?: string;
  tuning?: string;
  tempo?: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  
  // ✅ Enhanced metadata
  duration?: number;           // For audio files (in seconds)
  downloadCount?: number;      // Track popularity
  isActive?: boolean;          // For soft delete
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
  
  // ✅ Cloudinary fields
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  cloudinaryResourceType: {
    type: String,
    enum: ['video', 'raw'],
    required: true,
  },
  cloudinaryFolder: {
    type: String,
    default: 'music-app/songs',
  },
  
  // Guitar Pro metadata
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
  
  // ✅ Enhanced fields
  duration: {
    type: Number, // seconds
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
});

// ✅ Enhanced indexes for better search performance
SongSchema.index({ title: 'text', artist: 'text', tags: 'text' });
export const Song = mongoose.models.Song || mongoose.model<ISong>("Song", SongSchema);