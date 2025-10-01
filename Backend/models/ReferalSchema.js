const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
    // Identifier: Name of the person who referred the customer
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    // Contact information, crucial for unique identification
    phone: {
        type: String,
        trim: true,
        // Assuming phone might be optional if unique name is enforced, or vice-versa
        default: 'N/A' 
    },
    // Case count: Incremented every time a new customer is added with this referral name
    cases: {
        type: Number,
        default: 0
    },
    // Success Rate (Optional: can be calculated on the fly or maintained)
    successRate: {
        type: String,
        default: '0%'
    },
    // Commission Structure (Optional: static text field)
    commission: {
        type: String,
        default: '₹0'
    },
    // You might link this to a User if the referral partner is also a user/agent
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, { timestamps: true });

// Optional: Add a compound unique index if a name/phone combination must be unique
ReferralSchema.index({ name: 1, phone: 1 }, { unique: true, partialFilterExpression: { phone: { $exists: true, $ne: null, $ne: 'N/A' } } });


const Referral = mongoose.model('Referral', ReferralSchema);

module.exports = Referral;