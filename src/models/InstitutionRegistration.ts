import mongoose, { Schema, Document } from "mongoose";

export interface IInstitutionRegistration extends Document {
  role: string;
  name: string;
  phone: string;
  email: string;
  institutionName: string;
  city: string;
  studentCount?: string;
  type: "School" | "Academy";
  createdAt: Date;
}

const InstitutionRegistrationSchema = new Schema<IInstitutionRegistration>({
  role: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  institutionName: { type: String, required: true },
  city: { type: String, required: true },
  studentCount: { type: String },
  type: { type: String, enum: ["School", "Academy"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.InstitutionRegistration ||
  mongoose.model<IInstitutionRegistration>(
    "InstitutionRegistration",
    InstitutionRegistrationSchema
  );
