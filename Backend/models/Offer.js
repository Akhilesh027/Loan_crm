// models/Offer.js
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dealAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  advancePaid: {
    type: Number,
    default: 0,
    min: 0,
  },
  pendingAmount: {
    type: Number,
    default: function () {
      return this.dealAmount - this.advancePaid;
    },
    min: 0,
  },
  caseStatus: {
    type: String,
    enum: ['In Progress', 'Completed', 'On Hold'],
    default: 'In Progress',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Complete'],
    default: 'Pending',
  },
  paymentProofUrl: {
    type: String, // URL to uploaded file (image/pdf)
  },
  notes: {
    type: String,
    maxlength: 500,
  },
}, {
  timestamps: true,
});

// Auto-calculate pending amount before saving
offerSchema.pre('save', function (next) {
  this.pendingAmount = this.dealAmount - this.advancePaid;
  next();
});

// Optional: Update customer document when paymentProofUrl is added
offerSchema.post('save', async function (doc) {
  if (doc.paymentProofUrl) {
    const Customer = mongoose.model('Customer');
    try {
      await Customer.findByIdAndUpdate(doc.caseId, { paymentProofUrl: doc.paymentProofUrl });
    } catch (err) {
      console.error('Failed to update customer with payment proof:', err);
    }
  }
});

module.exports = mongoose.model('Offer', offerSchema);
