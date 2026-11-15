
import "dotenv/config";
import dns from "node:dns";
import cors from "cors";
import express from "express";
import connectDB from "./src/config/db.js";
import errorHandler from "./src/middleware/errorHandler.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";
import facultyRoutes from "./src/routes/facultyRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import noticeRoutes from "./src/routes/noticeRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import studentPortalRoutes from "./src/routes/studentPortalRoutes.js";
import timetableRoutes from "./src/routes/timetableRoutes.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/student", studentPortalRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/notices", noticeRoutes);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
