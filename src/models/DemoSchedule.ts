import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRegistration extends Document {
  demoDate: string;
  demoTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const DemoScheduleSchema: Schema = new Schema(
  {
    demoDate: { type: String, default: null },
    demoTime: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

// DemoSchedule.index({ userType: 1, createdAt: -1 });

const DemoSchedule: Model<IRegistration> = mongoose.models.DemoSchedule || mongoose.model<IRegistration>("DemoSchedule", DemoScheduleSchema);

export default DemoSchedule;
