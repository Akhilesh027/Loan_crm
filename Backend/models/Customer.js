const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return v === '' || /\S+@\S+\.\S+/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  aadhaar: {
    type: String,
    trim: true
  },
  pan: {
    type: String,
    trim: true
  },
  cibil: {
    type: Number,
    min: 300,
    max: 900
  },
  address: {
    type: String,
    trim: true
  },
  problem: {
    type: String,
    required: true,
    trim: true
  },
  bank: {
    type: String,
    required: true,
    trim: true
  },
  otherBank: {
    type: String,
    trim: true
  },
  loanType: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{9,18}$/.test(v);
      },
      message: props => `${props.value} is not a valid account number!`
    }
  },
  issues: [{
    type: String,
    required: true
  }],
  pageNumber: {
    type: Number,
    min: 1
  },
  referredPerson: {
    type: String,
    trim: true
  },
  // New fields for telecaller reference
  telecallerId: {
    type: String,

    trim: true
  },
  telecallerName: {
    type: String,
 
    trim: true
  },
  // Case management fields
  caseId: {
    type: String,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Solved'],
    default: 'Pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  assignedDate: {
    type: Date,
    default: null
  },
  resolvedDate: {
    type: Date,
    default: null
  },
  amount: {
    type: Number,
    min: 0,
    default: 0
  },
  cibilBefore: {
    type: Number,
    min: 300,
    max: 900
  },
  cibilAfter: {
    type: Number,
    min: 300,
    max: 900
  },
  // Documents field to store file references
  documents: {
    aadhaar: { type: String, default: '' },
    pan: { type: String, default: '' },
    accountStatement: { type: String, default: '' },
    paymentProof: { type: String, default: '' }
  },
  // Additional notes field for case progress tracking
  notes: [{
  content: String,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}],
  // Priority field for case management
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate case ID
customerSchema.pre('save', async function(next) {
  if (this.isNew && !this.caseId) {
    try {
      const count = await mongoose.model('Customer').countDocuments();
      this.caseId = `CASE-${(count + 1).toString().padStart(4, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Create index for better query performance
customerSchema.index({ phone: 1, email: 1 });
customerSchema.index({ telecallerId: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ assignedTo: 1 });
customerSchema.index({ caseId: 1 }, { unique: true });

// Virtual for getting the assigned officer's name
customerSchema.virtual('officerName', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

// Method to check if case is assigned
customerSchema.methods.isAssigned = function() {
  return this.assignedTo !== null;
};

// Method to check if case is solved
customerSchema.methods.isSolved = function() {
  return this.status === 'Solved';
};

// Static method to find cases by status
customerSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find cases assigned to a specific officer
customerSchema.statics.findByOfficer = function(officerId) {
  return this.find({ assignedTo: officerId });
};

customerSchema.virtual('resolutionDays').get(function() {
  if (this.status === 'Solved' && this.assignedDate && this.resolvedDate) {
    const diffTime = Math.abs(this.resolvedDate - this.assignedDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });
module.exports = mongoose.model('Customer', customerSchema);