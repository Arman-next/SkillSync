import mongoose from "mongoose";
import MentorProfile from "../models/MentorProfile.js";
import Rating from "../models/Rating.js";
import Session from "../models/Session.js";

const updateMentorRatingStats = async (mentorId) => {
  const [stats] = await Rating.aggregate([
    { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
    {
      $group: {
        _id: "$mentorId",
        averageRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  await MentorProfile.findOneAndUpdate(
    { userId: mentorId },
    {
      averageRating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
      ratingCount: stats?.ratingCount || 0,
    },
  );

  return {
    averageRating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
    ratingCount: stats?.ratingCount || 0,
  };
};

// @route   GET /api/ratings/mentors/:mentorId/my
// @desc    Check whether logged-in student can rate a mentor
// @access  Student only
const getMyMentorRating = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const completedSession = await Session.findOne({
      studentId: req.user._id,
      mentorId,
      status: "completed",
    }).sort({ updatedAt: -1 });

    const existingRating = await Rating.findOne({
      studentId: req.user._id,
      mentorId,
    });

    res.json({
      canRate: Boolean(completedSession),
      rating: existingRating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/ratings/mentors/:mentorId
// @desc    Create or update a mentor rating
// @access  Student only
const rateMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { rating, comment } = req.body;
    const ratingValue = Number(rating);

    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const mentorProfile = await MentorProfile.findOne({
      userId: mentorId,
      isVerified: true,
    });

    if (!mentorProfile) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const completedSession = await Session.findOne({
      studentId: req.user._id,
      mentorId,
      status: "completed",
    }).sort({ updatedAt: -1 });

    if (!completedSession) {
      return res.status(403).json({
        message: "You can rate this mentor after completing at least one session",
      });
    }

    const savedRating = await Rating.findOneAndUpdate(
      {
        studentId: req.user._id,
        mentorId,
      },
      {
        studentId: req.user._id,
        mentorId,
        sessionId: completedSession._id,
        rating: ratingValue,
        comment: comment || "",
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    const stats = await updateMentorRatingStats(mentorId);

    res.json({
      message: "Rating saved successfully",
      rating: savedRating,
      ...stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getMyMentorRating, rateMentor };
