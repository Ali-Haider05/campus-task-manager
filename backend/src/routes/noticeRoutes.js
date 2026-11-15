import express from "express";
import authenticate from "../middleware/auth.js";
import role from "../middleware/role.js";
import { createNotice, getNotices } from "../controllers/noticeController.js";

const router = express.Router();

router.get("/", authenticate, getNotices);
router.post("/", authenticate, role("admin"), createNotice);

export default router;
