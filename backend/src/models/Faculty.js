import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const Faculty = mongoose.model("Faculty", facultySchema);

export default Faculty;
