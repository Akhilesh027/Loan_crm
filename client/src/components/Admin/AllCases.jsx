import React, { useState, useEffect } from "react";
import { FaEye, FaUserPlus,FaPlus, FaCheckCircle, FaEdit, FaTimes, FaTrash, FaMoneyBillWave, FaPhone, FaHistory } from "react-icons/fa";
import AddCustomer from "../Telecaller/pages/AddCustomer";
const statusColors = {
  Solved: "bg-green-100 text-green-800 border border-green-300",
  "In Progress": "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Pending: "bg-red-100 text-red-800 border border-red-300",
  "Call Back": "bg-blue-100 text-blue-800 border border-blue-300",
  "Not Reachable": "bg-gray-100 text-gray-800 border border-gray-300",
};

const DocumentPreview = ({ label, url }) => {
  if (!url) return <p className="italic text-gray-500 mb-3">No {label} uploaded</p>;

  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);

  return (
    <div className="mb-4">
      <p className="font-semibold mb-1">{label}</p>
      {isImage ? (
        <img
          src={`http://localhost:5000/uploads/${url}`}
          alt={`${label} Document`}
          className="w-full max-w-sm border rounded shadow-sm"
        />
      ) : isPdf ? (
        <iframe
          src={`http://localhost:5000/uploads/${url}`}
          title={label}
          className="w-full h-48 border rounded shadow-sm"
        />
      ) : (
        <a
          href={`http://localhost:5000/uploads/${url}`}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 underline hover:text-indigo-800"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto shadow-xl`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text", placeholder, required = false }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, required = false, rows = 3 }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

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
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // Add function to open customer modal for adding
  const openAddCustomerModal = () => {
    setEditingCustomer(null);
    setShowCustomerModal(true);
  };

  // Add function to open customer modal for editing
  const openEditCustomerModal = (customer) => {
    setEditingCustomer(customer);
    setShowCustomerModal(true);
  };

  // Add function to handle customer modal close
  const handleCustomerModalClose = () => {
    setShowCustomerModal(false);
    setEditingCustomer(null);
  };

  // Add function to handle customer save/update
  const handleCustomerSave = (savedCustomer, isNew) => {
    if (isNew) {
      // Add new customer to the cases list
      setCases(prev => [...prev, savedCustomer]);
      showNotification('Customer added successfully!');
    } else {
      // Update existing customer in the cases list
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

  // Filter cases based on status and search term
  const filteredCases = cases.filter(caseItem => {
    const matchesStatus = filterStatus === "All" || caseItem.status === filterStatus;
    const matchesSearch = caseItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         caseItem.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.problem?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // ----- Call Action -----
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

  // ----- Payment Handling -----
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
        body: formData, // multipart/form-data automatically set
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



  // ----- Assign Officer -----
  const openAssignModal = (caseId) => {
    setAssignCaseId(caseId);
    const c = cases.find((c) => c._id === caseId);
    setSelectedOfficer(c.assignedTo || "");
    setEditCase({ ...c });
    setTotalAmount(c.totalAmount || "");
    setAdvanceAmount(c.advanceAmount || "");
    setPaymentProof(null);
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
    if (paymentProof) {
      formData.append("agentPaymentProof", paymentProof);
    }

    const response = await fetch(
      `http://localhost:5000/api/customers/${assignCaseId}/assign`,
      {
        method: "POST",
        body: formData, // Content-Type is automatically set with multipart/form-data boundary
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



  // ----- Complete Case -----
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

  // ----- Edit Case -----
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
      <div className="text-xl text-gray-600">Loading cases...</div>
    </div>
  );
  
  if (error && !cases.length) return (
    <div className="p-4 max-w-full mx-auto">
      <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 flex justify-between items-center">
        <div>Error: {error}</div>
        <button onClick={fetchData} className="text-red-800 font-semibold">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Assigned Cases</h2>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 flex justify-between items-center">
          <div>{error}</div>
          <button onClick={clearMessages} className="text-red-800">
            <FaTimes />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4 flex justify-between items-center">
          <div>{successMessage}</div>
          <button onClick={clearMessages} className="text-green-800">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name, case ID or problem..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
           <button 
          onClick={openAddCustomerModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> Add Customer
        </button>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          
          <div className="flex items-end">
            <button 
              onClick={fetchData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 font-semibold text-gray-700">Case ID</th>
                <th className="p-3 font-semibold text-gray-700">Customer Name</th>
                <th className="p-3 font-semibold text-gray-700">Phone</th>
                <th className="p-3 font-semibold text-gray-700">Problem</th>
                <th className="p-3 font-semibold text-gray-700">Status</th>
                <th className="p-3 font-semibold text-gray-700">Agent</th>
                <th className="p-3 font-semibold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No cases found
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const officer = c.assignedTo && availableOfficers.find((o) => o._id === c.assignedTo);
                  const hasPaymentDetails = c.totalAmount && c.advanceAmount;
                  
                  return (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="p-3">{c.caseId || `CASE-${c._id.slice(-4).toUpperCase()}`}</td>
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3">{c.phone || "-"}</td>
                      <td className="p-3 max-w-xs truncate">{c.problem}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[c.status] || "bg-gray-100 text-gray-800 border border-gray-300"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3">{officer ? officer.username : c.assignedTo ? "Assigned" : "Unassigned"}</td>
                      <td className="p-3">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setSelectedCase(c)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          
                          <button
                            onClick={() => openCallModal(c._id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                            title="Log Call"
                          >
                            <FaPhone />
                          </button>
                           
          
                          <button
                            onClick={() => fetchCallHistory(c._id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Call History"
                          >
                            <FaHistory />
                          </button>
                          
                          {!c.assignedTo && c.status !== "Solved" && (
                            <button
                              onClick={() => openAssignModal(c._id)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                              title="Assign Officer"
                            >
                              <FaUserPlus />
                            </button>
                          )}
                          
                          {c.status !== "Solved" && c.assignedTo && (
                            <button
                              onClick={() => openCompleteModal(c._id)}
                              className="p-2 text-teal-600 hover:bg-teal-100 rounded-full transition-colors"
                              title="Complete Case"
                            >
                              <FaCheckCircle />
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
                              className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                              title="Add Payment Details"
                            >
                              <FaMoneyBillWave />
                            </button>
                          )}
                          
                          <button
            onClick={() => openEditCustomerModal(c)}
            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"
            title="Edit Customer"
          >
            <FaEdit />
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
        <div className="space-y-4">
          <p className="text-gray-700">What was the outcome of the call?</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleCallOutcome("success")}
              className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Successful
            </button>
            
            <button 
              onClick={() => handleCallOutcome("callback")}
              className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Call Back Needed
            </button>
            
            <button 
              onClick={() => handleCallOutcome("notreachable")}
              className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors col-span-2"
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              onClick={() => setShowCallModal(false)} 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={saveCallResponse} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
            <p className="text-gray-500 text-center py-4">No call history found</p>
          ) : (
            <div className="space-y-3">
              {callHistory.map((call, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{call.response}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Status: <span className={`px-2 py-1 rounded-full text-xs ${statusColors[call.status] || "bg-gray-100"}`}>
                          {call.status}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(call.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {call.nextCallDate && (
                    <p className="text-sm text-blue-600 mt-2">
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Officer</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
            >
              <option value="">Select Officer</option>
              {availableOfficers.map((o) => (
                <option key={o._id} value={o._id}>{o.username}</option>
              ))}
            </select>
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
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium">Pending Amount: ₹{parseFloat(totalAmount - advanceAmount).toFixed(2)}</p>
            </div>
          )}
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Proof</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handlePaymentProofChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Upload proof of payment (JPG, PNG, or PDF)</p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              onClick={() => setShowAssignModal(false)} 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={assignOfficer} 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
        <div className="space-y-4">
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
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              onClick={() => setShowCompleteModal(false)} 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={completeCase} 
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
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
        <div className="space-y-4">
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
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium">Pending Amount: ₹{parseFloat(totalAmount - advanceAmount).toFixed(2)}</p>
            </div>
          )}
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Proof</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handlePaymentProofChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Upload proof of payment (JPG, PNG, or PDF)</p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              onClick={() => setShowPaymentModal(false)} 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={submitPayment} 
              disabled={uploading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
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
            
            <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveEditedCase} 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
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
          <p className="text-sm text-gray-600">pageNumber</p>
          <p className="font-medium">{selectedCase.pageNumber || "-"}</p>
        </div>
        {/* Telecaller Details */}
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
          <table className="min-w-full bg-white border border-gray-300 rounded-md">
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Total Amount</td>
                <td className="py-2 px-4">₹{selectedCase.totalAmount || "0"}</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="py-2 px-4 font-medium">Advance Paid</td>
                <td className="py-2 px-4">₹{selectedCase.advanceAmount || "0"}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium">Pending Amount</td>
                <td className="py-2 px-4">
                  ₹{((selectedCase.totalAmount || 0) - (selectedCase.advanceAmount || 0)).toFixed(2)}
                </td>
              </tr>
              {selectedCase.paymentProof && (
                <tr>
                  <td className="py-2 px-4 font-medium">Payment Proof</td>
                  <td className="py-2 px-4">
                    <DocumentPreview label="Total Payment Proof" url={selectedCase.paymentProof} />
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
          <table className="min-w-full bg-white border border-gray-300 rounded-md">
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Agent Total Amount</td>
                <td className="py-2 px-4">₹{selectedCase.agentTotalAmount || "0"}</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="py-2 px-4 font-medium">Agent Advance Paid</td>
                <td className="py-2 px-4">₹{selectedCase.agentAdvanceAmount || "0"}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium">Agent Pending Amount</td>
                <td className="py-2 px-4">
                  ₹{((selectedCase.agentTotalAmount || 0) - (selectedCase.agentAdvanceAmount || 0)).toFixed(2)}
                </td>
              </tr>
              {selectedCase.agentPaymentProof && (
                <tr>
                  <td className="py-2 px-4 font-medium">Agent Payment Proof</td>
                  <td className="py-2 px-4">
                    <DocumentPreview label="Agent Payment Proof" url={selectedCase.agentPaymentProof} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Banking Details Table with Loan Type and Issues */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-3">Banking Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Name</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {selectedCase.banks && selectedCase.banks.length > 0 ? (
                selectedCase.banks.map((bank, index) => {
                  const bankDetail = selectedCase.bankDetails?.[bank] || {};
                  return (
                    <tr key={index}>
                      <td className="py-2 px-4">{bank}</td>
                      <td className="py-2 px-4">{bankDetail.accountNumber || 'N/A'}</td>
                      <td className="py-2 px-4">{bankDetail.loanType || 'N/A'}</td>
                      <td className="py-2 px-4">
                        {bankDetail.issues && bankDetail.issues.length > 0
                          ? bankDetail.issues.join(", ")
                          : "No issues reported"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="py-2 px-4" colSpan="4">
                    No banking details available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issues Section */}
      {selectedCase.issues && selectedCase.issues.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Reported Issues</h4>
          <ul className="list-disc pl-5">
            {selectedCase.issues.map((issue, index) => (
              <li key={index} className="text-sm text-gray-700 mb-1">{issue}</li>
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
          <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
          <div className="space-y-3">
            {selectedCase.notes.map((note, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700">{note.content}</p>
                <p className="text-xs text-gray-500 mt-1">
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
    </div>
    
  );
};

export default AssignedCases;