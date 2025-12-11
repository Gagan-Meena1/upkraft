import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      default: "",
    },
    academyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    tutorName: {
      type: String,
      default: "N/A",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseName",
      required: true,
    },
    courseTitle: {
      type: String,
      required: true,
    },
    months: {
      type: Number,
      default: 1,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: "UPI",
    },
    status: {
      type: String,
      default: "Paid",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    validUpto: {
      type: Date,
    },
    isManualEntry: {
      type: Boolean,
      default: false,
    },
    gstRate: {
      type: String,
      default: '18%',
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    baseAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ academyId: 1, paymentDate: -1 });

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;

