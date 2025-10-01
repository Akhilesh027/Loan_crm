const mongoose = require("mongoose");

// --- Sub-Schemas Definitions ---

const callHistorySchema = new mongoose.Schema({
    response: {
        type: String,
        required: [true, "Response is required"]
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Solved", "Call Back", "Not Reachable"],
        default: "Pending"
    },
    nextCallDate: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v >= new Date();
            },
            message: "Next call date must be in the future"
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, "Note content required"],
        trim: true
    },
    addedBy: {
        type: String,
        required: [true, "Note addedBy is required"],
        trim: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const bankDetailsSchema = new mongoose.Schema({
    accountNumber: {
        type: String,
        required: true,
        trim: true,
        // Basic validation for account numbers (9-18 digits)
        match: [/^\d{9,18}$/, 'Account number must be 9-18 digits'] 
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
    }],
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'On Hold'],
        default: 'Pending'
    }
}, { _id: false }); // Disable _id for sub-documents in the Map

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
    // This will store the string value (for non-file types) or the filename (for file type)
    value: mongoose.Schema.Types.Mixed 
}, { _id: false });

// --- Main Customer Schema Definition ---

const customerSchema = new mongoose.Schema({
    // ... (Existing fields - caseId, name, phone, email, etc.) ...
    caseId: {
        type: String,
        unique: true,
        index: true,
        sparse: true,
        default: null
    },
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
    aadhaar: {
        type: String,
        trim: true
    },
    pan: {
        type: String,
        trim: true,
        uppercase: true
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
    cibilUpdatedAt: {
        type: Date
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
            'Other' // Keep 'Other' for the checkbox presence
        ]
    }],

    // ✅ RESTORED: This array holds the dynamically added bank names (keys for bankDetails)
    otherBanks: [{
        type: String,
        trim: true
    }],

    // This Map structure handles ALL bank details, using bank names (from `banks` or `otherBanks`) as keys.
    bankDetails: {
        type: Map,
        of: bankDetailsSchema,
        default: {} // Initialize as an empty object/map
    },
    customFields: [customFieldSchema],
    pageNumber: {
        type: Number,
        min: 1
    },
    referredPerson: {
        type: String,
        trim: true
    },
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
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
      caseType: { 
        type: String, 
        enum: ['normal', 'cibil'], // Enforce one of these two values
        default: 'normal'
    }, 
    assignedToName: {
        type: String,
        trim: true
    },
    agentTotalAmount: {
        type: Number,
        min: 0,
        default: 0
    },
    agentAdvanceAmount: {
        type: Number,
        min: 0,
        default: 0
    },
    agentPaymentProof: {
        type: String,
        default: ""
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'partial'],
        default: 'pending'
    },
    // ✅ COMBINED: Consolidating all file fields under the 'documents' object
    documents: {
        aadhaarDoc: { type: String, default: "" },
        panDoc: { type: String, default: "" },
        accountStatementDoc: { type: String, default: "" },
        additionalDoc: { type: String, default: "" }, // From frontend 'additionalDoc'
        paymentProof: { type: String, default: "" },
        cibilReport:{type:String,default: ""},
        agentPaymentProof: { type: String, default: "" }
    },
    totalAmount: { type: Number, min: 0 },
    advanceAmount: { type: Number, min: 0 },
    status: {
    type: String,
    // Add all status values currently used in your system to the enum array
    enum: [
        'new',
        'In Progress',
        'Not Reachable',
        'resolved',
        'closed',
        'Solved',
        'Call Back',
        
        // These are the values likely missing and causing validation to fail:
        'Pending',          // Used in many places as a generic initial status
        'Customer Pending',
        'Agent Pending',
        'Admin Pending'
    ],
    default: 'new' // Keep your default value
},
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    followUpDate: Date,
    resolutionDate: Date,
    issuesReported: [{
        type: String,
        trim: true
    }],
    callHistory: [callHistorySchema],
    notes: [noteSchema],
    caseType: {
        type: String,
        enum: ['normal', 'cibil'],
        default: 'normal'
    },
    assignedAt: Date,
    completedAt: Date

}, {
    timestamps: true
});

// Generate case ID before saving
customerSchema.pre("save", async function (next) {
    // Check if a caseId already exists to avoid overwriting on updates
    if (!this.caseId) {
        const count = await mongoose.model("Customer").countDocuments();
        this.caseId = `CASE-${(count + 1).toString().padStart(4, "0")}`;
    }
    next();
});

module.exports = mongoose.model("Customer", customerSchema);