import mongoose from "mongoose";

export interface DeletePackageRequestDocument extends mongoose.Document {
  studentId: mongoose.Types.ObjectId;
  tutorId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  packageId: string;
  startDate: string;
  endDate: string;
  numberOfClasses: number;
  status: "pending" | "done" | "rejected";
  createdAt: Date;
}

declare const DeletePackageRequest: mongoose.Model<DeletePackageRequestDocument>;

export default DeletePackageRequest;
