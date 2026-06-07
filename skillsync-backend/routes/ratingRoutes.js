import express from "express";
import {
  getMyMentorRating,
  rateMentor,
} from "../controllers/ratingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/mentors/:mentorId/my",
  protect,
  authorizeRole("student"),
  getMyMentorRating,
);

router.post(
  "/mentors/:mentorId",
  protect,
  authorizeRole("student"),
  rateMentor,
);

export default router;
