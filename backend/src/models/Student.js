import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rollNo: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1 },
    cgpa: { type: Number, required: true, min: 0, max: 4 },
  },
  { timestamps: true },
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
