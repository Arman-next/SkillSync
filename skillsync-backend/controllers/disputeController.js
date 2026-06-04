import Dispute from "../models/Dispute.js";
import Session from "../models/Session.js";
import Payment from "../models/Payment.js";

// ─────────────────────────────────────────────────────────────
// @route   POST /api/disputes/:sessionId
// @desc    Student raises a dispute for a completed session
// @access  Student only
// ─────────────────────────────────────────────────────────────

const raiseDispute = async (req, res) => {
  const { reason, description } = req.body;

  try {
    if (!reason) {
      return res.status(400).json({
        message: "Please select a reason for the dispute",
      });
    }

    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Only student of this session can raise dispute
    if (!session.studentId.equals(req.user._id)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Only completed or confirmed sessions can be disputed
    if (!["completed", "confirmed"].includes(session.status)) {
      return res.status(400).json({
        message: "Only completed or confirmed sessions can be disputed",
      });
    }

    // Student can dispute within 24 hours. For completed sessions, use the
    // actual completion timestamp because mentors may end early.
    const windowStart =
      session.status === "completed"
        ? session.updatedAt
        : new Date(
            new Date(
              `${session.scheduledDate}T${session.scheduledTime}:00`,
            ).getTime() +
              session.duration * 60 * 1000,
          );

    const hoursSinceWindowStart =
      (new Date() - windowStart) / (1000 * 60 * 60);

    if (hoursSinceWindowStart < 0) {
      return res.status(400).json({
        message: "Dispute window opens after the session ends.",
      });
    }

    if (hoursSinceWindowStart > 24) {
      return res.status(400).json({
        message:
          "Dispute window has closed. Disputes must be raised within 24 hours of session end.",
      });
    }

    // Check no duplicate dispute
    const existing = await Dispute.findOne({
      sessionId: session._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "A dispute already exists for this session",
      });
    }

    // Find payment record
    const payment = await Payment.findOne({
      sessionId: session._id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    // Create dispute
    const dispute = await Dispute.create({
      sessionId: session._id,
      studentId: req.user._id,
      mentorId: session.mentorId,
      paymentId: payment._id,
      reason,
      description: description || "",
    });

    // Update session and payment status
    session.status = "disputed";
    await session.save();

    payment.paymentStatus = "disputed";
    await payment.save();

    res.status(201).json({
      message:
        "Dispute raised successfully. Admin will review within 24 hours.",
      dispute,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/disputes/my
// @desc    Get dispute raised by logged-in student
// @access  Student only
// ─────────────────────────────────────────────────────────────
const getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({
      studentId: req.user._id,
    })
      .populate(
        "sessionId",
        "topic scheduledDate scheduledTime duration amount",
      )
      .populate("mentorId", "name email")
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/disputes/:sessionId/check
// @desc    Check if a dispute exists for a session
// @access  Student of that session
// ─────────────────────────────────────────────────────────────
const checkDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findOne({
      sessionId: req.params.sessionId,
    });

    res.json({
      exists: !!dispute,
      dispute: dispute || null,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { raiseDispute, getMyDisputes, checkDispute };
