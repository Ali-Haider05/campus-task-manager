import mongoose from "mongoose";

const feeVoucherSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    semester: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
      required: true,
    },
  },
  { timestamps: true },
);

const FeeVoucher = mongoose.model("FeeVoucher", feeVoucherSchema);

export default FeeVoucher;
