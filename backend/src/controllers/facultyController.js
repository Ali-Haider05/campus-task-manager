import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Faculty from "../models/Faculty.js";
import TimetableSlot from "../models/TimetableSlot.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const findFaculty = (userId) => Faculty.findOne({ user: userId });

const getFacultyCourses = async (req, res, next) => {
  try {
    const faculty = await findFaculty(req.user.id);
    if (!faculty) {
      res.status(403).json({ message: "Faculty profile not found" });
      return;
    }

    const courses = await Course.aggregate([
      { $match: { faculty: faculty._id } },
      {
        $lookup: {
          from: Enrollment.collection.name,
          localField: "_id",
          foreignField: "course",
          as: "enrollments",
        },
      },
      {
        $project: {
          _id: 1,
          code: 1,
          title: 1,
          creditHours: 1,
          lectureHall: 1,
          enrolledStudents: { $size: "$enrollments" },
        },
      },
      { $sort: { code: 1 } },
    ]);

    res.json(courses);
  } catch (error) {
    next(error);
  }
};

const getCourseStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid course id" });
      return;
    }

    const faculty = await findFaculty(req.user.id);
    const course = faculty
      ? await Course.findOne({ _id: id, faculty: faculty._id })
      : null;
    if (!course) {
      res.status(403).json({ message: "You do not teach this course" });
      return;
    }

    const enrollments = await Enrollment.find({ course: course._id })
      .populate({
        path: "student",
        select: "rollNo",
        populate: { path: "user", select: "name" },
      })
      .sort({ "student.rollNo": 1 });

    res.json(
      enrollments.map(({ student }) => ({
        name: student.user.name,
        rollNo: student.rollNo,
        studentId: student._id,
      })),
    );
  } catch (error) {
    next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body;
    if (
      !courseId ||
      !date ||
      !Array.isArray(records) ||
      records.length === 0 ||
      !isValidObjectId(courseId) ||
      Number.isNaN(Date.parse(date))
    ) {
      res.status(400).json({
        message: "courseId, a valid date, and non-empty records are required",
      });
      return;
    }

    const invalidRecord = records.find(
      (record) =>
        !record ||
        !isValidObjectId(record.studentId) ||
        !["present", "absent", "late"].includes(record.status),
    );
    if (invalidRecord) {
      res.status(400).json({
        message: "Each record requires a valid studentId and status",
      });
      return;
    }

    const faculty = await findFaculty(req.user.id);
    const course = faculty
      ? await Course.findOne({ _id: courseId, faculty: faculty._id })
      : null;
    if (!course) {
      res.status(403).json({ message: "You do not teach this course" });
      return;
    }

    const studentIds = records.map((record) => record.studentId);
    const uniqueStudentIds = new Set(studentIds.map((id) => id.toString()));
    if (uniqueStudentIds.size !== studentIds.length) {
      res.status(400).json({ message: "Duplicate student records are not allowed" });
      return;
    }

    const enrolledCount = await Enrollment.countDocuments({
      course: course._id,
      student: { $in: studentIds },
    });
    if (enrolledCount !== studentIds.length) {
      res.status(400).json({ message: "All students must be enrolled in this course" });
      return;
    }

    const attendanceDate = new Date(date);
    await Promise.all(
      records.map(({ studentId, status }) =>
        Attendance.findOneAndUpdate(
          { student: studentId, course: course._id, date: attendanceDate },
          { $set: { status } },
          { upsert: true, new: true, runValidators: true },
        ),
      ),
    );

    const summary = records.reduce(
      (result, { status }) => {
        result[status] += 1;
        result.saved += 1;
        return result;
      },
      { saved: 0, present: 0, absent: 0, late: 0 },
    );
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

const getFacultySchedule = async (req, res, next) => {
  try {
    const faculty = await findFaculty(req.user.id);
    if (!faculty) {
      res.status(403).json({ message: "Faculty profile not found" });
      return;
    }

    const courseIds = await Course.find({ faculty: faculty._id }).distinct("_id");
    const schedule = await TimetableSlot.find({ course: { $in: courseIds } })
      .populate("course", "code title creditHours lectureHall")
      .sort({ day: 1, startTime: 1 });

    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

export {
  getCourseStudents,
  getFacultyCourses,
  getFacultySchedule,
  markAttendance,
};
