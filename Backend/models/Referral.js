const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  cases: {
    type: Number,
    default: 0
  },
  successRate: {
    type: String,
    default: "0%"
  },
  commission: {
    type: String,
    default: "₹0"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Referral", referralSchema);
