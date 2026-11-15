import Attendance from "../models/Attendance.js";
import Enrollment from "../models/Enrollment.js";
import Faculty from "../models/Faculty.js";
import FeeVoucher from "../models/FeeVoucher.js";
import Student from "../models/Student.js";

const percentage = (part, total) =>
  total === 0 ? 0 : Math.round((part / total) * 10000) / 100;

const getDashboard = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      paidVouchers,
      totalVouchers,
      attendedRecords,
      totalAttendance,
    ] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      FeeVoucher.countDocuments({ status: "paid" }),
      FeeVoucher.countDocuments(),
      Attendance.countDocuments({ status: { $in: ["present", "late"] } }),
      Attendance.countDocuments(),
    ]);

    res.json({
      totalStudents,
      totalFaculty,
      feeCollectionRate: percentage(paidVouchers, totalVouchers),
      averageAttendance: percentage(attendedRecords, totalAttendance),
    });
  } catch (error) {
    next(error);
  }
};

const getCharts = async (req, res, next) => {
  try {
    const [enrollmentByDepartment, paid, unpaid] = await Promise.all([
      Enrollment.aggregate([
        {
          $lookup: {
            from: Student.collection.name,
            localField: "student",
            foreignField: "_id",
            as: "student",
          },
        },
        { $unwind: "$student" },
        { $group: { _id: "$student.department", count: { $sum: 1 } } },
        { $project: { _id: 0, department: "$_id", count: 1 } },
        { $sort: { department: 1 } },
      ]),
      FeeVoucher.countDocuments({ status: "paid" }),
      FeeVoucher.countDocuments({ status: "unpaid" }),
    ]);

    res.json({
      enrollmentByDepartment,
      feeBreakdown: { paid, unpaid },
    });
  } catch (error) {
    next(error);
  }
};

export { getCharts, getDashboard };
