import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegistration extends Document {
  userType: 'Student' | 'Tutor';
  name: string;
  city: string;
  contactNumber: string;
  countryCode: string;
  email: string;
  instrument: string;
  tutorName?: string | null; // ✅ add this
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
      required: [true, 'Contact number is required'],
      trim: true,
    },
    instrument: {
      type: String,
      required: [true, 'Instrument is required'],
      trim: true,
    },
    tutorName: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

RegistrationSchema.index({ userType: 1, createdAt: -1 });

const Registration: Model<IRegistration> =
  mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema);

export default Registration;