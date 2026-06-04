import Session from "../models/Session.js";
import MentorProfile from "../models/MentorProfile.js";
import User from "../models/User.js";
import AISummary from "../models/AISummary.js";
import Message from "../models/Message.js";
import Payment from "../models/Payment.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// @route   POST /api/sessions/book
// @desc    Create a new session booking (status: pending_payment)
// @access  Student only
const bookSession = async (req, res) => {
  const {
    mentorId,
    topic,
    learningGoal,
    scheduledDate,
    scheduledTime,
    duration,
  } = req.body;

  try {
    if (
      !mentorId ||
      !topic ||
      !learningGoal ||
      !scheduledDate ||
      !scheduledTime ||
      !duration
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const mentorProfile = await MentorProfile.findOne({
      userId: mentorId,
      isVerified: true,
    });

    if (!mentorProfile) {
      return res
        .status(404)
        .json({ message: "Mentor not found or not verified" });
    }

    if (mentorId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot book a session with yourself" });
    }

    const duplicate = await Session.findOne({
      mentorId,
      scheduledDate,
      scheduledTime,
      status: { $in: ["pending_payment", "confirmed"] },
    });

    if (duplicate) {
      return res.status(400).json({
        message:
          "This time slot is already booked. Please choose a different time.",
      });
    }

    const amount = Math.round((mentorProfile.hourlyRate / 60) * duration);

    const session = await Session.create({
      studentId: req.user._id,
      mentorId,
      topic,
      learningGoal,
      scheduledDate,
      scheduledTime,
      duration,
      amount,
      status: "pending_payment",
    });

    const populated = await Session.findById(session._id)
      .populate("studentId", "name email")
      .populate("mentorId", "name email");

    res.status(201).json({
      message:
        "Session booked successfully. Please complete payment to confirm.",
      session: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/sessions/student
const getStudentSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ studentId: req.user._id })
      .populate("mentorId", "name email")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/sessions/mentor
const getMentorSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ mentorId: req.user._id })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    const payments = await Payment.find({
      sessionId: { $in: sessions.map((session) => session._id) },
    }).select("sessionId paymentStatus amount");

    const paymentBySessionId = new Map(
      payments.map((payment) => [payment.sessionId.toString(), payment]),
    );

    const sessionsWithPayment = sessions.map((session) => {
      const sessionObject = session.toObject();
      const payment = paymentBySessionId.get(session._id.toString());

      return {
        ...sessionObject,
        paymentStatus: payment?.paymentStatus || null,
        paymentAmount: payment?.amount || session.amount,
      };
    });

    res.json(sessionsWithPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/sessions/:id
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("mentorId", "name email");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const isParticipant =
      session.studentId._id.equals(req.user._id) ||
      session.mentorId._id.equals(req.user._id);

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/sessions/:id/cancel
const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.studentId.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (session.status !== "pending_payment") {
      return res.status(400).json({
        message:
          "Only unpaid sessions can be cancelled. For paid sessions, use the dispute system.",
      });
    }

    session.status = "cancelled";
    await session.save();

    res.json({ message: "Session cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// This route now does TWO things:
// 1. Marks session as completed
// 2. Auto-triggers AI summary generation

// Helper: same Gemini call as aiController
// We duplicate it here so session completion triggers it automatically
const autoGenerateSummary = async (session) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    // Don't generate if already exists
    const existing = await AISummary.findOne({ sessionId: session._id });
    if (existing) return;

    const mentorProfile = await MentorProfile.findOne({
      userId: session.mentorId,
    });

    const mentorSkills = mentorProfile?.skills || [];

    const prompt = `
You are an educational AI assistant for SkillSync, a mentorship platform.

A one-on-one mentorship session has just been completed. Here are the details:

- Topic: ${session.topic}
- Student's Learning Goal: ${session.learningGoal}
- Mentor's Skills: ${mentorSkills.join(", ")}
- Session Duration: ${session.duration} minutes

Please generate a structured post-session report for the student with exactly these sections:

SUMMARY
Write 2-3 sentences summarizing what was likely covered in this session based on the topic and learning goal.

ACTION ITEMS
List exactly 3 specific, actionable tasks the student should do after this session to reinforce their learning. Be specific and practical.

RESOURCES
List exactly 2 specific learning resources (websites, documentation, or courses) relevant to the topic.

Keep the tone encouraging and professional.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API call failed");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    // Parse response
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let summaryText = "";
    let actionItems = [];
    let resources = [];
    let currentSection = "";

    for (const line of lines) {
      const lower = line.toLowerCase();

      if (lower.includes("summary")) {
        currentSection = "summary";
        continue;
      }

      if (lower.includes("action item") || lower.includes("next step")) {
        currentSection = "actions";
        continue;
      }

      if (lower.includes("resource") || lower.includes("recommend")) {
        currentSection = "resources";
        continue;
      }

      const cleaned = line
        .replace(/^[\*\-\d\.\)\•]+\s*/, "")
        .replace(/\*\*/g, "")
        .trim();

      if (!cleaned) continue;

      if (currentSection === "summary") {
        summaryText += (summaryText ? " " : "") + cleaned;
      } else if (currentSection === "actions" && actionItems.length < 3) {
        actionItems.push(cleaned);
      } else if (currentSection === "resources" && resources.length < 2) {
        resources.push(cleaned);
      }
    }

    if (!summaryText) {
      summaryText = lines.slice(0, 3).join(" ").replace(/\*\*/g, "");
    }

    while (actionItems.length < 3) {
      actionItems.push("Review the topics covered in this session");
    }

    while (resources.length < 2) {
      resources.push(
        "Search for tutorials on this topic on YouTube or freeCodeCamp",
      );
    }

    await AISummary.create({
      sessionId: session._id,
      studentId: session.studentId,
      mentorId: session.mentorId,
      summaryText: summaryText.slice(0, 800),
      actionItems: actionItems.slice(0, 3),
      resources: resources.slice(0, 2),
      topic: session.topic,
      learningGoal: session.learningGoal,
      mentorSkills,
      duration: session.duration,
    });

    console.log(`✅ AI summary generated for session ${session._id}`);
  } catch (err) {
    console.error("AI summary generation failed:", err.message);
  }
};

const completeSessionRoute = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (!session.mentorId.equals(req.user._id)) {
      return res.status(403).json({
        message: "Only the mentor can complete a session",
      });
    }

    if (session.status !== "confirmed") {
      return res.status(400).json({
        message: "Session is not in confirmed state",
      });
    }

    // Mark as completed
    session.mentorMessageCount = await Message.countDocuments({
      sessionId: session._id,
      senderRole: "mentor",
    });
    session.studentMessageCount = await Message.countDocuments({
      sessionId: session._id,
      senderRole: "student",
    });
    session.status = "completed";
    await session.save();

    // Auto-generate AI summary in background
    // We don't await this — session completion responds immediately
    // AI summary generates asynchronously
    autoGenerateSummary(session);

    res.json({
      message:
        "Session completed. AI summary is being generated for the student.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  bookSession,
  getStudentSessions,
  getMentorSessions,
  getSessionById,
  cancelSession,
  completeSessionRoute,
};
