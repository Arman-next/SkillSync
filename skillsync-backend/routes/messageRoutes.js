import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Send a message — student or mentor
router.post("/:sessionId", protect, sendMessage);

// Get all messages for a session — student or mentor
router.get("/:sessionId", protect, getMessages);

export default router;
