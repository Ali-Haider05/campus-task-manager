import express from "express";
import authenticate from "../middleware/auth.js";
import role from "../middleware/role.js";
import { createStudent, getStudents } from "../controllers/studentController.js";

const router = express.Router();

router.use(authenticate, role("admin"));
router.get("/", getStudents);
router.post("/", createStudent);

export default router;
