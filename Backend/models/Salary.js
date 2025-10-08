const mongoose = require("mongoose");

const SalarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  method: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model("Salary", SalarySchema);
