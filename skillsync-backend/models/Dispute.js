import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },

    // Reason student selected
    reason: {
      type: String,
      enum: [
        "mentor_no_show",
        "early_exit",
        "unhelpful_session",
        "technical_issues",
        "other",
      ],
      required: true,
    },

    // Student description
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Dispute lifecycle
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved"],
      default: "open",
    },

    // Admin decision
    adminDecision: {
      type: String,
      enum: ["full_refund", "partial_refund", "dismissed", ""],
      default: "",
    },

    adminNote: {
      type: String,
      default: "",
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Dispute", disputeSchema);
