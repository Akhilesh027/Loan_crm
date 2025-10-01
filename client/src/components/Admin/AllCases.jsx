import React, { useState, useEffect } from "react";
import { FaEye, FaUserPlus, FaPlus, FaCheckCircle, FaEdit, FaTimes, FaTrash, FaMoneyBillWave, FaPhone, FaHistory, FaCheck, FaClock, FaSearch, FaFilter, FaSyncAlt } from "react-icons/fa";
import AddCustomer from "../Telecaller/pages/AddCustomer";
import EditCustomer from "../Telecaller/pages/EditCustomer"; 

// ====================================================================
// --- Reusable Component Definitions ---
// ====================================================================

const statusColors = {
  Solved: "bg-green-100 text-green-800 border border-green-300",
  "In Progress": "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Pending: "bg-red-100 text-red-800 border border-red-300",
  "Call Back": "bg-blue-100 text-blue-800 border border-blue-300",
  "Not Reachable": "bg-gray-100 text-gray-800 border border-gray-300",
};

const bankStatusColors = {
  Pending: "bg-red-100 text-red-800 border border-red-300",
  "In Progress": "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Completed: "bg-green-100 text-green-800 border border-green-300",
  "On Hold": "bg-blue-100 text-blue-800 border border-blue-300",
};

const DocumentPreview = ({ label, url }) => {
  if (!url) return <p className="italic text-gray-500 mb-3">No {label} uploaded</p>;

  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);

  return (
    <div className="mb-4">
      <p className="font-semibold mb-2 text-gray-700">{label}</p>
      {isImage ? (
        <img
          src={`http://localhost:5000/uploads/${url}`}
          alt={`${label} Document`}
          className="w-full max-w-sm border rounded-lg shadow-md"
        />
      ) : isPdf ? (
        <iframe
          src={`http://localhost:5000/uploads/${url}`}
          title={label}
          className="w-full h-48 border rounded-lg shadow-md"
        />
      ) : (
        <a
          href={`http://localhost:5000/uploads/${url}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          View {label}
        </a>
      )}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className={`bg-white rounded-xl p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ease-in-out animate-slideUp`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text", placeholder, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, required = false, rows = 3 }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white resize-vertical"
    />
  </div>
);

// ====================================================================
// --- AssignedCases Component ---
// ====================================================================

const AssignedCases = () => {
  const [cases, setCases] = useState([]);
  const [availableOfficers, setAvailableOfficers] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [assignCaseId, setAssignCaseId] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeCaseId, setCompleteCaseId] = useState(null);
  const [cibilBefore, setCibilBefore] = useState("");
  const [cibilAfter, setCibilAfter] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCase, setEditCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCaseId, setPaymentCaseId] = useState(null);
  const [totalAmount, setTotalAmount] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callCaseId, setCallCaseId] = useState(null);
  const [callResponse, setCallResponse] = useState("");
  const [callStatus, setCallStatus] = useState("Pending");
  const [nextCallDate, setNextCallDate] = useState("");
  const [callHistory, setCallHistory] = useState([]);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showCallOutcomeModal, setShowCallOutcomeModal] = useState(false);
  const [callOutcome, setCallOutcome] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [caseType, setCaseType] = useState("normal");
  const [editingBankIndex, setEditingBankIndex] = useState(null);
  const [bankStatusUpdate, setBankStatusUpdate] = useState({ bankIndex: null, status: "" });
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState(null);
const [paymentStatus, setPaymentStatus] = useState(selectedCase?.paymentStatus || "pending");
const [agentPaymentStatus, setAgentPaymentStatus] = useState(selectedCase?.agentPaymentStatus || "pending");

// ... useEffect to sync state when selectedCase changes
useEffect(() => {
    if (selectedCase) {
      setPaymentStatus(selectedCase.paymentStatus || "pending");
      setAgentPaymentStatus(selectedCase.agentPaymentStatus || "pending"); // <-- Ensure this is here
    }
}, [selectedCase]);

// NEW FUNCTION: Handle agent payment status update
const updateAgentPaymentStatus = async (caseId) => {
    try {
        const response = await fetch(
            `http://localhost:5000/api/${caseId}/agent-payment-status`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agentPaymentStatus }),
            }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to update agent payment status");

        // Update the main cases array and the selectedCase state
        setCases((prev) =>
            prev.map((c) => (c._id === caseId ? data.customer : c))
        );
        setSelectedCase(data.customer); // Important to update the modal content
        showNotification("Agent payment status updated successfully!", 'success');
        
    } catch (err) {
        setError(err.message);
    }
};


  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const openAddCustomerModal = () => {
    setEditingCustomer(null);
    setShowCustomerModal(true);
  };

  const openEditCustomerModal = (customer) => {
    setEditCustomerId(customer._id);
    setShowEditCustomerModal(true);
  };

  const handleCustomerModalClose = () => {
    setShowCustomerModal(false);
    setEditingCustomer(null);
    fetchData(); 
  };
  
  const handleEditCustomerModalClose = () => {
    setShowEditCustomerModal(false);
    setEditCustomerId(null);
    fetchData();
  };

  const handleCustomerSave = (savedCustomer, isNew) => {
    if (isNew) {
      setCases(prev => [...prev, savedCustomer]);
      showNotification('Customer added successfully!');
    } else {
      setCases(prev => prev.map(c => c._id === savedCustomer._id ? savedCustomer : c));
      showNotification('Customer updated successfully!');
    }
    setShowCustomerModal(false);
    setEditingCustomer(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [casesResponse, agentsResponse] = await Promise.all([
        fetch("http://localhost:5000/api/customers"),
        fetch("http://localhost:5000/api/users/role?role=agent")
      ]);

      if (!casesResponse.ok) throw new Error("Failed to fetch cases");
      if (!agentsResponse.ok) throw new Error("Failed to fetch agents");

      const casesData = await casesResponse.json();
      const agentsData = await agentsResponse.json();

      setCases(Array.isArray(casesData) ? casesData : casesData.customers || []);
      setAvailableOfficers(Array.isArray(agentsData) ? agentsData : agentsData.users || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesStatus = filterStatus === "All" || caseItem.status === filterStatus;
    const matchesSearch = caseItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         caseItem.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.problem?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateBankStatus = async (caseId, bank, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${caseId}/update-bank-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bank, status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update bank status");

      setCases(prev =>
        prev.map(c => (c.id === caseId ? data.customer : c))
      );
      setBankStatusUpdate({ bank: null, status: "" });
      showNotification("Bank status updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const openCallModal = (caseId) => {
    setCallCaseId(caseId);
    setCallOutcome("");
    setShowCallOutcomeModal(true);
  };

  const handleCallOutcome = (outcome) => {
    setCallOutcome(outcome);
    setShowCallOutcomeModal(false);
    
    const c = cases.find((c) => c._id === callCaseId);
    setCallResponse("");
    
    if (outcome === "success") {
      setCallStatus("Solved");
      setShowPaymentModal(true);
      setPaymentCaseId(callCaseId);
      setTotalAmount(c.totalAmount || "");
      setAdvanceAmount(c.advanceAmount || "");
    } else {
      setCallStatus(outcome === "callback" ? "Call Back" : "Not Reachable");
      setShowCallModal(true);
    }
  };

  const fetchCallHistory = async (caseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${caseId}/call-history`);
      if (!response.ok) throw new Error("Failed to fetch call history");
      
      const data = await response.json();
      setCallHistory(data.callHistory || []);
      setShowCallHistory(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const saveCallResponse = async () => {
    if (!callResponse) {
      setError("Please enter call response");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${callCaseId}/call`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            response: callResponse, 
            status: callStatus,
            nextCallDate: nextCallDate || undefined
          }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save call response");

      setCases((prev) =>
        prev.map((c) =>
          c._id === callCaseId ? data.customer : c
        )
      );
      setSuccessMessage("Call response saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowCallModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePaymentProofChange = (e) => {
    setPaymentProof(e.target.files[0]);
  };

  const submitPayment = async () => {
    if (!totalAmount || !advanceAmount) {
      setError("Please enter both total and advance amounts");
      return;
    }

    if (parseFloat(advanceAmount) > parseFloat(totalAmount)) {
      setError("Advance amount cannot be greater than total amount");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("totalAmount", totalAmount.toString());
      formData.append("advanceAmount", advanceAmount.toString());

      if (paymentProof) {
        formData.append("paymentProof", paymentProof);
      }

      const response = await fetch(
        `http://localhost:5000/api/customers/${paymentCaseId}/payment`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save payment details");

      setCases((prev) =>
        prev.map((c) => (c._id === paymentCaseId ? data.customer : c))
      );

      setSuccessMessage("Payment details saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowPaymentModal(false);
      setUploading(false);
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  const openAssignModal = (caseId) => {
    setAssignCaseId(caseId);
    const c = cases.find((c) => c._id === caseId);
    setSelectedOfficer(c.assignedTo || "");
    setEditCase({ ...c });
    setTotalAmount(c.totalAmount || "");
    setAdvanceAmount(c.advanceAmount || "");
    setPaymentProof(null);
    setCaseType("normal");
    setShowAssignModal(true);
  };

  const assignOfficer = async () => {
    if (!selectedOfficer) {
      setError("Please select an officer");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("agentId", selectedOfficer);
      formData.append("totalAmount", totalAmount ? totalAmount.toString() : "0");
      formData.append("advanceAmount", advanceAmount ? advanceAmount.toString() : "0");
      formData.append("caseType", caseType);
      
      if (paymentProof) {
        formData.append("agentPaymentProof", paymentProof);
      }

      const response = await fetch(
        `http://localhost:5000/api/${assignCaseId}/assign`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to assign case");

      setCases((prev) =>
        prev.map((c) => (c._id === assignCaseId ? data.customer : c))
      );
      setSuccessMessage("Officer assigned successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowAssignModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const openCompleteModal = (caseId) => {
    setCompleteCaseId(caseId);
    const c = cases.find((c) => c._id === caseId);
    setCibilBefore(c.cibilBefore || "");
    setCibilAfter(c.cibilAfter || "");
    setShowCompleteModal(true);
  };

  const completeCase = async () => {
    if (!cibilBefore || !cibilAfter) {
      setError("Please enter both CIBIL scores");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${completeCaseId}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cibilBefore, cibilAfter }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to complete case");

      setCases((prev) =>
        prev.map((c) => (c._id === completeCaseId ? data.customer : c))
      );
      setSuccessMessage("Case marked as complete!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowCompleteModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (caseData) => {
    setEditCase({ ...caseData });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditCase((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditedCase = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${editCase._id}/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editCase),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update case");

      setCases((prev) =>
        prev.map((c) => (c._id === editCase._id ? data.customer : c))
      );
      setShowEditModal(false);
      setSuccessMessage("Case updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage("");
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-xl text-gray-600 animate-pulse">Loading cases...</div>
    </div>
  );
  
  if (error && !cases.length) return (
    <div className="p-4 max-w-full mx-auto">
      <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4 flex justify-between items-center shadow-sm">
        <div>Error: {error}</div>
        <button onClick={fetchData} className="text-red-800 font-semibold hover:text-red-900 transition-colors">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Assigned Cases</h2>
        <p className="text-gray-600">Manage and track all customer cases efficiently</p>
      </div>

      {/* Notification */}
      {notification.message && (
        <div className={`fixed top-5 right-5 p-4 rounded-xl shadow-lg text-white font-medium z-50 transform transition-all duration-300 ease-in-out ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-green-600' 
            : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-red-500 rounded-full mr-3"></div>
            <div>{error}</div>
          </div>
          <button onClick={clearMessages} className="text-red-800 hover:text-red-900 transition-colors p-1">
            <FaTimes />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-green-500 rounded-full mr-3"></div>
            <div>{successMessage}</div>
          </div>
          <button onClick={clearMessages} className="text-green-800 hover:text-green-900 transition-colors p-1">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Cases</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, case ID or problem..."
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Add Customer Button */}
          <div className="flex items-end">
            <button 
              onClick={openAddCustomerModal}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center justify-center font-semibold"
            >
              <FaPlus className="mr-2" /> Add Customer
            </button>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status Filter</label>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Solved">Solved</option>
                <option value="Call Back">Call Back</option>
                <option value="Not Reachable">Not Reachable</option>
              </select>
            </div>
          </div>
          
          {/* Refresh Button */}
          <div className="flex items-end">
            <button 
              onClick={fetchData}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center justify-center font-semibold"
            >
              <FaSyncAlt className="mr-2" /> Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Cases Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-700 text-left min-w-[50px] border-b border-gray-200">S.No</th>
                <th className="p-4 font-semibold text-gray-700 text-left min-w-[100px] border-b border-gray-200">Case ID</th>
                <th className="p-4 font-semibold text-gray-700 text-left min-w-[150px] border-b border-gray-200">Customer Name</th>
                <th className="p-4 font-semibold text-gray-700 text-left min-w-[100px] border-b border-gray-200">Phone</th>
                <th className="p-4 font-semibold text-gray-700 text-left min-w-[200px] border-b border-gray-200">Problem</th>
                <th className="p-4 font-semibold text-gray-700 text-left min-w-[120px] border-b border-gray-200">Status</th>
                <th className="p-4 font-semibold text-gray-700 text-left min-w-[100px] border-b border-gray-200">Agent</th>
                <th className="p-4 font-semibold text-gray-700 text-center min-w-[150px] border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <FaSearch className="text-gray-400 text-xl" />
                      </div>
                      <p className="text-lg font-medium text-gray-600">No cases found</p>
                      <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c, index) => {
                  const officer = c.assignedTo && availableOfficers.find((o) => o._id === c.assignedTo);
                  const hasPaymentDetails = c.totalAmount && c.advanceAmount;
                  
                  return (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors duration-200 group">
                      <td className="p-4 font-medium text-gray-600">{index + 1}</td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-800 bg-blue-50 px-2 py-1 rounded-lg text-sm">
                          {c.caseId || `CASE-${c._id.slice(-4).toUpperCase()}`}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">{c.name}</td>
                      <td className="p-4 text-gray-600">{c.phone || "-"}</td>
                      <td className="p-4 max-w-xs">
                        <div className="text-gray-700 line-clamp-2">{c.problem}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            statusColors[c.status] || "bg-gray-100 text-gray-800 border-gray-300"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {officer ? (
                          <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                            {officer.username}
                          </span>
                        ) : c.assignedTo ? (
                          <span className="bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                            Assigned
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => setSelectedCase(c)}
                            className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110 group relative"
                            title="View Details"
                          >
                            <FaEye />
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                              View Details
                            </div>
                          </button>
                          
                          <button
                            onClick={() => openCallModal(c._id)}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 group relative"
                            title="Log Call"
                          >
                            <FaPhone />
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                              Log Call
                            </div>
                          </button>
                           
                          <button
                            onClick={() => fetchCallHistory(c._id)}
                            className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:scale-110 group relative"
                            title="Call History"
                          >
                            <FaHistory />
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                              Call History
                            </div>
                          </button>
                          
                          {!c.assignedTo && c.status !== "Solved" && (
                            <button
                              onClick={() => openAssignModal(c._id)}
                              className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110 group relative"
                              title="Assign Officer"
                            >
                              <FaUserPlus />
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                Assign Officer
                              </div>
                            </button>
                          )}
                          
                          {c.status !== "Solved" && c.assignedTo && (
                            <button
                              onClick={() => openCompleteModal(c._id)}
                              className="p-2.5 text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200 hover:scale-110 group relative"
                              title="Complete Case"
                            >
                              <FaCheckCircle />
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                Complete Case
                              </div>
                            </button>
                          )}
                          
                          {c.status === "Solved" && !hasPaymentDetails && (
                            <button
                              onClick={() => {
                                setPaymentCaseId(c._id);
                                setTotalAmount(c.totalAmount || "");
                                setAdvanceAmount(c.advanceAmount || "");
                                setShowPaymentModal(true);
                              }}
                              className="p-2.5 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-110 group relative"
                              title="Add Payment Details"
                            >
                              <FaMoneyBillWave />
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                Add Payment
                              </div>
                            </button>
                          )}
                          
                          <button
                            onClick={() => openEditCustomerModal(c)}
                            className="p-2.5 text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200 hover:scale-110 group relative"
                            title="Edit Customer"
                          >
                            <FaEdit />
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                              Edit Customer
                            </div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {/* Call Outcome Modal */}
      <Modal 
        isOpen={showCallOutcomeModal} 
        onClose={() => setShowCallOutcomeModal(false)} 
        title="Call Outcome"
        size="md"
      >
        <div className="space-y-6">
          <p className="text-gray-700 text-center">What was the outcome of the call?</p>
          
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => handleCallOutcome("success")}
              className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg font-semibold"
            >
              Successful
            </button>
            
            <button 
              onClick={() => handleCallOutcome("callback")}
              className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg font-semibold"
            >
              Call Back Needed
            </button>
            
            <button 
              onClick={() => handleCallOutcome("notreachable")}
              className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg font-semibold"
            >
              Not Reachable
            </button>
          </div>
        </div>
      </Modal>

      {/* Call Modal */}
      <Modal 
        isOpen={showCallModal} 
        onClose={() => setShowCallModal(false)} 
        title="Log Call Response"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Update Status</label>
            <select
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
              value={callStatus}
              onChange={(e) => setCallStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Solved">Solved</option>
              <option value="Call Back">Call Back</option>
              <option value="Not Reachable">Not Reachable</option>
            </select>
          </div>
          
          <TextAreaField
            label="Call Response"
            name="callResponse"
            value={callResponse}
            onChange={(e) => setCallResponse(e.target.value)}
            placeholder="Enter details of the call response..."
            required
            rows={4}
          />
          
          {callStatus === "Call Back" && (
            <InputField
              label="Next Call Date"
              name="nextCallDate"
              type="datetime-local"
              value={nextCallDate}
              onChange={(e) => setNextCallDate(e.target.value)}
            />
          )}
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button 
              onClick={() => setShowCallModal(false)} 
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
            <button 
              onClick={saveCallResponse} 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg font-semibold"
            >
              Save Call Response
            </button>
          </div>
        </div>
      </Modal>

      {/* Call History Modal */}
      <Modal 
        isOpen={showCallHistory} 
        onClose={() => setShowCallHistory(false)} 
        title="Call History"
        size="lg"
      >
        <div className="space-y-4">
          {callHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaHistory className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500">No call history found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {callHistory.map((call, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{call.response}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[call.status] || "bg-gray-100"}`}>
                          {call.status}
                        </span>
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(call.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {call.nextCallDate && (
                    <p className="text-sm text-blue-600 mt-2 flex items-center">
                      <FaClock className="mr-1" />
                      Next call: {new Date(call.nextCallDate).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal 
        isOpen={showAssignModal} 
        onClose={() => setShowAssignModal(false)} 
        title="Assign Officer"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Officer</label>
            <select
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
            >
              <option value="">Select Officer</option>
              {availableOfficers.map((o) => (
                <option key={o._id} value={o._id}>{o.username}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Case Type</label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="caseType"
                  value="normal"
                  checked={caseType === "normal"}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                Normal Case
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="caseType"
                  value="cibil"
                  checked={caseType === "cibil"}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                CIBIL Case
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Total Amount (₹)"
              name="totalAmount"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Enter total amount"
            />
            
            <InputField
              label="Advance Amount (₹)"
              name="advanceAmount"
              type="number"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              placeholder="Enter advance amount"
            />
          </div>
          
          {totalAmount && advanceAmount && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm font-semibold text-gray-700">Pending Amount: ₹{parseFloat(totalAmount - advanceAmount).toFixed(2)}</p>
            </div>
          )}
          
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Proof</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handlePaymentProofChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="text-xs text-gray-500 mt-2">Upload proof of payment (JPG, PNG, or PDF)</p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button 
              onClick={() => setShowAssignModal(false)} 
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
            <button 
              onClick={assignOfficer} 
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg font-semibold"
            >
              Assign Officer
            </button>
          </div>
        </div>
      </Modal>

      {/* Complete Modal */}
      <Modal 
        isOpen={showCompleteModal} 
        onClose={() => setShowCompleteModal(false)} 
        title="Complete Case"
      >
        <div className="space-y-6">
          <InputField
            label="CIBIL Score Before"
            name="cibilBefore"
            type="number"
            value={cibilBefore}
            onChange={(e) => setCibilBefore(e.target.value)}
            placeholder="Enter CIBIL score before resolution"
            required
          />
          
          <InputField
            label="CIBIL Score After"
            name="cibilAfter"
            type="number"
            value={cibilAfter}
            onChange={(e) => setCibilAfter(e.target.value)}
            placeholder="Enter CIBIL score after resolution"
            required
          />
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button 
              onClick={() => setShowCompleteModal(false)} 
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
            <button 
              onClick={completeCase} 
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg font-semibold"
            >
              Complete Case
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        title="Add Payment Details"
      >
        <div className="space-y-6">
          <InputField
            label="Total Amount (₹)"
            name="totalAmount"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="Enter total amount"
            required
          />
          
          <InputField
            label="Advance Amount (₹)"
            name="advanceAmount"
            type="number"
            value={advanceAmount}
            onChange={(e) => setAdvanceAmount(e.target.value)}
            placeholder="Enter advance amount"
            required
          />
          
          {totalAmount && advanceAmount && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm font-semibold text-gray-700">Pending Amount: ₹{parseFloat(totalAmount - advanceAmount).toFixed(2)}</p>
            </div>
          )}
          
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Proof</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handlePaymentProofChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="text-xs text-gray-500 mt-2">Upload proof of payment (JPG, PNG, or PDF)</p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button 
              onClick={() => setShowPaymentModal(false)} 
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
            <button 
              onClick={submitPayment} 
              disabled={uploading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? "Processing..." : "Save Payment Details"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Edit Case Details"
        size="lg"
      >
        {editCase && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Customer Name"
              name="name"
              value={editCase.name}
              onChange={handleEditChange}
              placeholder="Customer Name"
            />
            
            <InputField
              label="Phone"
              name="phone"
              value={editCase.phone}
              onChange={handleEditChange}
              placeholder="Phone"
            />
            
            <InputField
              label="Email"
              name="email"
              value={editCase.email}
              onChange={handleEditChange}
              placeholder="Email"
            />
            
            <InputField
              label="Problem"
              name="problem"
              value={editCase.problem}
              onChange={handleEditChange}
              placeholder="Problem"
            />
            
            <InputField
              label="Bank"
              name="bank"
              value={editCase.bank}
              onChange={handleEditChange}
              placeholder="Bank"
            />
            
            <InputField
              label="Loan Type"
              name="loanType"
              value={editCase.loanType}
              onChange={handleEditChange}
              placeholder="Loan Type"
            />
            
            <InputField
              label="Amount"
              name="amount"
              type="number"
              value={editCase.amount || ""}
              onChange={handleEditChange}
              placeholder="Amount"
            />
            
            <InputField
              label="CIBIL Before"
              name="cibilBefore"
              type="number"
              value={editCase.cibilBefore || ""}
              onChange={handleEditChange}
              placeholder="CIBIL Before"
            />
            
            <InputField
              label="CIBIL After"
              name="cibilAfter"
              type="number"
              value={editCase.cibilAfter || ""}
              onChange={handleEditChange}
              placeholder="CIBIL After"
            />
            
            <div className="md:col-span-2 flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={saveEditedCase} 
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal 
        isOpen={!!selectedCase} 
        onClose={() => setSelectedCase(null)} 
        title="Case Details"
        size="xl"
      >
        {selectedCase && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{selectedCase.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{selectedCase.phone || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{selectedCase.email || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedCase.status]}`}>
                  {selectedCase.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600">Problem</p>
                <p className="font-medium">{selectedCase.problem}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Case ID</p>
                <p className="font-medium">{selectedCase.caseId || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className="font-medium">{selectedCase.priority || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Page Number</p>
                <p className="font-medium">{selectedCase.pageNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telecaller Name</p>
                <p className="font-medium">{selectedCase.telecallerName || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telecaller ID</p>
                <p className="font-medium">{selectedCase.telecallerId || "-"}</p>
              </div>
            </div>
        
            {/* Payment Details Section */}
            {(selectedCase.totalAmount || selectedCase.advanceAmount) && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FaMoneyBillWave className="mr-2" /> Total Payment Details
                </h4>
                <table className="min-w-full bg-white border border-gray-300 rounded-xl overflow-hidden">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium bg-gray-50">Total Amount</td>
                      <td className="py-3 px-4">₹{selectedCase.totalAmount || "0"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium bg-gray-50">Advance Paid</td>
                      <td className="py-3 px-4">₹{selectedCase.advanceAmount || "0"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Pending Amount</td>
                      <td className="py-3 px-4">
                        {paymentStatus === "completed"
                          ? "₹0.00"
                          : `₹${((selectedCase.totalAmount || 0) - (selectedCase.advanceAmount || 0)).toFixed(2)}`}
                      </td>
                    </tr>
                   <tr>
    <td className="py-3 px-4 font-medium bg-gray-50">Agent Payment Status</td>
    <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
            <select
                value={agentPaymentStatus}
                onChange={e => setAgentPaymentStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="partial">Partial</option>
            </select>
            <button
                onClick={() => updateAgentPaymentStatus(selectedCase._id)}
                className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                title="Save Agent Payment Status"
                disabled={agentPaymentStatus === selectedCase.agentPaymentStatus}
            >
                <FaCheck />
            </button>
        </div>
    </td>
</tr>
                    {selectedCase.documents?.paymentProof && (
                      <tr>
                        <td className="py-3 px-4 font-medium bg-gray-50">Payment Proof</td>
                        <td className="py-3 px-4">
                          <DocumentPreview label="Total Payment Proof" url={selectedCase.documents.paymentProof} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Agent Payment Details Section */}
            {(selectedCase.agentTotalAmount || selectedCase.agentAdvanceAmount) && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FaUserPlus className="mr-2" /> Agent Payment Details
                </h4>
                <table className="min-w-full bg-white border border-gray-300 rounded-xl overflow-hidden">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium bg-gray-50">Agent Total Amount</td>
                      <td className="py-3 px-4">₹{selectedCase.agentTotalAmount || "0"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium bg-gray-50">Agent Advance Paid</td>
                      <td className="py-3 px-4">₹{selectedCase.agentAdvanceAmount || "0"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Agent Pending Amount</td>
                      <td className="py-3 px-4">
                        {agentPaymentStatus === "completed"
                          ? "₹0.00"
                          : `₹${((selectedCase.agentTotalAmount || 0) - (selectedCase.agentAdvanceAmount || 0)).toFixed(2)}`}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Agent Payment Status</td>
                      <td className="py-3 px-4">
                        <select
                          value={agentPaymentStatus}
                          onChange={e => setAgentPaymentStatus(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="partial">Partial</option>
                        </select>
                      </td>
                    </tr>
                    {selectedCase.documents?.agentPaymentProof && (
                      <tr>
                        <td className="py-3 px-4 font-medium bg-gray-50">Agent Payment Proof</td>
                        <td className="py-3 px-4">
                          <DocumentPreview label="Agent Payment Proof" url={selectedCase.documents.agentPaymentProof} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Banking Details Table */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Banking Details</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[50px]">S.No</th>
                      <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Bank Name</th>
                      <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Account Number</th>
                      <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Loan Type</th>
                      <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">Issues</th>
                      <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Status</th>
                      <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[80px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.keys(selectedCase.bankDetails || {}).length > 0 ? (
                      Object.entries(selectedCase.bankDetails).map(([bank, bankDetail], index) => {
                        const bankStatus = bankDetail.status || "Pending";
                        
                        return (
                          <tr key={bank} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">{index + 1}</td>
                            <td className="py-3 px-4 font-medium">{bank}</td>
                            <td className="py-3 px-4">{bankDetail.accountNumber || 'N/A'}</td>
                            <td className="py-3 px-4">{bankDetail.loanType || 'N/A'}</td>
                            <td className="py-3 px-4 text-xs">
                              {bankDetail.issues && bankDetail.issues.length > 0
                                ? bankDetail.issues.join(", ")
                                : "No issues reported"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${bankStatusColors[bankStatus] || "bg-gray-100"}`}>
                                {bankStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                {bankStatusUpdate.bankIndex === index ? (
                                  <div className="flex space-x-1">
                                    <select
                                      value={bankStatusUpdate.status}
                                      onChange={(e) => setBankStatusUpdate({...bankStatusUpdate, status: e.target.value})}
                                      className="text-xs border rounded-lg p-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Completed">Completed</option>
                                      <option value="On Hold">On Hold</option>
                                    </select>
                                    <button
                                      onClick={() => updateBankStatus(selectedCase._id, bank, bankStatusUpdate.status)}
                                      className="text-green-600 hover:text-green-800 transition-colors p-1"
                                      title="Save Status"
                                    >
                                      <FaCheck />
                                    </button>
                                    <button
                                      onClick={() => setBankStatusUpdate({ bankIndex: null, status: "" })}
                                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                                      title="Cancel"
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setBankStatusUpdate({ bankIndex: index, status: bankStatus })}
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                    title="Update Status"
                                  >
                                    <FaEdit />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="py-4 px-4 text-center text-gray-500" colSpan="7">
                          No banking details available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Issues Section */}
            {selectedCase.issuesReported && selectedCase.issuesReported.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Reported Issues</h4>
                <ul className="list-disc pl-5 space-y-2">
                  {selectedCase.issuesReported.map((issue, index) => (
                    <li key={index} className="text-sm text-gray-700">{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Documents Section */}
            {selectedCase.documents && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>
            )}

            {/* Notes Section */}
            {selectedCase.notes && selectedCase.notes.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Notes</h4>
                <div className="space-y-3">
                  {selectedCase.notes.map((note, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-700">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.addedAt).toLocaleString()}
                        {note.addedBy && ` • By ${note.addedBy}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Dedicated Add Customer Modal */}
      {showCustomerModal && (
        <AddCustomer
          isOpen={showCustomerModal}
          onClose={handleCustomerModalClose}
          prefill={editingCustomer || {}} 
          notify={showNotification}
          onSave={handleCustomerSave} 
          isEditMode={!!editingCustomer}
        />
      )}

      {/* Dedicated Edit Customer Modal */}
      {showEditCustomerModal && editCustomerId && (
        <EditCustomer
          isOpen={showEditCustomerModal}
          onClose={handleEditCustomerModalClose}
          notify={showNotification}
          customerId={editCustomerId}
        />
      )}

      {/* Add custom animations to global CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AssignedCases;