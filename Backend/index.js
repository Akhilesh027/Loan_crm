const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const bcrypt = require('bcryptjs');
const Customer = require('./models/Customer.js');
const multer = require("multer");
const path = require("path");
const FieldData = require('./models/FieldData.js');
const Followup = require('./models/Followup.js');
const Case = require('./models/Case.js');
const Offer = require('./models/Offer.js');
const Payment = require("./models/Payment.js"); // Your Mongoose Payment model
const Expense = require('./models/Expense.js');
const Calllog = require('./models/Calllog.js');
const fs = require("fs");
const Referral = require('./models/Referral.js');
const app = express();

mongoose.connect(
  'mongodb+srv://akhileshreddy811_db_user:c4A9nBNfvd3p7tmt@cluster0.nggk7aq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => console.log('✅ MongoDB connected successfully!'))
.catch(err => console.error('❌ MongoDB connection error:', err));
app.use(cors());
app.use(express.json());
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${timestamp}-${random}${ext}`);
  },
});

// File filter for allowed document types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}`), false);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, role } = req.body;

    if (!username || !email || !password || !firstName || !lastName || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const query = username ? { username } : { email };
    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username/email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid username/email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "BANNU9", // ✅ move secret to .env in production
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching users' });
  }
});
const generateSequentialCaseId = async () => {
  try {
    // Use a counter collection to ensure sequential IDs
    const Counter = mongoose.model('Counter', new mongoose.Schema({
      _id: String,
      seq: Number
    }));
    
    const counter = await Counter.findByIdAndUpdate(
      'customerCaseId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    
    return `CASE-${String(counter.seq).padStart(4, '0')}`;
  } catch (error) {
    console.error('Error with counter:', error);
    // Fallback: timestamp-based ID
    return `CASE-TEMP-${Date.now()}`;
  }
};

const fixExistingCustomers = async () => {
  const customers = await Customer.find({ caseId: { $exists: false } });
  
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    customer.caseId = `CASE-${String(i + 1).padStart(4, '0')}`;
    await customer.save();
  }
};

// Call this function once
fixExistingCustomers();
// Create a new customer
app.post('/api/customers', upload.fields([
  { name: 'aadhaarDoc', maxCount: 1 },
  { name: 'panDoc', maxCount: 1 },
  { name: 'accountStatementDoc', maxCount: 1 },
]), async (req, res) => {
  try {
    if (req.body.bank === 'other' && req.body.otherBank) {
      req.body.bank = req.body.otherBank;
    }

    // Add file paths to req.body.documents
    req.body.documents = {
      aadhaar: req.files.aadhaarDoc ? req.files.aadhaarDoc[0].filename : '',
      pan: req.files.panDoc ? req.files.panDoc[0].filename : '',
      accountStatement: req.files.accountStatementDoc ? req.files.accountStatementDoc[0].filename : ''
    };

    // Generate unique case ID
    const generateCaseId = async () => {
      try {
        // Find the highest existing caseId
        const lastCustomer = await Customer.findOne().sort({ createdAt: -1 });
        
        if (lastCustomer && lastCustomer.caseId) {
          // Extract number from existing caseId and increment
          const lastCaseNumber = parseInt(lastCustomer.caseId.split('-')[1]);
          const newCaseNumber = lastCaseNumber + 1;
          return `CASE-${String(newCaseNumber).padStart(4, '0')}`;
        } else {
          // No customers exist yet, start from CASE-0001
          return 'CASE-0001';
        }
      } catch (error) {
        console.error('Error generating case ID:', error);
        // Fallback: use timestamp-based ID
        return `CASE-TEMP-${Date.now()}`;
      }
    };

    // Generate case ID and add to request body
    req.body.caseId = await generateCaseId();

    const customer = new Customer(req.body);
    await customer.save();

    res.status(201).json({
      message: 'Customer added successfully!',
      customer
    });
  } catch (error) {
    console.error('Error saving customer:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000 && error.keyPattern && error.keyPattern.caseId) {
      return res.status(400).json({
        error: 'Duplicate case ID',
        message: 'A customer with this case ID already exists. Please try again.'
      });
    }
    
    res.status(500).json({
      error: 'Failed to save customer',
      message: error.message
    });
  }
});

// Get all users with role 'agent'
app.get('/api/users', async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    const users = await User.find(query, 'name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get a single customer by ID
app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Update a customer
app.put('/api/customers/:id', async (req, res) => {
  try {
    // If bank is "other", use otherBank value
    if (req.body.bank === 'other' && req.body.otherBank) {
      req.body.bank = req.body.otherBank;
    }
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({
      message: 'Customer updated successfully!',
      customer
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});
// Update a case (assign officer, mark as complete, etc.)
app.put('/api/cases/:id', async (req, res) => {
  try {
    const { officer, status, cibilBefore, cibilAfter } = req.body;
    
    const updateData = {};
    if (officer !== undefined) updateData.officer = officer;
    if (status !== undefined) updateData.status = status;
    if (cibilBefore !== undefined) updateData.cibilBefore = cibilBefore;
    if (cibilAfter !== undefined) updateData.cibilAfter = cibilAfter;
    
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('customer', 'name phone email aadhaar pan cibil address bank loanType accountNumber issues referredPerson');
    
    if (!updatedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(updatedCase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Get all cases with customer details
app.get('/api/cases', async (req, res) => {
  try {
    const cases = await Case.find()
      .populate('customer', 'name phone email aadhaar pan cibil address bank loanType accountNumber issues referredPerson')
      .populate('officer', 'name');
    
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete a customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});
app.post("/api/field-data", async (req, res) => {
  try {
    const data = new FieldData(req.body);
    await data.save();
    res.status(201).json({ message: "Data saved successfully", data });
  } catch (err) {
    console.error("Error saving data:", err); // ✅ log the error
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all data (full details)
app.get("/api/field-data", async (req, res) => {
  try {
    const dataList = await FieldData.find({}); // no projection, fetch all fields
    res.status(200).json(dataList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all followups with optional search
app.get('/api/followups', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const followups = await Followup.find(query).sort({ createdAt: -1 });
    res.json(followups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new followup/lead
app.post('/api/followups', async (req, res) => {
  try {
    const { time, name, phone, response, issueType, village } = req.body;
    
    const newFollowup = new Followup({
      time,
      name,
      phone,
      response: response || "",
      issueType: issueType || "",
      village: village || ""
    });
    
    const savedFollowup = await newFollowup.save();
    res.status(201).json(savedFollowup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a followup (call outcome)
app.put('/api/followups/:id', async (req, res) => {
  try {
    const { response, status, callbackTime } = req.body;

    // Build update object conditionally
    const updateData = {};

    if (response !== undefined) {
      updateData.response = response;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (status === 'Call Back') {
      if (!callbackTime || callbackTime.trim() === "") {
        return res.status(400).json({ error: 'Callback time is required when status is "Call Back"' });
      }
      updateData.callbackTime = callbackTime;
    } else {
      // If status is not 'Call Back', clear callbackTime
      updateData.callbackTime = "";
    }

    const updatedFollowup = await Followup.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedFollowup) {
      return res.status(404).json({ error: 'Followup not found' });
    }

    res.json(updatedFollowup);
  } catch (error) {
    console.error("Error updating followup:", error);
    res.status(400).json({ error: error.message });
  }
});
// Get all call logs
app.get('/api/calllogs', async (req, res) => {
  try {
    const callLogs = await Calllog.find().sort({ createdAt: -1 });
    res.json(callLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/calllogs', async (req, res) => {
  try {
    const { time, customer, phone, duration, status, response, callbackTime } = req.body;
    
    const newCallLog = new Calllog({
      time,
      customer,
      phone,
      duration: duration || "",
      status,
      response: response || "",
      callbackTime: callbackTime || ""  // Add callbackTime, defaulting to empty string if not provided
    });
    
    const savedCallLog = await newCallLog.save();
    res.status(201).json(savedCallLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date for range
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Count today's calls
    const todaysCalls = await Calllog.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // Count responsive calls (Connected status)
    const responsiveCalls = await Calllog.countDocuments({
      status: 'Connected',
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // Count no response calls
    const noResponseCalls = await Calllog.countDocuments({
      status: { $in: ['Not Connected', 'Not Responded'] },
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // Count pending follow-ups (followups with empty response)
    const pendingFollowups = await Followup.countDocuments({
      response: '',
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    res.json([
      { 
        icon: "fa-phone", 
        value: todaysCalls, 
        label: "Today's Calls", 
        color: "bg-blue-500" 
      },
      { 
        icon: "fa-check-circle", 
        value: responsiveCalls, 
        label: "Responsive Calls", 
        color: "bg-green-500" 
      },
      { 
        icon: "fa-times-circle", 
        value: noResponseCalls, 
        label: "No Response", 
        color: "bg-red-500" 
      },
      { 
        icon: "fa-bell", 
        value: pendingFollowups, 
        label: "Pending Follow-ups", 
        color: "bg-yellow-500" 
      }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/admin/stats', async (req, res) => {
  try {
    // Today's date range
  

    // Dashboard stats
    const totalCustomers = await Customer.countDocuments();
    const activeCases = await Followup.countDocuments({ status: 'Active' });
    const totalCases = await Followup.countDocuments();
    const pendingCases = await Followup.countDocuments({ status: 'Pending' });

    // Offer stats
    const totalRevenueAgg = await Offer.aggregate([{ $group: { _id: null, total: { $sum: "$dealAmount" } } }]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const advanceAgg = await Offer.aggregate([{ $group: { _id: null, total: { $sum: "$advancePaid" } } }]);
    const advanceReceived = advanceAgg[0]?.total || 0;

    const pendingExpenseAgg = await Offer.aggregate([{ $group: { _id: null, total: { $sum: "$pendingAmount" } } }]);
    const pendingAmount = pendingExpenseAgg[0]?.total || 0;

    const totalExpenseAgg = await Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const totalExpense = totalExpenseAgg[0]?.total || 0;

    const totalProfit = totalRevenue - totalExpense;

    // User roles
    const officers = await User.countDocuments({ role: 'agent' });
    const telecallers = await User.countDocuments({ role: 'telecaller' });
    const marketing = await User.countDocuments({ role: 'marketing' });
    const referralPartners = await User.countDocuments({ role: 'Referral' });

    // Recent transactions (latest 5 cases)
    const recentTransactions = await Case.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('officer', 'name')
      .populate('customer', 'name');

    res.json({
    
      dashboardStatsTop: [
        { icon: "fa-users", label: "Total Customers", value: totalCustomers },
        { icon: "fa-briefcase", label: "Active Cases", value: activeCases },
        { icon: "fa-briefcase", label: "Total Cases", value: totalCases },
        { icon: "fa-briefcase", label: "Pending Cases", value: pendingCases },
        { icon: "fa-money-bill-wave", label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}` },
        { icon: "fa-money-bill-wave", label: "Advance Received", value: `₹${advanceReceived.toLocaleString()}` },
        { icon: "fa-money-bill-wave", label: "Pending Amount", value: `₹${pendingAmount.toLocaleString()}` },
        { icon: "fa-money-bill-wave", label: "Total Expense", value: `₹${totalExpense.toLocaleString()}` },
        { icon: "fa-profit", label: "Total Profit", value: `₹${totalProfit.toLocaleString()}` }
      ],
      dashboardStatsBottom: [
        { icon: "fa-user-tie", label: "Agent", value: officers },
        { icon: "fa-phone", label: "Telecallers", value: telecallers },
        { icon: "fa-chart-line", label: "Marketing", value: marketing },
        { icon: "fa-user-friends", label: "Referral Partners", value: referralPartners }
      ],
      recentTransactions: recentTransactions.map(trx => ({
        id: trx._id,
        caseId: trx.caseId || 'N/A',
        customer: trx.customer?.name || "Unknown",
        officer: trx.officer?.name || "Unknown",
        amount: trx.amount || 0,
        profit: trx.profit || 0,
        status: trx.status || "N/A"
      }))
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/agent/stats/:officerId", async (req, res) => {
  try {
    const officerId = req.query.officerId;
    // Stats aggregation
    const assignedCasesCount = await Customer.countDocuments({ officer: officerId });
    const solvedCasesCount = await Customer.countDocuments({ officer: officerId, status: "Solved" });
    const pendingCasesCount = await Customer.countDocuments({ officer: officerId, status: "In Progress" });
    
    const totalRevenueAgg = await Offer.aggregate([
      { $group: { _id: null, total: { $sum: "$dealAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const pendingAmountAgg = await Offer.aggregate([
      { $group: { _id: null, total: { $sum: "$pendingAmount" } } },
    ]);
    const pendingAmount = pendingAmountAgg[0]?.total || 0;

    // Prepare stats for frontend
    const stats = [
      { icon: "fa-briefcase", label: "Assigned Cases", value: assignedCasesCount },
      { icon: "fa-check-circle", label: "Solved Cases", value: solvedCasesCount },
      { icon: "fa-money-bill-wave", label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}` },
      { icon: "fa-money-bill-wave", label: "Pending Amount", value: `₹${pendingAmount.toLocaleString()}` },
      { icon: "fa-clock", label: "Pending Cases", value: pendingCasesCount },
    ];

    // Fetch recent assigned cases (latest 5)
    const recentCases = await Case.find({ officer: officerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name");

    // Format recent cases for frontend
    const formattedCases = recentCases.map((c) => ({
      caseId: c.caseId || "N/A",
      customer: c.customer ? c.customer.name : "Unknown",
      problem: c.problem || "N/A",
      assignedDate: c.createdAt.toLocaleDateString(),
      status: c.status || "Pending",
      daysCount: Math.floor((new Date() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24)),
    }));

    res.json({ stats, recentCases: formattedCases });
  } catch (error) {
    console.error("Officer dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/marketing/stats/:marketingId", async (req, res) => {
  try {
    const marketingId = req.params.marketingId;

    const bankVisitsCount = await Customer.countDocuments({ marketingId, type: "Bank Visit" });
    const nbfcVisitsCount = await Customer.countDocuments({ marketingId, type: "NBFC Visit" });
    const carShowroomVisitsCount = await Customer.countDocuments({ marketingId, type: "Car Showroom Visit" });
    const bikeShowroomVisitsCount = await Customer.countDocuments({ marketingId, type: "Bike Showroom Visit" });
    const otherManagerVisitsCount = await Customer.countDocuments({ marketingId, type: "Other Manager Visit" });
    const otherCustomerVisitsCount = await Customer.countDocuments({ marketingId, type: "Other Customer Visit" });

    const totalMonthlyVisit = await Customer.countDocuments({ marketingId, createdAt: { $gte: new Date(new Date().setDate(1)) } });

    const totalExpensesAgg = await Expense.aggregate([
      { $match: { marketingId: marketingId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpenses = totalExpensesAgg[0]?.total || 0;

    const newLeadsCount = await Customer.countDocuments({ marketingId, status: "New" });

    const stats = [
      { icon: "fa-university", label: "Bank Manager Visit", value: bankVisitsCount },
      { icon: "fa-landmark", label: "NBFC Manager Visit", value: nbfcVisitsCount },
      { icon: "fa-car", label: "Car Showroom Visit", value: carShowroomVisitsCount },
      { icon: "fa-motorcycle", label: "Bike Showroom Visit", value: bikeShowroomVisitsCount },
      { icon: "fa-user-tie", label: "Other Manager Visit", value: otherManagerVisitsCount },
      { icon: "fa-users", label: "Other Customer Visit", value: otherCustomerVisitsCount },
      { icon: "fa-calendar-check", label: "Total Monthly Visit", value: totalMonthlyVisit },
      { icon: "fa-rupee-sign", label: "Total Expenses", value: `₹${totalExpenses.toLocaleString()}` },
      { icon: "fa-handshake", label: "New Leads", value: newLeadsCount }
    ];

    // Recent visits (latest 5)
    const recentVisits = await Customer.find({ marketingId })
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedVisits = recentVisits.map(visit => ({
      date: visit.createdAt.toLocaleDateString(),
      bank: visit.bankName || "-",
      manager: visit.managerName || "-",
      contact: visit.contact || "-",
      area: visit.area || "-",
      status: visit.status || "Pending"
    }));

    res.json({
      stats,
      visits: formattedVisits
    });
  } catch (error) {
    console.error("Marketing dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/activities', async (req, res) => {
  try {
    // Get today's call logs and follow-ups
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get recent call logs
    const recentCallLogs = await Calllog.find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).sort({ createdAt: -1 }).limit(5);
    
    // Format activities
    const activities = recentCallLogs.map(log => {
      let icon, iconColor, textColor, title, details;
      
      if (log.status === 'Connected') {
        icon = 'fa-phone';
        iconColor = 'bg-blue-100';
        textColor = 'text-blue-600';
        title = `Call with ${log.customer}`;
        details = 'Connected · ' + (log.response || 'No details');
      } else if (log.status === 'Not Connected' || log.status === 'Not Responded') {
        icon = 'fa-times-circle';
        iconColor = 'bg-red-100';
        textColor = 'text-red-600';
        title = `Missed call with ${log.customer}`;
        details = `${log.status} · Will try again later`;
      } else if (log.status === 'Call Back') {
        icon = 'fa-bell';
        iconColor = 'bg-yellow-100';
        textColor = 'text-yellow-600';
        title = `Callback scheduled for ${log.customer}`;
        details = `Callback at ${log.callbackTime || 'unknown time'}`;
      } else {
        icon = 'fa-info-circle';
        iconColor = 'bg-gray-100';
        textColor = 'text-gray-600';
        title = `Activity with ${log.customer}`;
        details = `${log.status} · ${log.response || 'No details'}`;
      }
      
      return {
        icon,
        iconColor,
        textColor,
        title,
        time: log.time,
        details
      };
    });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    // Get data from the last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Get all call logs from the last week
    const callLogs = await Calllog.find({
      createdAt: { $gte: lastWeek }
    });
    
    // Calculate metrics
    const totalCalls = callLogs.length;
    const connectedCalls = callLogs.filter(log => log.status === 'Connected').length;
    const completedCalls = callLogs.filter(log => 
      ['Connected', 'Not Connected', 'Not Responded'].includes(log.status)
    ).length;
    
    // Get follow-ups from the last week
    const followups = await Followup.find({
      createdAt: { $gte: lastWeek }
    });
    
    // Calculate conversion rate (connected calls / total calls)
    const conversionRate = totalCalls > 0 
      ? Math.round((connectedCalls / totalCalls) * 100 * 10) / 10 
      : 0;
    
    // Calculate call completion rate (completed calls / total calls)
    const callCompletion = totalCalls > 0 
      ? Math.round((completedCalls / totalCalls) * 100 * 10) / 10 
      : 0;
    
    // Calculate follow-up rate (followups / total calls)
    const followupRate = totalCalls > 0 
      ? Math.round((followups.length / totalCalls) * 100 * 10) / 10 
      : 0;
    
    res.json({
      conversionRate,
      callCompletion,
      followupRate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/calllogs', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Create search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { customer: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Get call logs with pagination
    const callLogs = await Calllog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count for pagination
    const total = await Calllog.countDocuments(query);
    
    res.json({
      callLogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/customers/:id/assign', async (req, res) => {
  try {
    const { agentId, amount } = req.body;
    const customerId = req.params.id;

    // Validate IDs
    if (!agentId || !mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ error: 'Invalid or missing agentId' });
    }
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    // Validate amount (required field)
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Verify agent exists
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({ error: 'User is not a valid agent' });
    }

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if already assigned or solved
    if (customer.assignedTo) {
      const currentAgent = await User.findById(customer.assignedTo);
      return res.status(400).json({ 
        error: 'Case is already assigned',
        currentAgent: {
          id: currentAgent._id,
          name: currentAgent.name,
          email: currentAgent.email
        }
      });
    }
    if (customer.status === 'Solved') {
      return res.status(400).json({ error: 'Cannot assign a solved case' });
    }

    // Create assignment note with amount information
    const noteContent = `Case assigned to agent: ${agent.name || agent.email} with amount: ₹${amount}`;
    
    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      {
        assignedTo: agentId,
        amount: Number(amount), // Add the amount field
        status: 'In Progress',
        assignedDate: new Date(),
        $push: {
          notes: {
            content: noteContent,
            addedBy: req.user?.id || null // optional if you have auth middleware
          }
        }
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    // Optional: update agent stats
    await User.findByIdAndUpdate(agentId, {
      $inc: { assignedCases: 1 },
      $set: { lastAssignment: new Date() }
    });

    res.json({
      success: true,
      message: 'Case assigned successfully!',
      customer: updatedCustomer,
      agent: { id: agent._id, name: agent.name, email: agent.email }
    });

  } catch (error) {
    console.error('Assign error:', error);
    res.status(500).json({ error: 'Failed to assign case', message: error.message });
  }
});
// ----------------- COMPLETE CASE -----------------
app.post('/api/customers/:id/complete', async (req, res) => {
  try {
    const { cibilBefore, cibilAfter } = req.body;
    const customerId = req.params.id;

    if (!cibilBefore || !cibilAfter) {
      return res.status(400).json({ error: 'Both CIBIL scores are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (customer.status === 'Solved') {
      return res.status(400).json({ error: 'Case is already solved' });
    }

    // Update customer as solved
    const noteContent = `Case marked as completed. CIBIL Before: ${cibilBefore}, CIBIL After: ${cibilAfter}`;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      {
        status: 'Solved',
        cibilBefore,
        cibilAfter,
        resolvedDate: new Date(),
        $push: { notes: { content: noteContent, addedBy: req.user?.id || null } }
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Case marked as completed successfully!',
      customer: updatedCustomer
    });

  } catch (error) {
    console.error('Complete error:', error);
    res.status(500).json({ error: 'Failed to complete case', message: error.message });
  }
});
app.get('/api/customers/assigned/:userId', async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'Missing userId parameter' });
  }
  try {
    const cases = await Customer.find({ assignedTo: userId });
    res.json({ success: true, cases });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch assigned cases' });
  }
});
app.get('/api/offers/:agentId', async (req, res) => {
  const agentId = req.params.agentId;
  try {
    const offers = await Offer.find({ agentId})
      .populate('caseId', 'caseId name problem')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      offers
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching offers'
    });
  }
});
app.get('/api/offers', async (req, res) => {
  const agentId = req.params.agentId;
  try {
    const offers = await Offer.find()
      .populate('caseId', 'caseId name problem')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      offers
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching offers'
    });
  }
});
// POST /api/offers - Create a new offer
app.post('/api/offers', upload.single('paymentProof'), async (req, res) => {
  try {
    const {
      caseId,
      dealAmount,
      advancePaid,
      caseStatus,
      paymentStatus,
      notes,
      agentId
    } = req.body;

    // Check if case exists and belongs to the agent
    const customerCase = await Customer.findOne({
      _id: caseId,
      assignedTo: agentId
    });

    if (!customerCase) {
      return res.status(404).json({
        success: false,
        error: 'Case not found or not assigned to you'
      });
    }

    // Check if offer already exists for this case
    const existingOffer = await Offer.findOne({ caseId });
    if (existingOffer) {
      return res.status(400).json({
        success: false,
        error: 'An offer already exists for this case'
      });
    }

    // Prepare payment proof URL if uploaded
    let paymentProofUrl = '';
    if (req.file) {
      paymentProofUrl = `${req.file.filename}`;
    }

    // Create new offer
    const offer = new Offer({
      caseId,
      agentId,
      dealAmount,
      advancePaid: advancePaid || 0,
      caseStatus: caseStatus || 'In Progress',
      paymentStatus: paymentStatus || 'Pending',
      notes,
      paymentProofUrl
    });

    await offer.save();

    // Update customer with payment proof if exists
    if (paymentProofUrl) {
      customerCase.paymentProofUrl = paymentProofUrl;
      await customerCase.save();
    }

    // Populate case details for response
    await offer.populate('caseId', 'caseId name problem');

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      offer
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating offer'
    });
  }
});



// PUT /api/offers/:id - Update an offer
app.put('/api/offers/:offerId', async (req, res) => {
  try {
    const {
      dealAmount,
      advancePaid,
      caseStatus,
      paymentStatus,
      notes,offerId
      ,agentId
    } = req.body;

    // Find the offer and verify ownership
    let offer = await Offer.findOne({
      _id: offerId,
      agentId: agentId
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    // Update fields
    if (dealAmount !== undefined) offer.dealAmount = dealAmount;
    if (advancePaid !== undefined) offer.advancePaid = advancePaid;
    if (caseStatus !== undefined) offer.caseStatus = caseStatus;
    if (paymentStatus !== undefined) offer.paymentStatus = paymentStatus;
    if (notes !== undefined) offer.notes = notes;

    await offer.save();
    
    // Populate case details for response
    await offer.populate('caseId', 'caseId name problem');
    
    res.json({
      success: true,
      message: 'Offer updated successfully',
      offer
    });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating offer'
    });
  }
});

// DELETE /api/offers/:id - Delete an offer
app.delete('/api/offers/:offerId', async (req, res) => {
    const offerId = req.params.offerId;
    const agentId = req.params.agentId;

  try {
    const offer = await Offer.findOneAndDelete({
      _id: offerId,
      agentId: agentId
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    res.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting offer'
    });
  }
});

// GET /api/offers/stats - Get offer statistics for the agent
app.get('/api/offers/stats', async (req, res) => {
  try {
    const offers = await Offer.find({ agentId: agentId });
    
    const totalOffers = offers.length;
    const totalDealValue = offers.reduce((sum, offer) => sum + offer.dealAmount, 0);
    const completedOffers = offers.filter(offer => offer.caseStatus === 'Completed').length;
    const successRate = totalOffers > 0 ? Math.round((completedOffers / totalOffers) * 100) : 0;
    
    res.json({
      success: true,
      stats: {
        totalOffers,
        totalDealValue,
        successRate
      }
    });
  } catch (error) {
    console.error('Error fetching offer stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching statistics'
    });
  }
});
app.get("/api/payments", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ date: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, error: "Server error while fetching payments" });
  }
});

// POST /api/payments - create new payment with file upload
app.post("/api/payments", upload.single("proof"), async (req, res) => {
  try {
    const {
      customer,
      caseId,
      amount,
      date,
      method,
      status,
      userId // assuming userId is sent in body for createdBy field
    } = req.body;

    if (!customer || !caseId || !amount || !date || !method || !status) {
      return res.status(400).json({ success: false, error: "All payment fields are required" });
    }

    const payment = new Payment({
      customer,
      caseId,
      amount: Number(amount),
      date,
      method,
      status,
      proof: req.file ? req.file.filename : null,
      createdBy: userId, // assuming user info from JWT
    });

    await payment.save();

    res.status(201).json({ success: true, message: "Payment added successfully", payment });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ success: false, error: "Server error while adding payment" });
  }
});

// PUT /api/payments/:id - update payment info (optional)
app.put("/api/payments/:id", upload.single("proof"), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, error: "Payment not found" });

    const {
      customer,
      caseId,
      amount,
      date,
      method,
      status,
    } = req.body;

    if (customer) payment.customer = customer;
    if (caseId) payment.caseId = caseId;
    if (amount) payment.amount = Number(amount);
    if (date) payment.date = date;
    if (method) payment.method = method;
    if (status) payment.status = status;
    if (req.file) payment.proof = req.file.filename;

    await payment.save();

    res.json({ success: true, message: "Payment updated successfully", payment });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ success: false, error: "Server error while updating payment" });
  }
});
app.delete("/api/payments/:id", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ success: false, error: "Payment not found" });

    res.json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ success: false, error: "Server error while deleting payment" });
  }
});
app.get("/api/expenses/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const expenses = await Expense.find({ userId: userId }).sort({ createdAt: -1 });
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find({ }).sort({ createdAt: -1 });
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/api/expense", async (req, res) => {
  const { date, amount, advance, type, description, userId } = req.body;

  if (!date || amount === undefined || amount === null || !type) {
    return res.status(400).json({ error: "Date, amount, and type are required." });
  }

  try {
    const newExpense = new Expense({
      userId,
      date,
      amount: Number(amount),
      advance: Number(advance) || 0,
      type,
      description: description || "",
    });

    await newExpense.save();
    res.json({ success: true, message: "Expense added successfully" });
  } catch (error) {
    console.error("Error saving expense:", error); // log real error
    res.status(500).json({ error: "Server error" });
  }
});
app.get('/api/users/role', async (req, res) => {
  try {
    const role = req.query.role; // get role from query
    const status = req.query.status; // optional: filter by status
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select('-password'); // exclude password
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
app.get("/api/referrals", async (req, res) => {
  try {
    const referrals = await Referral.find().sort({ createdAt: -1 });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// In your server routes (e.g., routes/customers.js)

// Add new referral
app.post("/api/referrals", async (req, res) => {
  try {
    const { name, phone, cases, successRate, commission } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const newReferral = new Referral({
      name,
      phone,
      cases: cases || 0,
      successRate: successRate || "0%",
      commission: commission || "₹0"
    });

    await newReferral.save();
    res.status(201).json({ message: "Referral added", referral: newReferral });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/marketing/stats', async (req, res) => {
  try {
    // 1️⃣ Visits (FieldData)
    const allVisits = await FieldData.find();
    const recentVisits = await FieldData.find().sort({ date: -1 }).limit(5);

    const visitTypes = {
      "Bank Manager Visit": 0,
      "NBFC Manager Visit": 0,
      "Car Showroom Visit": 0,
      "Bike Showroom Visit": 0,
      "Other Manager Visit": 0,
      "Other Customer Visit": 0,
      "Total Monthly Visit": allVisits.length
    };

    allVisits.forEach((visit) => {
      if (visit.area?.toLowerCase().includes("bank")) {
        visitTypes["Bank Manager Visit"] += 1;
      } else if (visit.area?.toLowerCase().includes("nbfc")) {
        visitTypes["NBFC Manager Visit"] += 1;
      } else if (visit.area?.toLowerCase().includes("car")) {
        visitTypes["Car Showroom Visit"] += 1;
      } else if (visit.area?.toLowerCase().includes("bike")) {
        visitTypes["Bike Showroom Visit"] += 1;
      } else if (visit.area?.toLowerCase().includes("customer")) {
        visitTypes["Other Customer Visit"] += 1;
      } else {
        visitTypes["Other Manager Visit"] += 1;
      }
    });

    // 2️⃣ Expenses
    const totalExpenseAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpense = totalExpenseAgg[0]?.total || 0;

    // 3️⃣ Leads
    const allLeads = await Followup.find();
    const totalLeads = allLeads.length;

    // 4️⃣ Construct top stats array
    const dashboardStatsTop = [
      { icon: "fa-university", label: "Bank Manager Visit", value: visitTypes["Bank Manager Visit"] },
      { icon: "fa-landmark", label: "NBFC Manager Visit", value: visitTypes["NBFC Manager Visit"] },
      { icon: "fa-car", label: "Car Showroom Visit", value: visitTypes["Car Showroom Visit"] },
      { icon: "fa-motorcycle", label: "Bike Showroom Visit", value: visitTypes["Bike Showroom Visit"] },
      { icon: "fa-user-tie", label: "Other Manager Visit", value: visitTypes["Other Manager Visit"] },
      { icon: "fa-users", label: "Other Customer Visit", value: visitTypes["Other Customer Visit"] },
      { icon: "fa-calendar-check", label: "Total Monthly Visit", value: visitTypes["Total Monthly Visit"] },
      { icon: "fa-rupee-sign", label: "Total Expenses", value: `₹${totalExpense.toLocaleString()}` },
      { icon: "fa-handshake", label: "New Leads", value: totalLeads }
    ];

    // 5️⃣ Optional: User roles counts
    const marketingUsers = await User.countDocuments({ role: "marketing" });
    const agents = await User.countDocuments({ role: "agent" });
    const telecallers = await User.countDocuments({ role: "telecaller" });

    const dashboardStatsBottom = [
      { icon: "fa-user-tie", label: "Marketing Users", value: marketingUsers },
      { icon: "fa-users", label: "Agents", value: agents },
      { icon: "fa-phone", label: "Telecallers", value: telecallers }
    ];

    // 6️⃣ Send response
    res.json({
      dashboardStatsTop,
      dashboardStatsBottom,
      recentVisits
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: error.message });
  }
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(5000, () => console.log('Server started on http://localhost:5000'));
