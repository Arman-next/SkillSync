import Dispute from "../models/Dispute.js";
import Session from "../models/Session.js";
import Payment from "../models/Payment.js";
import MentorProfile from "../models/MentorProfile.js";

// ─────────────────────────────────────────────────────────────
// @route   GET /api/admin/disputes
// @desc    Get all disputes with filters
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const getAllDisputes = async (req, res) => {
  try {
    const { status } = req.query; // ?status=open or ?status=resolved

    let filter = {};
    if (status) filter.status = status;

    const disputes = await Dispute.find(filter)
      .populate("studentId", "name email")
      .populate("mentorId", "name email")
      .populate({
        path: "sessionId",
        select:
          "topic scheduledDate scheduledTime duration amount status mentorMessageCount studentMessageCount flag",
      })
      .populate("paymentId", "amount paymentStatus razorpayPaymentId")
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/admin/disputes/:id/resolve
// @desc    Admin resolves a dispute
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const resolveDispute = async (req, res) => {
  const { adminDecision, adminNote } = req.body;

  try {
    if (!adminDecision) {
      return res.status(400).json({
        message: "Admin decision is required",
      });
    }

    const dispute = await Dispute.findById(req.params.id)
      .populate("sessionId")
      .populate("paymentId");

    if (!dispute) {
      return res.status(404).json({
        message: "Dispute not found",
      });
    }

    if (dispute.status === "resolved") {
      return res.status(400).json({
        message: "This dispute is already resolved",
      });
    }

    // Update dispute
    dispute.adminDecision = adminDecision;
    dispute.adminNote = adminNote || "";
    dispute.status = "resolved";
    dispute.resolvedAt = new Date();

    await dispute.save();

    // Update payment status based on decision
    const payment = dispute.paymentId;

    if (adminDecision === "full_refund" || adminDecision === "partial_refund") {
      payment.paymentStatus = "refunded";
      await payment.save();

      await MentorProfile.findOneAndUpdate(
        { userId: dispute.mentorId },
        {
          $inc: {
            disputeCount: 1,
            disputeRefundCount: 1,
          },
        },
      );

      // Update session status back to completed (for records)
      await Session.findByIdAndUpdate(dispute.sessionId._id, {
        status: "completed",
      });
    } else if (adminDecision === "dismissed") {
      // Dismiss → payment released to mentor
      payment.paymentStatus = "released";
      await payment.save();

      await MentorProfile.findOneAndUpdate(
        { userId: dispute.mentorId },
        { $inc: { disputeCount: 1 } },
      );

      await Session.findByIdAndUpdate(dispute.sessionId._id, {
        status: "completed",
      });
    }

    res.json({
      message: `Dispute resolved. Decision: ${adminDecision.replace("_", " ")}`,
      dispute,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/admin/disputes/stats
// @desc    Get dispute statistics
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const getDisputeStats = async (req, res) => {
  try {
    const open = await Dispute.countDocuments({
      status: "open",
    });

    const resolved = await Dispute.countDocuments({
      status: "resolved",
    });

    const refunded = await Dispute.countDocuments({
      adminDecision: {
        $in: ["full_refund", "partial_refund"],
      },
    });

    const dismissed = await Dispute.countDocuments({
      adminDecision: "dismissed",
    });

    res.json({
      open,
      resolved,
      refunded,
      dismissed,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { getAllDisputes, resolveDispute, getDisputeStats };
