import mongoose from "mongoose";

const attendanceResetRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    classItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },
    relationshipManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
}, {
    timestamps: true
});

if (mongoose.models.AttendanceResetRequest) {
    delete mongoose.models.AttendanceResetRequest;
}

const AttendanceResetRequest = mongoose.model("AttendanceResetRequest", attendanceResetRequestSchema);
export default AttendanceResetRequest;
