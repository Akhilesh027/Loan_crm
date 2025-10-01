import React, { useState, useEffect } from "react";
import { 
  FaEye, 
  FaCheckCircle, 
  FaUserPlus, 
  FaEdit, 
  FaTimes, 
  FaMoneyBillWave, 
  FaComments, 
  FaCheck, 
  FaSyncAlt, 
  FaExclamationTriangle,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaFileAlt,
  FaChartLine,
  FaUser,
  FaCalendar,
  FaSearch,
  FaFilter
} from "react-icons/fa";

// ====================================================================
// --- Reusable Component Definitions ---
// ====================================================================

const statusColors = {
  Solved: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  "In Progress": "bg-amber-100 text-amber-800 border border-amber-300",
  "Customer Pending": "bg-orange-100 text-orange-800 border border-orange-300",
  "Agent Pending": "bg-blue-100 text-blue-800 border border-blue-300",
  "Admin Pending": "bg-rose-100 text-rose-800 border border-rose-300",
};

const bankStatusColors = {
  Pending: "bg-rose-100 text-rose-800 border border-rose-300",
  "In Progress": "bg-amber-100 text-amber-800 border border-amber-300",
  Completed: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  "On Hold": "bg-blue-100 text-blue-800 border border-blue-300",
};

const priorityColors = {
  High: "bg-rose-100 text-rose-800 border border-rose-300",
  Medium: "bg-amber-100 text-amber-800 border border-amber-300",
  Low: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  Normal: "bg-blue-100 text-blue-800 border border-blue-300",
};

// Utility: Calculate days since assigned
const calculateDaysCount = (dateStr) => {
  if (!dateStr) return 0;
  const assignedDate = new Date(dateStr);
  const today = new Date();
  assignedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today - assignedDate) / (1000 * 60 * 60 * 24)));
};

// Component: Preview Image or PDF documents
const DocumentPreview = ({ label, url }) => {
  if (!url) return (
    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-gray-500 text-sm">No {label} uploaded</p>
    </div>
  );

  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);

  return (
    <div className="mb-4">
      <p className="font-semibold mb-2 text-gray-700 flex items-center">
        <FaFileAlt className="mr-2 text-blue-500" />
        {label}
      </p>
      {isImage ? (
        <div className="relative group">
          <img 
            src={`http://localhost:5000/uploads/${url}`} 
            alt={label} 
            className="w-full max-w-sm border-2 border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl" />
        </div>
      ) : isPdf ? (
        <div className="relative group">
          <iframe 
            src={`http://localhost:5000/uploads/${url}`} 
            title={label} 
            className="w-full h-64 border-2 border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl" />
        </div>
      ) : (
        <a 
          href={`http://localhost:5000/uploads/${url}`} 
          target="_blank" 
          rel="noreferrer" 
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <FaEye className="mr-2" />
          View {label}
        </a>
      )}
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`bg-white rounded-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Input Field Component
const InputField = ({ label, name, value, onChange, type = "text", placeholder, required = false, disabled = false, icon }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
      {icon && <span className="inline-flex items-center mr-2">{icon}</span>}
      {label}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
    />
  </div>
);

// TextArea Field Component
const TextAreaField = ({ label, name, value, onChange, placeholder, required = false, rows = 4, icon }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
      {icon && <span className="inline-flex items-center mr-2">{icon}</span>}
      {label}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
    />
  </div>
);

// Status Badge Component
const StatusBadge = ({ status, type = "case" }) => {
  const colors = type === "case" ? statusColors : bankStatusColors;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}>
      {status}
    </span>
  );
};

// ====================================================================
// --- AssignedCases Component ---
// ====================================================================

const AssignedCases = () => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [cibilBefore, setCibilBefore] = useState("");
  const [cibilAfter, setCibilAfter] = useState("");
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestCaseId, setRequestCaseId] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [chatRequests, setChatRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [showCibilReportModal, setShowCibilReportModal] = useState(false);
  const [cibilReportFile, setCibilReportFile] = useState(null);
  const [cibilCaseId, setCibilCaseId] = useState(null);
  const [uploadingCibil, setUploadingCibil] = useState(false);
  const [bankStatusUpdate, setBankStatusUpdate] = useState({ bankName: null, status: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  // Utility to show a message and clear it after a delay
  const showNotification = (message, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMessage(message);
    } else {
      setError(message);
    }
    setTimeout(() => clearMessages(), 5000);
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage("");
  };

  // Load user info and assigned cases at mount
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setUserInfo(JSON.parse(userData));
      } catch (err) {
        console.error(err);
        setError("Failed to load user information.");
      }
    } else {
      setError("No user information found. Please log in.");
    }
    fetchAssignedCases();
  }, []);

  // Fetch assigned cases with auth token
  const fetchAssignedCases = async () => {
    if (!userId || !token) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`http://localhost:5000/api/customers/assigned/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch assigned cases.");

      if (data.success && Array.isArray(data.cases)) {
        setCases(
          data.cases.map((c) => ({
            ...c,
            daysCount: calculateDaysCount(c.assignedDate),
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle CIBIL Report file upload
  const handleCibilReportUpload = async () => {
    if (!cibilReportFile) {
      showNotification("Please select a file to upload", false);
      return;
    }

    try {
      setUploadingCibil(true);
      const formData = new FormData();
      formData.append("cibilReport", cibilReportFile);

      const response = await fetch(`http://localhost:5000/api/customers/${cibilCaseId}/upload-cibil`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to upload CIBIL report");

      setCases((prev) => prev.map((c) => (c._id === cibilCaseId ? data.customer : c)));
      showNotification("CIBIL Report uploaded successfully!");

      setShowCibilReportModal(false);
    } catch (err) {
      showNotification(err.message, false);
    } finally {
      setUploadingCibil(false);
      setCibilReportFile(null);
    }
  };

  // Update bank status
  const updateBankStatus = async (caseId, bankName, newStatus) => {
    try {
      if (!token) throw new Error("Authentication failed.");

      const response = await fetch(`http://localhost:5000/api/customers/${caseId}/update-bank-status`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bank: bankName, status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update bank status");

      setCases(prev => prev.map(c => (c._id === caseId ? data.customer : c)));
      setSelectedCase(data.customer);
      
      setBankStatusUpdate({ bankName: null, status: "" });
      showNotification("Bank status updated successfully!");
    } catch (err) {
      showNotification(err.message, false);
    }
  };

  // Filter cases based on search and status
  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = 
      caseItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.problem?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Existing handlers
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };
  
  const openCompleteModal = (caseItem) => {
    setActiveCaseId(caseItem._id);
    setCibilBefore(caseItem.cibilBefore || "");
    setCibilAfter(caseItem.cibilAfter || "");
    setShowCompleteModal(true);
  };
  
  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setActiveCaseId(null);
    setCibilBefore("");
    setCibilAfter("");
  };
  
  const handleCompleteSubmit = async () => {
    if (!cibilBefore || !cibilAfter) {
      setError("Please enter both CIBIL scores");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

      const response = await fetch(`http://localhost:5000/api/customers/${activeCaseId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cibilBefore, cibilAfter }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to complete case");

      setCases((prev) => prev.map((c) => (c._id === activeCaseId ? data.customer : c)));
      showNotification("Case marked as complete!");
      setShowCompleteModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const openRequestModal = (caseId) => {
    setRequestCaseId(caseId);
    setRequestMessage("");
    setShowRequestModal(true);
  };

  const sendChatRequest = async () => {
    if (!requestMessage.trim()) {
      setError("Please enter your request message");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/customers/${requestCaseId}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: requestMessage,
          agentId: userId,
          agentName: userInfo?.name || "Agent",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send request");

      showNotification("Request sent to admin successfully!");
      setShowRequestModal(false);
    } catch (err) {
      showNotification(err.message, false);
    }
  };

  const fetchChatRequests = async (caseId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/customers/${caseId}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch chat requests");

      const data = await response.json();
      setChatRequests(data.requests || []);
      setShowRequests(true);
    } catch (err) {
      showNotification(err.message, false);
    }
  };

  // Loading state
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your cases...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {userInfo && (
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  My Assigned Cases
                </h1>
                <p className="text-gray-600 mt-2">Welcome back, <span className="font-semibold text-blue-600">{userInfo.name}</span></p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                  {userInfo.role}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchAssignedCases}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              >
                <FaSyncAlt className="mr-2"/> Refresh
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 hover:shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex justify-between items-center animate-fade-in">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-rose-500 mr-3" />
              <span className="text-rose-700">{error}</span>
            </div>
            <button onClick={clearMessages} className="text-rose-500 hover:text-rose-700 transition-colors">
              <FaTimes />
            </button>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center animate-fade-in">
            <div className="flex items-center">
              <FaCheck className="text-emerald-500 mr-3" />
              <span className="text-emerald-700">{successMessage}</span>
            </div>
            <button onClick={clearMessages} className="text-emerald-500 hover:text-emerald-700 transition-colors">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search cases by name, case ID, phone, or problem..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="Solved">Solved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Customer Pending">Customer Pending</option>
                  <option value="Agent Pending">Agent Pending</option>
                  <option value="Admin Pending">Admin Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Assigned Cases
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                  {filteredCases.length} {filteredCases.length === 1 ? 'case' : 'cases'}
                </span>
              </h2>
              <div className="text-sm text-gray-600">
                Showing {filteredCases.length} of {cases.length} total cases
              </div>
            </div>
          </div>

          {filteredCases.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFileAlt className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Cases Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "No cases match your current filters." 
                  : "No cases have been assigned to you yet."}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Case Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Problem</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timeline</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCases.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors duration-150 group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono font-semibold text-gray-900 text-sm">
                            {c.caseId || `CASE-${c._id.slice(-6).toUpperCase()}`}
                          </p>
                          <div className="flex items-center mt-1">
                            <FaCalendar className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {new Date(c.assignedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 flex items-center">
                            <FaUser className="w-3 h-3 text-blue-500 mr-2" />
                            {c.name}
                          </p>
                          <div className="flex items-center mt-1 space-x-2">
                            {c.phone && (
                              <span className="flex items-center text-sm text-gray-600">
                                <FaPhone className="w-3 h-3 mr-1" />
                                {c.phone}
                              </span>
                            )}
                            {c.email && (
                              <span className="flex items-center text-sm text-gray-600">
                                <FaEnvelope className="w-3 h-3 mr-1" />
                                {c.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-gray-700 line-clamp-2 text-sm">{c.problem}</p>
                        {c.priority && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${priorityColors[c.priority] || priorityColors.Normal}`}>
                            {c.priority} Priority
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            c.daysCount > 7
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : c.daysCount > 3
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          }`}
                        >
                          <FaCalendar className="w-3 h-3 mr-1" />
                          {c.daysCount} day{c.daysCount !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setSelectedCase(c)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </button>

                          <button
                            onClick={() => openRequestModal(c._id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                            title="Request Information"
                          >
                            <FaComments size={16} />
                          </button>

                          <button
                            onClick={() => {
                              setCibilCaseId(c._id);
                              setShowCibilReportModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                            title="Upload CIBIL Report"
                          >
                            <FaChartLine size={16} />
                          </button>

                          {c.status !== "Solved" && (
                            <button
                              onClick={() => openCompleteModal(c)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                              title="Complete Case"
                            >
                              <FaCheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
        {/* Request Modal */}
        <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request Information" size="lg">
          <TextAreaField
            label="Request Message"
            name="requestMessage"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Explain what information you need from the admin..."
            required
            rows={5}
            icon={<FaComments className="text-purple-500" />}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowRequestModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={sendChatRequest}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Send Request
            </button>
          </div>
        </Modal>

        {/* Complete Case Modal */}
        <Modal isOpen={showCompleteModal} onClose={closeCompleteModal} title="Complete Case">
          <div className="space-y-4">
            <InputField
              label="CIBIL Score Before"
              name="cibilBefore"
              type="number"
              value={cibilBefore}
              onChange={(e) => setCibilBefore(e.target.value)}
              placeholder="Enter CIBIL score before resolution"
              required
              icon={<FaChartLine className="text-blue-500" />}
            />
            <InputField
              label="CIBIL Score After"
              name="cibilAfter"
              type="number"
              value={cibilAfter}
              onChange={(e) => setCibilAfter(e.target.value)}
              placeholder="Enter CIBIL score after resolution"
              required
              icon={<FaChartLine className="text-green-500" />}
            />
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={closeCompleteModal}
                className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSubmit}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Complete Case
              </button>
            </div>
          </div>
        </Modal>

        {/* CIBIL Report Modal */}
        <Modal isOpen={showCibilReportModal} onClose={() => setShowCibilReportModal(false)} title="Upload CIBIL Report">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaFileAlt className="mr-2 text-blue-500" />
                Select CIBIL Report File
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setCibilReportFile(e.target.files[0])}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowCibilReportModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCibilReportUpload}
                disabled={!cibilReportFile || uploadingCibil}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadingCibil ? (
                  <>
                    <FaSyncAlt className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaFileAlt />
                    Upload Report
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* Case Details Modal */}
        <Modal isOpen={!!selectedCase} onClose={() => setSelectedCase(null)} title="Case Details" size="2xl">
          {selectedCase && (
            <div className="space-y-6">
              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Name", value: selectedCase.name, icon: <FaUser className="text-blue-500" /> },
                  { label: "Phone", value: selectedCase.phone || "-", icon: <FaPhone className="text-green-500" /> },
                  { label: "Email", value: selectedCase.email || "-", icon: <FaEnvelope className="text-purple-500" /> },
                  { label: "Aadhaar Number", value: selectedCase.aadhaar || "-", icon: <FaIdCard className="text-orange-500" /> },
                  { label: "PAN Number", value: selectedCase.pan || "-", icon: <FaIdCard className="text-red-500" /> },
                  { label: "Case ID", value: selectedCase.caseId || "-", icon: <FaFileAlt className="text-indigo-500" /> },
                  { label: "Priority", value: selectedCase.priority || "-", icon: <FaExclamationTriangle className="text-amber-500" /> },
                  { label: "Page Number", value: selectedCase.pageNumber || "-", icon: <FaFileAlt className="text-gray-500" /> },
                  { label: "Telecaller Name", value: selectedCase.telecallerName || "-", icon: <FaUser className="text-cyan-500" /> },
                ].map((item, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-2">
                      {item.icon}
                      <p className="text-sm font-semibold text-gray-600 ml-2">{item.label}</p>
                    </div>
                    <p className="font-medium text-gray-900 text-lg">{item.value}</p>
                  </div>
                ))}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <FaChartLine className="text-emerald-500" />
                    <p className="text-sm font-semibold text-gray-600 ml-2">Status</p>
                  </div>
                  <StatusBadge status={selectedCase.status} />
                </div>
              </div>

              {/* Problem Description */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <FaFileAlt className="mr-2 text-blue-500" />
                  Problem Description
                </h4>
                <p className="text-gray-900 bg-white p-3 rounded-lg border border-blue-100">{selectedCase.problem}</p>
              </div>

              {/* Banking Details */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-700 flex items-center">
                    <FaBuilding className="mr-2 text-blue-500" />
                    Banking Details & Status
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bank Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Account Number</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Loan Type</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(selectedCase.bankDetails || {}).length > 0 ? (
                        Object.entries(selectedCase.bankDetails).map(([bank, bankDetail], index) => {
                          const currentStatus = bankDetail.status || "Pending";
                          const isEditing = bankStatusUpdate.bankName === bank;
                          return (
                            <tr key={bank} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 font-medium text-gray-900">{bank}</td>
                              <td className="px-6 py-4 text-gray-700 font-mono text-sm">{bankDetail.accountNumber || 'N/A'}</td>
                              <td className="px-6 py-4 text-gray-700">{bankDetail.loanType || 'N/A'}</td>
                              <td className="px-6 py-4">
                                <StatusBadge status={currentStatus} type="bank" />
                              </td>
                              <td className="px-6 py-4">
                                {isEditing ? (
                                  <div className="flex items-center space-x-2">
                                    <select
                                      value={bankStatusUpdate.status}
                                      onChange={(e) => setBankStatusUpdate({...bankStatusUpdate, status: e.target.value})}
                                      className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Completed">Completed</option>
                                      <option value="On Hold">On Hold</option>
                                    </select>
                                    <button
                                      onClick={() => updateBankStatus(selectedCase._id, bank, bankStatusUpdate.status)}
                                      className="p-1 text-emerald-600 hover:text-emerald-800 transition-colors hover:scale-110"
                                      title="Save Status"
                                    >
                                      <FaCheck size={14} />
                                    </button>
                                    <button
                                      onClick={() => setBankStatusUpdate({ bankName: null, status: "" })}
                                      className="p-1 text-rose-600 hover:text-rose-800 transition-colors hover:scale-110"
                                      title="Cancel Edit"
                                    >
                                      <FaTimes size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                   onClick={() => setBankStatusUpdate({ bankName: bank, status: currentStatus })}
                                   className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                                   title="Edit Status"
                                  >
                                    <FaEdit size={14} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td className="px-6 py-8 text-center text-gray-500" colSpan="5">
                            <div className="flex flex-col items-center">
                              <FaBuilding className="text-gray-400 text-3xl mb-2" />
                              <p className="text-lg font-medium">No banking details available</p>
                              <p className="text-sm text-gray-500">Banking information will appear here once added</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Documents Section */}
              {selectedCase.documents && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
                    <FaFileAlt className="mr-2 text-blue-500" />
                    Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedCase.documents.aadhaarDoc && (
                      <DocumentPreview label="Aadhaar Card" url={selectedCase.documents.aadhaarDoc} />
                    )}
                    {selectedCase.documents.panDoc && (
                      <DocumentPreview label="PAN Card" url={selectedCase.documents.panDoc} />
                    )}
                    {selectedCase.documents.accountStatementDoc && (
                      <DocumentPreview label="Account Statement" url={selectedCase.documents.accountStatementDoc} />
                    )}
                    {selectedCase.documents.additionalDoc && (
                      <DocumentPreview label="Additional Document" url={selectedCase.documents.additionalDoc} />
                    )}
                    {selectedCase.documents.paymentProof && (
                      <DocumentPreview label="Payment Proof" url={selectedCase.documents.paymentProof} />
                    )}
                    {selectedCase.documents.cibilReport && (
                      <DocumentPreview label="CIBIL Report" url={selectedCase.documents.cibilReport} />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AssignedCases;