import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
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
    topic: {
      type: String,
      required: [true, "Session topic is required"],
      trim: true,
    },
    learningGoal: {
      type: String,
      required: [true, "Learning goal is required"],
      trim: true,
    },
    scheduledDate: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      enum: [30, 60, 90],
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending_payment",
        "confirmed",
        "completed",
        "cancelled",
        "disputed",
      ],
      default: "pending_payment",
    },
    videoRoomUrl: {
      type: String,
      default: "",
    },
    mentorJoinedAt: {
      type: Date,
      default: null,
    },
    studentJoinedAt: {
      type: Date,
      default: null,
    },
    actualDuration: {
      type: Number,
      default: 0,
    },
    mentorMessageCount: {
      type: Number,
      default: 0,
    },
    studentMessageCount: {
      type: Number,
      default: 0,
    },
    flag: {
      type: String,
      enum: ["NONE", "SHORT_SESSION", "LOW_ENGAGEMENT", "NO_SHOW"],
      default: "NONE",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Session", sessionSchema);
