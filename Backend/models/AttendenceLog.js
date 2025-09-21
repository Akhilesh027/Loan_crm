// models/AttendanceLog.js
const mongoose = require("mongoose");

const AttendanceLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  loginTime: {
    type: Date,
    required: true,
  },
  logoutTime: {
    type: Date,
    default: null,
  },
  logDate: {
    type: String, // e.g., "2025-09-22"
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("AttendenceLog", AttendanceLogSchema);
