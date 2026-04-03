import mongoose from "mongoose";

const reassignRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    oldTutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    newTutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
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
    reason: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const ReassignRequest = mongoose.models.ReassignRequest || mongoose.model("ReassignRequest", reassignRequestSchema);
export default ReassignRequest;
