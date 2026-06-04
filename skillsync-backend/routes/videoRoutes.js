import express from "express";
import {
  createVideoRoom,
  getVideoRoom,
  completeSession,
} from "../controllers/videoController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create video room — student or mentor
router.post("/create-room/:sessionId", protect, createVideoRoom);

// Get existing room URL — student or mentor
router.get("/room/:sessionId", protect, getVideoRoom);

// Mark session complete — mentor only
router.put(
  "/complete/:sessionId",
  protect,
  authorizeRole("mentor"),
  completeSession,
);

export default router;
