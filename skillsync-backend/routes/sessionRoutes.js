import express from "express";
import {
  bookSession,
  getStudentSessions,
  getMentorSessions,
  getSessionById,
  cancelSession,
  completeSessionRoute,
} from "../controllers/sessionController.js";
import Session from "../models/Session.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Book a session — student only
router.post("/book", protect, authorizeRole("student"), bookSession);

// Get all sessions for logged-in student
router.get("/student", protect, authorizeRole("student"), getStudentSessions);

// Get all sessions for logged-in mentor
router.get("/mentor", protect, authorizeRole("mentor"), getMentorSessions);

// Get single session by ID — student or mentor
router.get("/:id", protect, getSessionById);

// Cancel a session — student only
router.put("/:id/cancel", protect, authorizeRole("student"), cancelSession);

// Mark session as completed — mentor only
router.put(
  "/:id/complete",
  protect,
  authorizeRole("mentor"),
  completeSessionRoute,
);

export default router;
