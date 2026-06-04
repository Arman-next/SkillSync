import express from "express";
import {
  createOrder,
  verifyPayment,
  getPaymentBySession,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create Razorpay order — student only
router.post("/create-order", protect, authorizeRole("student"), createOrder);

// Verify payment after Razorpay callback — student only
router.post("/verify", protect, authorizeRole("student"), verifyPayment);

// Get payment info for a session — student or mentor
router.get("/session/:sessionId", protect, getPaymentBySession);

export default router;
