import AISummary from "../models/AISummary.js";
import Session from "../models/Session.js";
import MentorProfile from "../models/MentorProfile.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ─────────────────────────────────────────────────────────────
// Core function: Call Gemini API and parse the response
// ─────────────────────────────────────────────────────────────
const callGeminiAPI = async (prompt) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
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

  // Extract text from Gemini response
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");

  return text;
};

// ─────────────────────────────────────────────────────────────
// Parse Gemini's text response into structured data
// ─────────────────────────────────────────────────────────────
const parseGeminiResponse = (text) => {
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

    // Detect section headers
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

    // Clean line — remove leading bullets, numbers, asterisks
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

  // Fallback — if parsing fails, use first paragraph as summary
  if (!summaryText) {
    summaryText = lines.slice(0, 3).join(" ").replace(/\*\*/g, "");
  }

  // Ensure we always have 3 action items and 2 resources
  while (actionItems.length < 3) {
    actionItems.push("Review the topics covered in this session");
  }

  while (resources.length < 2) {
    resources.push(
      "Search for tutorials on the session topic on YouTube or freeCodeCamp",
    );
  }

  return {
    summaryText: summaryText.slice(0, 800),
    actionItems: actionItems.slice(0, 3),
    resources: resources.slice(0, 2),
  };
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/ai/generate/:sessionId
// @desc    Generate AI summary for a completed session
// @access  Internal — called automatically when mentor ends session
//          Also callable manually by student
// ─────────────────────────────────────────────────────────────
const generateSummary = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId)
      .populate("studentId", "name")
      .populate("mentorId", "name");

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Only generate for completed sessions
    if (session.status !== "completed") {
      return res.status(400).json({
        message: "AI summary is only available for completed sessions",
      });
    }

    // Only the student of this session can request it
    if (
      !session.studentId._id.equals(req.user._id) &&
      !session.mentorId._id.equals(req.user._id)
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Return existing summary if already generated
    const existing = await AISummary.findOne({
      sessionId: session._id,
    });

    if (existing) {
      return res.json(existing);
    }

    // Get mentor skills for context
    const mentorProfile = await MentorProfile.findOne({
      userId: session.mentorId._id,
    });

    const mentorSkills = mentorProfile?.skills || [];

    // Build the prompt
    const prompt = `
You are an educational AI assistant for SkillSync, a mentorship platform.

A one-on-one mentorship session has just been completed. Here are the details:

- Topic: ${session.topic}
- Student's Learning Goal: ${session.learningGoal}
- Mentor's Skills: ${mentorSkills.join(", ")}
- Session Duration: ${session.duration} minutes
- Mentor Name: ${session.mentorId.name}
- Student Name: ${session.studentId.name}

Please generate a structured post-session report for the student with exactly these sections:

SUMMARY
Write 2-3 sentences summarizing what was likely covered in this session based on the topic and learning goal.

ACTION ITEMS
List exactly 3 specific, actionable tasks the student should do after this session to reinforce their learning.

RESOURCES
List exactly 2 specific learning resources relevant to the topic.
`;

    // Call Gemini
    const rawText = await callGeminiAPI(prompt);

    // Parse the response
    const parsed = parseGeminiResponse(rawText);

    // Save to database
    const summary = await AISummary.create({
      sessionId: session._id,
      studentId: session.studentId._id,
      mentorId: session.mentorId._id,
      summaryText: parsed.summaryText,
      actionItems: parsed.actionItems,
      resources: parsed.resources,
      topic: session.topic,
      learningGoal: session.learningGoal,
      mentorSkills,
      duration: session.duration,
    });

    res.status(201).json(summary);
  } catch (error) {
    console.error("AI Summary error:", error);
    res.status(500).json({
      message: "Failed to generate AI summary: " + error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/ai/summary/:sessionId
// @desc    Get existing AI summary for a session
// @access  Student or Mentor of that session
// ─────────────────────────────────────────────────────────────
const getSummary = async (req, res) => {
  try {
    const summary = await AISummary.findOne({
      sessionId: req.params.sessionId,
    });

    if (!summary) {
      return res.status(404).json({
        message: "No summary found for this session",
      });
    }

    // Verify participant
    if (
      !summary.studentId.equals(req.user._id) &&
      !summary.mentorId.equals(req.user._id)
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.json(summary);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/ai/summaries
// @desc    Get all AI summaries for logged-in student
// @access  Student only
// ─────────────────────────────────────────────────────────────
const getStudentSummaries = async (req, res) => {
  try {
    const summaries = await AISummary.find({
      studentId: req.user._id,
    })
      .populate("sessionId", "topic scheduledDate duration")
      .populate("mentorId", "name")
      .sort({ createdAt: -1 });

    res.json(summaries);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { generateSummary, getSummary, getStudentSummaries };
