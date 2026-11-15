import express from "express";
import {
  getCourseStudents,
  getFacultyCourses,
  getFacultySchedule,
} from "../controllers/facultyController.js";
import authenticate from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

router.use(authenticate, role("faculty"));
router.get("/courses", getFacultyCourses);
router.get("/courses/:id/students", getCourseStudents);
router.get("/schedule", getFacultySchedule);

export default router;
