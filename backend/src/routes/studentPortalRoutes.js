import express from "express";
import {
  getAttendance,
  getCourses,
  getFeeVoucher,
  getGpaHistory,
  getOverview,
} from "../controllers/studentPortalController.js";
import authenticate from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

router.use(authenticate, role("student"));
router.get("/overview", getOverview);
router.get("/courses", getCourses);
router.get("/attendance", getAttendance);
router.get("/gpa-history", getGpaHistory);
router.get("/fee-voucher", getFeeVoucher);

export default router;
