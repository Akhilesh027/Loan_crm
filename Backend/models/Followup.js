const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  response: {
    type: String,
    default: ""
  },
  issueType: {
    type: String,
    default: ""
  },
  village: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Rejected", "Call Back", "In Progress","Connected", "Not Connected","Success"],
    default: "Pending"
  },
  callbackTime: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Followup', followupSchema);