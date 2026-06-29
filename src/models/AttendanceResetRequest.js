import mongoose from "mongoose";

const attendanceResetRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null  // null when it's a class-level cancellation
    },
    // NEW — for class-level cancellation affecting multiple students
    students: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        }],
        default: []
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
    },
    requestedChange: {
        type: String,
        enum: ["present", "absent", "cancelled"],
        required: true
    },
    creditDeduction: {
        type: Boolean,
        default: null
    },
    singleStudent: {
        type: Boolean,
        default: false
    },
    reasonForCancellation: {
        type: String,
        default: ""
    },
    // NEW — to distinguish class-level vs individual reset
    requestType: {
        type: String,
        enum: ["individual", "class"],
        default: "individual"
    }
}, {
    timestamps: true
});

if (mongoose.models.AttendanceResetRequest) {
    delete mongoose.models.AttendanceResetRequest;
}

const AttendanceResetRequest = mongoose.model("AttendanceResetRequest", attendanceResetRequestSchema);
export default AttendanceResetRequest;