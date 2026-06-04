import express from "express";
import {
  generateSummary,
  getSummary,
  getStudentSummaries,
} from "../controllers/aiController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Generate AI summary for a completed session
router.post("/generate/:sessionId", protect, generateSummary);

// Get summary for a specific session
router.get("/summary/:sessionId", protect, getSummary);

// Get all summaries for logged-in student
router.get(
  "/summaries",
  protect,
  authorizeRole("student"),
  getStudentSummaries,
);

export default router;
