import mongoose from 'mongoose';

/**
 * EventClass collection: stores recurring (event) class series.
 * Each document represents one recurring series with a unique eventId.
 * All individual class instances remain in the Class collection with recurrenceId = eventId.
 */
const EventClassSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  classIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  }],
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courseName',
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  recurrenceType: {
    type: String,
    enum: ['daily', 'weekly', 'weekdays'],
    required: true,
  },
  recurrenceUntil: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

EventClassSchema.index({ eventId: 1 });
EventClassSchema.index({ instructor: 1, course: 1 });

export default mongoose.models.EventClass || mongoose.model('EventClass', EventClassSchema);
