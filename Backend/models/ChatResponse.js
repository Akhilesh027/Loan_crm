const mongoose = require("mongoose");

const ChatRequestSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Case", // Reference to the Case collection/model if exists
  },
  message: {
    type: String,
    required: true,
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Refers to the User collection/model
  },
  agentName: {
    type: String,

  },
  status: {
    type: String,
    enum: ["Pending", "Resolved", "Rejected"],
    default: "Pending",
  },
  adminResponse: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ChatRequest", ChatRequestSchema);
