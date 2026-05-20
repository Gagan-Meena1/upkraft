import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegistration extends Document {
  userType: 'Student' | 'Tutor';
  name: string;
  city: string;
  societyName?: string | null;
  contactNumber: string;
  countryCode: string;
  email: string;
  instrument: string;
  participantName?: string | null;
  age?: number | null;
  notes?: string | null;
  payment?: { amount: number; status: string };
  status?: string;
  tutorName?: string | null;
  demoDate?: string | null;
  demoTime?: string | null;
  resumeUrl?: string | null;
  resumeFileName?: string | null;
  address?: string | null;
  classId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema: Schema = new Schema(
  {
    userType: {
      type: String,
      required: [true, 'User type is required'],
      enum: ['Student', 'Tutor'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    societyName: { type: String, trim: true, default: null },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    countryCode: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    instrument: {
      type: String,
      required: [true, 'Instrument is required'],
      trim: true,
    },
    participantName: { type: String, trim: true, default: null },
    age: { type: Number, default: null },
    notes: { type: String, trim: true, default: null },
    payment: {
      amount: { type: Number, default: 0 },
      status: { type: String, enum: ['Done', 'Pending'], default: 'Pending' }
    },
    status: {
      type: String,
      enum: ['Done', 'Pending', 'Cancelled', 'Overdue'],
      default: 'Pending'
    },
    tutorName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      default: null,
    },
    demoDate: { type: String, default: null },
    demoTime: { type: String, default: null },
    resumeUrl: { type: String, default: null },
    resumeFileName: { type: String, default: null },
    address: { type: String, trim: true, default: null },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  },
  {
    timestamps: true,
  }
);

RegistrationSchema.index({ userType: 1, createdAt: -1 });

const Registration: Model<IRegistration> =
  mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema);

export default Registration;