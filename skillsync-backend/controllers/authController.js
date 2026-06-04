import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, password, role } = req.body;
  const email = req.body.email?.trim().toLowerCase();

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Validate role — admin cannot register via API
    if (!["student", "mentor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Create user
    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email?.trim().toLowerCase();

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/auth/me  (get logged in user)
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
};

export { registerUser, loginUser, getMe };
