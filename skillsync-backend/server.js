import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import Payment from "./models/Payment.js";
import Session from "./models/Session.js";
import Dispute from "./models/Dispute.js";

const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

connectDB();

// Run every hour: auto-release captured payments after the 24-hour dispute window.
const autoReleasePayments = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const sessions = await Session.find({
      status: "completed",
      updatedAt: { $lt: twentyFourHoursAgo },
    });

    for (const session of sessions) {
      const dispute = await Dispute.findOne({
        sessionId: session._id,
      });

      if (dispute) continue;

      const payment = await Payment.findOne({
        sessionId: session._id,
        paymentStatus: "captured",
      });

      if (payment) {
        payment.paymentStatus = "released";
        await payment.save();

        console.log(`Payment released for session ${session._id}`);
      }
    }
  } catch (err) {
    console.error("Auto-release error:", err.message);
  }
};

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/ratings", ratingRoutes);

app.get("/", (req, res) => {
  res.send("SkillSync API running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

autoReleasePayments();
setInterval(autoReleasePayments, 60 * 60 * 1000);
