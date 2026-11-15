import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["urgent", "high", "normal"],
      default: "normal",
      required: true,
    },
    date: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

const Notice = mongoose.model("Notice", noticeSchema);

export default Notice;
