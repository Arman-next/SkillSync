import express from "express";
const router = express.Router();
import {
  createProfile,
  updateProfile,
  getMyProfile,
  getMentorById,
  browseMentors,
  getMentorPublicProfile,
} from "../controllers/mentorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

// Mentor's own profile routes
router.post("/profile", protect, authorizeRole("mentor"), createProfile);
router.put("/profile", protect, authorizeRole("mentor"), updateProfile);
router.get("/profile", protect, authorizeRole("mentor"), getMyProfile);

// Public route — student views a mentor
router.get("/browse", browseMentors);
router.get("/public/:userId", getMentorPublicProfile);
router.get("/:id", getMentorById);

export default router;
