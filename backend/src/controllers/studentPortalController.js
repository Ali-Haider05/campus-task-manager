import Attendance from "../models/Attendance.js";
import Enrollment from "../models/Enrollment.js";
import FeeVoucher from "../models/FeeVoucher.js";
import GpaHistory from "../models/GpaHistory.js";
import Student from "../models/Student.js";

const percentage = (attended, held) =>
  held === 0 ? 0 : Math.round((attended / held) * 10000) / 100;

const findStudent = (userId) =>
  Student.findOne({ user: userId }).populate("user", "name");

const getOverview = async (req, res, next) => {
  try {
    const student = await findStudent(req.user.id);
    if (!student) {
      res.status(404).json({ message: "Student profile not found" });
      return;
    }

    const [attendance, totalCreditHours] = await Promise.all([
      Attendance.find({ student: student._id }).select("status"),
      Enrollment.aggregate([
        { $match: { student: student._id } },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: "$course" },
        { $group: { _id: null, total: { $sum: "$course.creditHours" } } },
      ]),
    ]);

    const attended = attendance.filter(({ status }) =>
      ["present", "late"].includes(status),
    ).length;

    res.json({
      name: student.user.name,
      rollNo: student.rollNo,
      department: student.department,
      semester: student.semester,
      cgpa: student.cgpa,
      attendancePercentage: percentage(attended, attendance.length),
      totalCreditHours: totalCreditHours[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const student = await findStudent(req.user.id);
    if (!student) {
      res.status(404).json({ message: "Student profile not found" });
      return;
    }

    const enrollments = await Enrollment.find({ student: student._id })
      .populate({
        path: "course",
        select: "code title creditHours lectureHall faculty",
        populate: {
          path: "faculty",
          select: "user",
          populate: { path: "user", select: "name" },
        },
      })
      .sort({ "course.code": 1 });

    res.json(
      enrollments.map(({ course }) => ({
        code: course.code,
        title: course.title,
        creditHours: course.creditHours,
        lectureHall: course.lectureHall,
        instructor: course.faculty.user.name,
      })),
    );
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const student = await findStudent(req.user.id);
    if (!student) {
      res.status(404).json({ message: "Student profile not found" });
      return;
    }

    const enrollments = await Enrollment.find({ student: student._id })
      .populate("course", "code title")
      .sort({ "course.code": 1 });
    const attendance = await Attendance.find({ student: student._id }).select(
      "course status",
    );
    const attendanceByCourse = attendance.reduce((result, record) => {
      const key = record.course.toString();
      result[key] ||= [];
      result[key].push(record.status);
      return result;
    }, {});

    const courses = enrollments.map(({ course }) => {
      const records = attendanceByCourse[course._id.toString()] || [];
      const attended = records.filter((status) =>
        ["present", "late"].includes(status),
      ).length;
      const missed = records.filter((status) => status === "absent").length;
      const coursePercentage = percentage(attended, records.length);

      return {
        code: course.code,
        title: course.title,
        held: records.length,
        attended,
        missed,
        percentage: coursePercentage,
        eligible: coursePercentage >= 75,
      };
    });
    const held = courses.reduce((total, course) => total + course.held, 0);
    const attended = courses.reduce((total, course) => total + course.attended, 0);

    res.json({ courses, overallPercentage: percentage(attended, held) });
  } catch (error) {
    next(error);
  }
};

const getGpaHistory = async (req, res, next) => {
  try {
    const student = await findStudent(req.user.id);
    if (!student) {
      res.status(404).json({ message: "Student profile not found" });
      return;
    }

    const history = await GpaHistory.find({ student: student._id })
      .select("semester gpa -_id")
      .sort({ semester: 1 })
      .lean();
    res.json(history.map(({ semester, gpa }) => ({ semester, gpa })));
  } catch (error) {
    next(error);
  }
};

const getFeeVoucher = async (req, res, next) => {
  try {
    const student = await findStudent(req.user.id);
    if (!student) {
      res.status(404).json({ message: "Student profile not found" });
      return;
    }

    const voucher = await FeeVoucher.findOne({ student: student._id })
      .sort({ createdAt: -1 })
      .select("student semester amount dueDate status")
      .populate({
        path: "student",
        select: "rollNo user",
        populate: { path: "user", select: "name" },
      });
    if (!voucher) {
      res.status(404).json({ message: "Fee voucher not found" });
      return;
    }

    res.json({
      studentName: voucher.student.user.name,
      rollNo: voucher.student.rollNo,
      semester: voucher.semester,
      amount: voucher.amount,
      dueDate: voucher.dueDate,
      status: voucher.status,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAttendance,
  getCourses,
  getFeeVoucher,
  getGpaHistory,
  getOverview,
};
