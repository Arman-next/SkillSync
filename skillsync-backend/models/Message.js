import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["student", "mentor"],
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message cannot be empty"],
      trim: true,
      maxlength: [1000, "Message too long"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Message", messageSchema);
