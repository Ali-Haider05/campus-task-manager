import TimetableSlot from "../models/TimetableSlot.js";

const getTimetable = async (req, res, next) => {
  try {
    const timetable = await TimetableSlot.find()
      .populate("course", "code title creditHours lectureHall")
      .sort({ day: 1, startTime: 1 });
    res.json(timetable);
  } catch (error) {
    next(error);
  }
};

const createTimetableSlot = async (req, res, next) => {
  try {
    const { course, day, startTime, lectureHall } = req.body;
    if (!course || !day || !startTime || !lectureHall) {
      res.status(400).json({
        message: "Course, day, startTime, and lectureHall are required",
      });
      return;
    }

    const timetableSlot = await TimetableSlot.create({
      course,
      day,
      startTime,
      lectureHall,
    });
    await timetableSlot.populate("course", "code title creditHours lectureHall");
    res.status(201).json(timetableSlot);
  } catch (error) {
    next(error);
  }
};

export { createTimetableSlot, getTimetable };
