import mongoose from "mongoose";

const DeletePackageRequestSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseName",
        required: true,
    },
    packageId: {
        type: String,
        required: true,
    },
    startDate: {
        type: String,
        required: true,
    },
    endDate: {
        type: String,
        required: true,
    },
    numberOfClasses: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "done", "rejected"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Delete the model if it exists to ensure hot-reloading uses the latest schema
if (mongoose.models.DeletePackageRequest) {
    delete mongoose.models.DeletePackageRequest;
}

export default mongoose.model("DeletePackageRequest", DeletePackageRequestSchema);
