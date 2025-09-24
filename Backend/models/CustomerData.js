const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  loanType: {
    type: String,
    required: true,
    enum: [
      'Home Loan',
      'Personal Loan',
      'Business Loan',
      'Education Loan',
      'Vehicle Loan',
      'Gold Loan',
      'Loan Against Property (LAP)',
      'Credit Card'
    ]
  },
  issues: [{
    type: String,
    enum: [
      'EMI not reflected',
      'Failed transaction',
      'KYC pending',
      'Incorrect charges',
      'Disbursement delay',
      'NACH / ECS issue',
      'Foreclosure statement',
      'Prepayment request',
      'Portal / login access',
      'Other'
    ]
  }]
});

const customFieldSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'email', 'textarea', 'file'],
    required: true
  },
  value: mongoose.Schema.Types.Mixed // Can store various types of data
});

const customerSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
  },
  
  // Identity Documents
  aadhaar: {
    type: String,
    trim: true
  },
  pan: {
    type: String,
    trim: true,
    uppercase: true
  },
  cibil: {
    type: Number,
    min: 300,
    max: 900
  },
  
  // Contact Information
  address: {
    type: String,
    trim: true
  },
  problem: {
    type: String,
    required: true,
    trim: true
  },
  
  // Bank Information
  banks: [{
    type: String,
    enum: [
      'State Bank of India (SBI)',
      'HDFC Bank',
      'ICICI Bank',
      'Axis Bank',
      'Kotak Mahindra Bank',
      'Bank of Baroda',
      'Canara Bank',
      'Other'
    ]
  }],
  otherBanks: [{
    type: String,
    trim: true
  }],
  
  // Bank Details (structured)
  bankDetails: {
    type: Map,
    of: bankDetailsSchema
  },
  
  // Custom Fields
  customFields: [customFieldSchema],
  
  // Reference Information
  pageNumber: {
    type: Number,
    min: 1
  },
  referredPerson: {
    type: String,
    trim: true
  },
  
  // Telecaller Information
  telecallerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  telecallerName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Document Files
  documents: {
    aadhaarDoc: String, // File path
    panDoc: String, // File path
    accountStatementDoc: String, // File path
    additionalDoc: String // File path
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Timestamps
  followUpDate: Date,
  resolutionDate: Date
  
}, {
  timestamps: true
});

// Indexes for better query performance
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ telecallerId: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ createdAt: -1 });

// Virtual for all banks (banks + otherBanks)
customerSchema.virtual('allBanks').get(function() {
  return [...this.banks, ...this.otherBanks];
});

module.exports = mongoose.model('CustomerData', customerSchema);