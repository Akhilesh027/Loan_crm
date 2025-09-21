const mongoose = require('mongoose');

const callHistorySchema = new mongoose.Schema({
  response: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Solved', 'Call Back', 'Not Reachable'],
    default: 'Pending'
  },
  nextCallDate: Date,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const noteSchema = new mongoose.Schema({
  content: String,
  addedBy: String,
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const customerSchema = new mongoose.Schema({
  caseId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  phone: String,
  email: String,
  problem: {
    type: String,
    required: true
  },
  bank: String,
  loanType: String,
  amount: Number,
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Solved', 'Call Back', 'Not Reachable'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cibilBefore: Number,
  cibilAfter: Number,
  totalAmount: Number,
  advanceAmount: Number,
  paymentProof: String,
  documents: {
    aadhaar: String,
    pan: String,
    accountStatement: String
  },
  banks: [String],
  accountNumbers: mongoose.Schema.Types.Mixed,
  issues: [String],
  notes: [noteSchema],
  callHistory: [callHistorySchema]
}, {
  timestamps: true
});

// Generate case ID before saving
customerSchema.pre('save', async function(next) {
  if (!this.caseId) {
    const count = await mongoose.model('Customer').countDocuments();
    this.caseId = `CASE-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);