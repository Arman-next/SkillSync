import mongoose from "mongoose";

const mentorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    skills: {
      type: [String], // e.g. ["React", "Node.js", "MongoDB"]
      default: [],
    },
    portfolioURL: {
      type: String,
      trim: true,
      default: "",
    },
    linkedInURL: {
      type: String,
      trim: true,
      default: "",
    },
    hourlyRate: {
      type: Number, // in INR
      default: 0,
    },
    experience: {
      type: String, // e.g. "3 years"
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false, // admin must approve
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    disputeCount: {
      type: Number,
      default: 0,
    },
    disputeRefundCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("MentorProfile", mentorProfileSchema);
