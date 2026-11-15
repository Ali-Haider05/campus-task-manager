import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    creditHours: { type: Number, required: true, min: 1 },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    lectureHall: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
