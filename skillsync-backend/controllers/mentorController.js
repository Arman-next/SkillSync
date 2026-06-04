import MentorProfile from "../models/MentorProfile.js";

// @route   POST /api/mentor/profile
// @desc    Create mentor profile (first time)
// @access  Mentor only
const createProfile = async (req, res) => {
  const { bio, skills, portfolioURL, linkedInURL, hourlyRate, experience } =
    req.body;

  try {
    // Check if profile already exists
    const existing = await MentorProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Profile already exists. Use update instead." });
    }

    // Basic validation
    if (!bio || !skills || skills.length === 0 || !hourlyRate) {
      return res
        .status(400)
        .json({ message: "Bio, skills, and hourly rate are required" });
    }

    if (!portfolioURL && !linkedInURL) {
      return res.status(400).json({
        message: "At least one of portfolio URL or LinkedIn URL is required",
      });
    }

    const profile = await MentorProfile.create({
      userId: req.user._id,
      bio,
      skills,
      portfolioURL,
      linkedInURL,
      hourlyRate,
      experience,
      isProfileComplete: true,
    });

    res.status(201).json({ message: "Profile created successfully", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/mentor/profile
// @desc    Update mentor profile
// @access  Mentor only
const updateProfile = async (req, res) => {
  const { bio, skills, portfolioURL, linkedInURL, hourlyRate, experience } =
    req.body;

  try {
    const profile = await MentorProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Profile not found. Please create one first." });
    }

    // Update fields
    profile.bio = bio || profile.bio;
    profile.skills = skills || profile.skills;
    profile.portfolioURL = portfolioURL || profile.portfolioURL;
    profile.linkedInURL = linkedInURL || profile.linkedInURL;
    profile.hourlyRate = hourlyRate || profile.hourlyRate;
    profile.experience = experience || profile.experience;

    // If mentor updates profile after rejection — reset to pending
    // isVerified stays as is unless admin changes it

    await profile.save();

    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/mentor/profile
// @desc    Get logged-in mentor's own profile
// @access  Mentor only
const getMyProfile = async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/mentor/:id
// @desc    Get any mentor's profile by userId (for student browsing)
// @access  Public
const getMentorById = async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({
      userId: req.params.id,
      isVerified: true,
    }).populate("userId", "name email"); // attach mentor's name and email

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Mentor not found or not yet verified" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/mentor/browse
// @desc    Get all verified mentors with optional filters
// @access  Public (students + anyone)
const browseMentors = async (req, res) => {
  try {
    const { skill, minPrice, maxPrice, search } = req.query;

    // Start with only verified mentors
    let filter = { isVerified: true };

    // Filter by skill (case-insensitive)
    if (skill) {
      filter.skills = { $in: [new RegExp(skill, "i")] };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.hourlyRate = {};
      if (minPrice) filter.hourlyRate.$gte = Number(minPrice);
      if (maxPrice) filter.hourlyRate.$lte = Number(maxPrice);
    }

    let mentors = await MentorProfile.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // Search by name (after populate, filter in JS)
    if (search) {
      const searchLower = search.toLowerCase();
      mentors = mentors.filter(
        (m) =>
          m.userId?.name?.toLowerCase().includes(searchLower) ||
          m.bio?.toLowerCase().includes(searchLower) ||
          m.skills?.some((s) => s.toLowerCase().includes(searchLower)),
      );
    }

    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/mentor/public/:userId
// @desc    Get a single verified mentor's full profile by userId
// @access  Public
const getMentorPublicProfile = async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({
      userId: req.params.userId,
      isVerified: true,
    }).populate("userId", "name email");

    if (!profile) {
      return res.status(404).json({
        message: "Mentor not found or not verified",
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createProfile,
  updateProfile,
  getMyProfile,
  getMentorById,
  browseMentors,
  getMentorPublicProfile,
};
