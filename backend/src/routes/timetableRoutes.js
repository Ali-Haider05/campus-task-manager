import express from "express";
import authenticate from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  createTimetableSlot,
  getTimetable,
} from "../controllers/timetableController.js";

const router = express.Router();

router.get("/", authenticate, getTimetable);
router.post("/", authenticate, role("admin"), createTimetableSlot);

export default router;
