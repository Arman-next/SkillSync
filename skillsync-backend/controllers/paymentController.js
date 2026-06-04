import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Session from "../models/Session.js";

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing from environment variables");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/payment/create-order
// @desc    Create a Razorpay order for a session
// @access  Student only
// ────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  const { sessionId } = req.body;

  try {
    // Find the session
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Make sure this student owns the session
    if (!session.studentId.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Only allow payment for pending_payment sessions
    if (session.status !== "pending_payment") {
      return res.status(400).json({
        message: "This session has already been paid or is not payable.",
      });
    }

    // Check if a Razorpay order already exists for this session
    const existingPayment = await Payment.findOne({ sessionId });

    if (existingPayment) {
      // Return the existing order so frontend can reuse it
      return res.json({
        orderId: existingPayment.razorpayOrderId,
        amount: existingPayment.amount * 100,
        currency: "INR",
      });
    }

    // Create new Razorpay order
    // Amount must be in paise (1 INR = 100 paise)
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: session.amount * 100,
      currency: "INR",
      receipt: `session_${sessionId}`,
    });

    // Save payment record in DB. It becomes captured after verification.
    await Payment.create({
      sessionId,
      studentId: req.user._id,
      mentorId: session.mentorId,
      amount: session.amount,
      razorpayOrderId: order.id,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({
      message: "Payment initiation failed. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment signature and confirm session
// @access  Student only
// ────────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    sessionId,
  } = req.body;

  try {
    // ── CRITICAL STEP: Verify the signature ──────────────────
    // This proves the payment actually came from Razorpay
    // and was not tampered with
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return res.status(400).json({
        message: "Payment verification failed. Invalid signature.",
      });
    }
    // ─────────────────────────────────────────────────────────

    // Find the payment record
    const payment = await Payment.findOne({ sessionId });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    // Update payment record with Razorpay details
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paymentStatus = "captured";

    await payment.save();

    // Update session status to confirmed
    await Session.findByIdAndUpdate(sessionId, {
      status: "confirmed",
    });

    res.json({
      message: "Payment verified successfully. Session is now confirmed!",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      message: "Payment verification failed. Contact support.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/payment/session/:sessionId
// @desc    Get payment details for a session
// @access  Student or Mentor of that session
// ─────────────────────────────────────────────────────────────
const getPaymentBySession = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      sessionId: req.params.sessionId,
    });

    if (!payment) {
      return res.status(404).json({
        message: "No payment found for this session",
      });
    }

    // Only allow participants to view payment
    const isParticipant =
      payment.studentId.equals(req.user._id) ||
      payment.mentorId.equals(req.user._id);

    if (!isParticipant) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createOrder, verifyPayment, getPaymentBySession };
