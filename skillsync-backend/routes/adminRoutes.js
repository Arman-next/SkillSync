import express from "express";
const router = express.Router();
import {
  getAllMentors,
  verifyMentor,
  rejectMentor,
  getStats,
} from "../controllers/adminController.js";
import {
  getAllDisputes,
  getDisputeStats,
  resolveDispute,
} from "../controllers/adminDisputeController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

// All admin routes are protected + admin only
router.use(protect, authorizeRole("admin"));

router.get("/mentors", getAllMentors);
router.put("/mentors/:id/verify", verifyMentor);
router.put("/mentors/:id/reject", rejectMentor);

router.get("/stats", getStats);

router.get("/disputes", getAllDisputes);
router.put("/disputes/:id/resolve", resolveDispute);
router.get("/disputes/stats", getDisputeStats);

export default router;
