import mongoose from "mongoose";

const timetableSlotSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    day: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    lectureHall: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const TimetableSlot = mongoose.model("TimetableSlot", timetableSlotSchema);

export default TimetableSlot;
