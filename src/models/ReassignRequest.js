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
    reassignType: {
        type: String,
        enum: ["permanent", "temporary"],
        default: "permanent"
    },
    reason: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Delete the model if it exists to ensure schema updates are picked up in Next.js
if (mongoose.models.ReassignRequest) {
    delete mongoose.models.ReassignRequest;
}

const ReassignRequest = mongoose.model("ReassignRequest", reassignRequestSchema);
export default ReassignRequest;
