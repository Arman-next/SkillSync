import express from "express";
import {
  raiseDispute,
  getMyDisputes,
  checkDispute,
} from "../controllers/disputeController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Raise a dispute — student only
router.post("/:sessionId", protect, authorizeRole("student"), raiseDispute);

// Get all disputes for logged-in student
router.get("/my/list", protect, authorizeRole("student"), getMyDisputes);

// Check if dispute exists for a session
router.get("/:sessionId/check", protect, checkDispute);

export default router;
