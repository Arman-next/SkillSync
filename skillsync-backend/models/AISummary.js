import mongoose from "mongoose";

const aiSummarySchema = new mongoose.Schema(
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

    // What Gemini generates
    summaryText: {
      type: String,
      required: true,
    },

    actionItems: {
      type: [String],
      default: [],
    },

    resources: {
      type: [String],
      default: [],
    },

    // Input sent to Gemini
    topic: String,
    learningGoal: String,
    mentorSkills: [String],
    duration: Number,
  },
  { timestamps: true },
);

export default mongoose.model("AISummary", aiSummarySchema);
