import MentorProfile from "../models/MentorProfile.js";
import User from "../models/User.js";

// @route   GET /api/admin/mentors
// @desc    Get all mentor profiles (verified + unverified)
// @access  Admin only
const getAllMentors = async (req, res) => {
  try {
    const { status } = req.query; // ?status=pending or ?status=verified

    let filter = {};
    if (status === "pending") filter.isVerified = false;
    if (status === "verified") filter.isVerified = true;

    const mentors = await MentorProfile.find(filter)
      .populate("userId", "name email createdAt")
      .sort({ createdAt: -1 }); // newest first

    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/admin/mentors/:id/verify
// @desc    Approve a mentor profile
// @access  Admin only
const verifyMentor = async (req, res) => {
  try {
    const profile = await MentorProfile.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!profile) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    profile.isVerified = true;
    await profile.save();

    res.json({
      message: `Mentor ${profile.userId.name} has been verified successfully`,
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/admin/mentors/:id/reject
// @desc    Reject a mentor profile
// @access  Admin only
const rejectMentor = async (req, res) => {
  try {
    const profile = await MentorProfile.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!profile) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    profile.isVerified = false;
    await profile.save();

    res.json({
      message: `Mentor ${profile.userId.name} has been rejected`,
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/admin/stats
// @desc    Get basic platform stats for admin dashboard
// @access  Admin only
const getStats = async (req, res) => {
  try {
    const totalMentors = await User.countDocuments({ role: "mentor" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const pendingMentors = await MentorProfile.countDocuments({
      isVerified: false,
    });
    const verifiedMentors = await MentorProfile.countDocuments({
      isVerified: true,
    });

    res.json({
      totalMentors,
      totalStudents,
      pendingMentors,
      verifiedMentors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getAllMentors, verifyMentor, rejectMentor, getStats };
