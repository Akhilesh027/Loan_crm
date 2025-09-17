
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    caseId: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    method: {
      type: String,
      enum: ["Cash", "Bank Transfer", "UPI", "Credit Card", "Debit Card", "Cheque"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
      required: true,
    },
    proof: {
      type: String, // filename or URL for uploaded document
      default: null,
    },
    createdBy: { // Reference user who created the payment (optional)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
