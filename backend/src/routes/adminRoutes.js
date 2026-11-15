import express from "express";
import authenticate from "../middleware/auth.js";
import role from "../middleware/role.js";
import { getCharts, getDashboard } from "../controllers/adminController.js";

const router = express.Router();

router.use(authenticate, role("admin"));
router.get("/dashboard", getDashboard);
router.get("/charts", getCharts);

export default router;
