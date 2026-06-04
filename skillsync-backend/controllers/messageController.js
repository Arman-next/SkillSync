import Message from "../models/Message.js";
import Session from "../models/Session.js";

// Helper — check if user is a participant of the session
const isParticipant = (session, userId) => {
  return session.studentId.equals(userId) || session.mentorId.equals(userId);
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/messages/:sessionId
// @desc    Send a message in a session thread
// @access  Student or Mentor of that session
// ─────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  const { content } = req.body;

  try {
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    // Find session and verify participant
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (!isParticipant(session, req.user._id)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Only allow messaging for confirmed or completed sessions
    if (!["confirmed", "completed"].includes(session.status)) {
      return res.status(400).json({
        message: "Messaging is only available for confirmed sessions",
      });
    }

    const message = await Message.create({
      sessionId: req.params.sessionId,
      senderId: req.user._id,
      senderRole: req.user.role,
      content: content.trim(),
    });

    await Session.updateOne(
      { _id: session._id },
      {
        $inc: {
          [req.user.role === "mentor"
            ? "mentorMessageCount"
            : "studentMessageCount"]: 1,
        },
      },
    );

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/messages/:sessionId
// @desc    Get all messages for a session thread
// @access  Student or Mentor of that session
// ─────────────────────────────────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (!isParticipant(session, req.user._id)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const messages = await Message.find({
      sessionId: req.params.sessionId,
    })
      .populate("senderId", "name")
      .sort({ createdAt: 1 }); // oldest first

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { sendMessage, getMessages };
