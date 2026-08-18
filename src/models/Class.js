import mongoose from 'mongoose';
import { type } from 'os';
import feedback from './feedback';

/**
 * Where the tutor's device was when they started or ended the session.
 *
 * Best-effort: a tutor who denies location permission, or is indoors with no
 * fix, still runs their class — the field is simply absent. Treat a missing
 * location as "not captured", never as "was not there".
 */
const RunLocationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    /** Radius of 68% confidence, in metres, as reported by the device. */
    accuracy: { type: Number, default: null },
    capturedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  // sessionNo:{
  //   type:Number,
  //   required:true
  // },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "courseName"

  },

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  feedbackId: {
    type: mongoose.Schema.Types.ObjectId, //make array type array m object(feedbackid and user id)
    ref: "feedback"
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment"
  },
  description: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },

  // When the tutor actually ran the session, which is rarely exactly the
  // scheduled window — they start late, finish early, or overrun. `startTime`
  // /`endTime` stay the plan; these two are the record of what happened.
  //
  // `actualEndTime` is also the authoritative "this class is over" signal:
  // feedback is gated on it (see the mobile client's `classPhase`). A class
  // with `actualStartTime` set and `actualEndTime` null is live.
  actualStartTime: {
    type: Date,
    default: null
  },
  actualEndTime: {
    type: Date,
    default: null
  },

  // True when `actualStartTime`/`actualEndTime` were filled in after the fact
  // rather than observed live — a tutor recording a class they taught but
  // never pressed Start on. The times are then the tutor's account of the
  // session, not a measurement of it, and anything reading drift or location
  // off this class should say so.
  runBackfilled: {
    type: Boolean,
    default: false
  },

  // Where the tutor was when they pressed Start / End. Optional by design —
  // see RunLocationSchema. Never set on a backfilled run: the tutor is not
  // there any more, so a fix taken then would place them somewhere they were
  // not at the time.
  actualStartLocation: {
    type: RunLocationSchema,
    default: null
  },
  actualEndLocation: {
    type: RunLocationSchema,
    default: null
  },

  reasonForReschedule: {
    type: String,
    default: ""
  },
  reasonForCancelation: {
    type: String,
    default: ""
  },
  recurrenceType: {
    type: String,
    enum: ['daily', 'weekly', 'weekdays', null],
    default: null
  },
  // NEW: group id for recurring series (daily/weekly/weekdays)
  recurrenceId: {
    type: String,
    default: null,
  },
  recurrenceUntil: {
    type: Date,
    default: null
  },

  recording: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GridFSFile" // Reference to GridFS file
  },
  recordingFileName: String,      // Original filename

  recordingUrl: {
    type: String, // Storing the public S3 URL
    required: false, // Or true, if a recording is always expected
  },

  performanceVideo: {
    type: String, // Public S3 URL for the performance video
  },
  performanceVideoFileName: String, // Original filename

  groupPhoto: {
    type: String, // Public S3 URL for the group class photo
    default: "",
  },

  csat: {
    type: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
      },
      rating: {
        type: Number
      },
      feedback: String
    }]
  },
  status: {
    type: String,
    enum: ['scheduled', 'edited', 'rescheduled', 'completed', 'canceled'],
    default: 'scheduled'
  },
  classType:{
    type: String,
    enum: ['regular', 'makeup', 'trial'],
    default: 'regular'
  },

  joinLink: {
    type: String,
    default: null,
  },

  deleteRequest: {
    type: Boolean,
    default: false,
  },
  deleteRequestStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', null],
    default: null,
  },
  deleteRequestType: {
    type: String,
    enum: ['full', 'partial'],
    default: 'full',
  },
  deleteRequestStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  }],

  // Class Quality Evaluation Data
  evaluation: {
    session_focus_clarity_score: Number,
    session_focus_clarity_score_justification: String,
    content_delivery_score: Number,
    content_delivery_justification: String,
    student_engagement_score: Number,
    student_engagement_justification: String,
    student_progress_score: Number,
    student_progress_justification: String,
    key_performance_score: Number,
    key_performance_justification: String,
    communication_score: Number,
    communication_justification: String,
    overall_quality_score: Number,
    overall_quality_justification: String
  },

  whatsappSentCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

// db.classes.createIndex({ startTime: 1 });
// db.classes.createIndex({ _id: 1, startTime: 1 });
// In Class model — replace existing index with:
ClassSchema.index({ course: 1, startTime: 1 });           // for this query
ClassSchema.index({ _id: 1, endTime: 1, status: 1 });

/**
 * `mongoose.models` lives on the mongoose singleton, which survives the module
 * recompiles Next does on every save — so a model compiled before a schema edit
 * outlives that edit. Strict mode then drops assignments to the newly added
 * paths *silently*: the route sets `actualStartTime`, `save()` reports success,
 * and nothing is written. Recompiling the model whenever the cached one is
 * missing a path this file declares is what makes a schema change take effect
 * without restarting the server.
 */
const cached = mongoose.models.Class;
const stale = !!cached && Object.keys(ClassSchema.paths).some(p => !cached.schema.path(p));
if (stale) mongoose.deleteModel('Class');

export default (stale ? null : cached) || mongoose.model('Class', ClassSchema);
