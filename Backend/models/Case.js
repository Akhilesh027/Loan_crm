const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  problem: {
    type: String,
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Solved'],
    default: 'Pending'
  },
  officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Officer'
  },
  amount: {
    type: Number,
    default: 0
  },
  documents: {
    aadhaar: String,
    pan: String,
    accountStatement: String,
    paymentProof: String
  },
  cibilBefore: Number,
  cibilAfter: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Case', caseSchema);