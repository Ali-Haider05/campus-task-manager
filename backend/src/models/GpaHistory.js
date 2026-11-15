import mongoose from "mongoose";

const gpaHistorySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    semester: { type: Number, required: true, min: 1 },
    gpa: { type: Number, required: true, min: 0, max: 4 },
  },
  { timestamps: true },
);

gpaHistorySchema.index({ student: 1, semester: 1 }, { unique: true });

const GpaHistory = mongoose.model("GpaHistory", gpaHistorySchema);

export default GpaHistory;
