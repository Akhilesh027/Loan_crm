const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  customer: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    required: true,
    enum: ['Connected', 'Not Connected', 'Not Responded', 'Call Back', 'In Progress']
  },
  response: {
    type: String,
    default: ""
  },
  callbackTime: {
    type: String,
    default: "" // You can also set this to null if you prefer: type: String, default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CallLog', callLogSchema);
