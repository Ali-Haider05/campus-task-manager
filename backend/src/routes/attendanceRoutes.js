import express from "express";
import { markAttendance } from "../controllers/facultyController.js";
import authenticate from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

router.post("/", authenticate, role("faculty"), markAttendance);

export default router;
