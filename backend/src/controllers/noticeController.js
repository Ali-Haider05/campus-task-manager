import Notice from "../models/Notice.js";

const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find().sort({ date: -1 });
    res.json(notices);
  } catch (error) {
    next(error);
  }
};

const createNotice = async (req, res, next) => {
  try {
    const { title, message, priority, date } = req.body;
    if (!title || !message) {
      res.status(400).json({ message: "Title and message are required" });
      return;
    }

    const notice = await Notice.create({ title, message, priority, date });
    res.status(201).json(notice);
  } catch (error) {
    next(error);
  }
};

export { createNotice, getNotices };
