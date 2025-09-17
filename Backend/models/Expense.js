const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  advance: { type: Number, default: 0 },
  type: { type: String, required: true },
  description: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
