import "dotenv/config";
import mongoose from "mongoose";
import dns from "../config/dns.js";
import connectDB from "../config/db.js";
import Attendance from "../models/Attendance.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Faculty from "../models/Faculty.js";
import FeeVoucher from "../models/FeeVoucher.js";
import GpaHistory from "../models/GpaHistory.js";
import Notice from "../models/Notice.js";
import Student from "../models/Student.js";
import TimetableSlot from "../models/TimetableSlot.js";
import User from "../models/User.js";

const semester = 7;
const dueDate = new Date("2026-11-30T00:00:00.000Z");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const studentData = [
  { name: "Muhammad Ali Khan", email: "ali@uni.edu", rollNo: "BCS-FA22-019", department: "CS", cgpa: 3.78 },
  { name: "Ayesha Malik", email: "ayesha@uni.edu", rollNo: "BCS-FA22-020", department: "CS", cgpa: 3.62 },
  { name: "Hamza Ahmed", email: "hamza@uni.edu", rollNo: "BSE-FA22-011", department: "SE", cgpa: 3.45 },
  { name: "Fatima Noor", email: "fatima@uni.edu", rollNo: "BEE-FA22-008", department: "EE", cgpa: 3.81 },
  { name: "Usman Tariq", email: "usman@uni.edu", rollNo: "BBA-FA22-014", department: "BBA", cgpa: 3.29 },
  { name: "Zainab Iqbal", email: "zainab@uni.edu", rollNo: "BCS-FA22-021", department: "CS", cgpa: 3.56 },
  { name: "Bilal Hussain", email: "bilal@uni.edu", rollNo: "BSE-FA22-012", department: "SE", cgpa: 3.38 },
];

const courseData = [
  { code: "CS-311", title: "Algorithms", creditHours: 3, lectureHall: "LH-1" },
  { code: "CS-401", title: "Artificial Intelligence", creditHours: 3, lectureHall: "LH-2" },
  { code: "SE-305", title: "Software Design", creditHours: 3, lectureHall: "LH-3" },
  { code: "EE-210", title: "Digital Logic Design", creditHours: 3, lectureHall: "LH-4" },
  { code: "BBA-101", title: "Principles of Management", creditHours: 3, lectureHall: "LH-5" },
];

const shuffle = (items) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = (index * 17 + 11) % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

const getAttendanceStatuses = (isAli) => {
  if (isAli) {
    return shuffle([
      ...Array(137).fill("present"),
      ...Array(8).fill("absent"),
      ...Array(5).fill("late"),
    ]);
  }

  return Array.from({ length: 30 }, (_, index) => {
    const value = (index * 13 + 7) % 20;
    return value < 16 ? "present" : value < 19 ? "late" : "absent";
  });
};

const getPastDates = () =>
  Array.from({ length: 30 }, (_, index) => {
    const date = new Date("2026-11-14T00:00:00.000Z");
    date.setUTCDate(date.getUTCDate() - (29 - index));
    return date;
  });

const clearCollections = async () => {
  await Promise.all([
    Attendance.deleteMany({}),
    Course.deleteMany({}),
    Enrollment.deleteMany({}),
    Faculty.deleteMany({}),
    FeeVoucher.deleteMany({}),
    GpaHistory.deleteMany({}),
    Notice.deleteMany({}),
    Student.deleteMany({}),
    TimetableSlot.deleteMany({}),
    User.deleteMany({}),
  ]);
};

const seed = async () => {
  await connectDB();
  await clearCollections();

  const credentials = [
    { email: "admin@uni.edu", password: "Admin@123", role: "admin" },
    { email: "tariq@uni.edu", password: "Faculty@123", role: "faculty" },
    ...studentData.map(({ email }) => ({
      email,
      password: "Student@123",
      role: "student",
    })),
  ];

  const adminUser = await User.create({
    name: "University Admin",
    email: "admin@uni.edu",
    password: "Admin@123",
    role: "admin",
  });
  const facultyUser = await User.create({
    name: "Dr. Tariq Mehmood",
    email: "tariq@uni.edu",
    password: "Faculty@123",
    role: "faculty",
  });
  const faculty = await Faculty.create({
    user: facultyUser._id,
    department: "CS",
  });

  const students = [];
  for (const data of studentData) {
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: "Student@123",
      role: "student",
    });
    students.push(
      await Student.create({
        user: user._id,
        rollNo: data.rollNo,
        department: data.department,
        semester,
        cgpa: data.cgpa,
      }),
    );
  }

  const gpaHistory = students.flatMap((student, studentIndex) => {
    const gpas =
      studentIndex === 0
        ? [3.4, 3.55, 3.65, 3.72, 3.8, 3.85]
        : Array.from({ length: 6 }, (_, index) => {
            const adjustment = ((index + studentIndex) % 3 - 1) * 0.04;
            return Math.max(2.5, Math.min(4, Number((student.cgpa + adjustment).toFixed(2))));
          });

    return gpas.map((gpa, index) => ({
      student: student._id,
      semester: index + 1,
      gpa,
    }));
  });
  await GpaHistory.insertMany(gpaHistory);

  const courses = await Course.insertMany(
    courseData.map((course) => ({ ...course, faculty: faculty._id })),
  );

  const enrollments = students.flatMap((student) =>
    courses.map((course) => ({ student: student._id, course: course._id })),
  );
  await Enrollment.insertMany(enrollments);

  const attendance = [];
  const dates = getPastDates();
  students.forEach((student, studentIndex) => {
    courses.forEach((course, courseIndex) => {
      const statuses = getAttendanceStatuses(studentIndex === 0);
      dates.forEach((date, dateIndex) => {
        attendance.push({
          student: student._id,
          course: course._id,
          date,
          status: studentIndex === 0
            ? statuses[studentIndex * courses.length * 30 + courseIndex * 30 + dateIndex]
            : statuses[dateIndex],
        });
      });
    });
  });
  await Attendance.insertMany(attendance);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = ["09:00", "11:00", "13:00", "15:00"];
  const timetableSlots = days.flatMap((day, dayIndex) =>
    times.slice(0, 2).map((startTime, timeIndex) => {
      const course = courses[(dayIndex * 2 + timeIndex) % courses.length];
      return {
        course: course._id,
        day,
        startTime,
        lectureHall: course.lectureHall,
      };
    }),
  );
  await TimetableSlot.insertMany(timetableSlots);

  await Notice.insertMany([
    {
      title: "Emergency Campus Closure",
      message: "The university will remain closed tomorrow due to an emergency.",
      priority: "urgent",
    },
    {
      title: "Midterm Examination Schedule",
      message: "The midterm examination schedule is now available.",
      priority: "high",
    },
    {
      title: "Fee Submission Reminder",
      message: "Please submit outstanding fees before the due date.",
      priority: "high",
    },
  ]);

  await FeeVoucher.insertMany(
    students.map((student, index) => ({
      student: student._id,
      semester,
      amount: index === 0 ? 84000 : 78000 + index * 1000,
      dueDate,
      status: index === 0 ? "unpaid" : "paid",
    })),
  );

  console.log("Seed completed successfully.");
  console.log(`Created ${await User.countDocuments()} users.`);
  console.log(`Created ${students.length} students and ${courses.length} courses.`);
  console.log(`Created ${enrollments.length} enrollments and ${attendance.length} attendance records.`);
  console.log(`Created ${timetableSlots.length} timetable slots, 3 notices, and ${students.length} fee vouchers.`);
  console.log("Login credentials:");
  credentials.forEach(({ email, password, role }) => {
    console.log(`- ${role}: ${email} / ${password}`);
  });
  console.log(`Admin user created: ${adminUser.email}`);
};

try {
  await seed();
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
