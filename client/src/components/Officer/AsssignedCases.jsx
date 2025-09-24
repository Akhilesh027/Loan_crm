import React, { useState, useEffect } from "react";
import { FaEye, FaCheckCircle,FaUserPlus, FaEdit, FaTimes, FaMoneyBillWave, FaComments } from "react-icons/fa";

const statusColors = {
  Solved: "bg-green-100 text-green-800 border border-green-300",
  "In Progress": "bg-yellow-100 text-yellow-800 border border-yellow-300",
  "Customer Pending": "bg-orange-100 text-orange-800 border border-orange-300",
  "Agent Pending": "bg-blue-100 text-blue-800 border border-blue-300",
  "Admin Pending": "bg-red-100 text-red-800 border border-red-300",
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
  if (!url) return <p className="italic text-gray-500 mb-3">No {label} uploaded</p>;

  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);

  return (
    <div className="mb-4">
      <p className="font-semibold mb-1">{label}</p>
      {isImage ? (
        <img src={`http://localhost:5000/uploads/${url}`} alt={label} className="w-full max-w-sm border rounded shadow-sm" />
      ) : isPdf ? (
        <iframe src={`http://localhost:5000/uploads/${url}`} title={label} className="w-full h-48 border rounded shadow-sm" />
      ) : (
        <a href={`http://localhost:5000/uploads/${url}`} target="_blank" rel="noreferrer" className="text-indigo-600 underline hover:text-indigo-800">
          View {label}
        </a>
      )}
    </div>
  );
};

// A reusable generic modal component with overlay and sizing options
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">
            <FaTimes />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Basic input field with label
const InputField = ({ label, name, value, onChange, type = "text", placeholder, required = false }) => (
  <div className="mb-3">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={name}
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

// Basic textarea field
const TextAreaField = ({ label, name, value, onChange, placeholder, required = false, rows = 3 }) => (
  <div className="mb-3">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      id={name}
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

  const userId = localStorage.getItem("userId");

  // Load user info and assigned cases at mount
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setUserInfo(JSON.parse(userData));
      } catch (err) {
        console.error(err);
        setError("Failed to load user information.");
        setLoading(false);
      }
    } else {
      setError("No user information found. Please log in.");
      setLoading(false);
    }
    fetchAssignedCases();
  }, []);

  // Fetch assigned cases with auth token and store days count calculated from assignedDate
  const fetchAssignedCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

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

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "/login";
  };

  // Open Complete Case modal and preload CIBIL scores
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

  // Submit Complete Case with CIBIL before/after scores
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
      setSuccessMessage("Case marked as complete!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowCompleteModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open Request Modal
  const openRequestModal = (caseId) => {
    setRequestCaseId(caseId);
    setRequestMessage("");
    setShowRequestModal(true);
  };

  // Send chat/request message to admin
  const sendChatRequest = async () => {
    if (!requestMessage) {
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
          agentName: userInfo.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send request");

      setSuccessMessage("Request sent to admin successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowRequestModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch chat requests history for selected case
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
      setError(err.message);
    }
  };

  // Clear error and success messages
  const clearMessages = () => {
    setError(null);
    setSuccessMessage("");
  };

  // Loading state
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading cases...</div>
      </div>
    );

  // Error without cases
  if (error && !cases.length)
    return (
      <div className="p-4 max-w-full mx-auto">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 flex justify-between items-center">
          <div>Error: {error}</div>
          <button onClick={fetchAssignedCases} className="text-red-800 font-semibold">
            Retry
          </button>
          <button onClick={handleLogout} className="bg-gray-600 text-white px-4 py-2 rounded ml-2">
            Login
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-4 max-w-full mx-auto bg-gray-50 min-h-screen">
      {/* Header bar with user info and controls */}
      <div className="flex justify-between mb-6 items-center">
        {userInfo && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome, {userInfo.name}</h2>
            <p className="text-gray-600">Role: {userInfo.role}</p>
          </div>
        )}
        <div className="space-x-2">
          <button
            onClick={fetchAssignedCases}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Refresh Data
          </button>
          <button onClick={handleLogout} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
            Logout
          </button>
        </div>
      </div>

      {/* Messages display */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 flex justify-between items-center">
          <div>{error}</div>
          <button onClick={clearMessages} className="text-red-800" aria-label="Clear error">
            <FaTimes />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4 flex justify-between items-center">
          <div>{successMessage}</div>
          <button onClick={clearMessages} className="text-green-800" aria-label="Clear success">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Assigned cases table */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">My Assigned Cases ({cases.length})</h2>

        {cases.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No cases assigned yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 font-semibold text-gray-700">Case ID</th>
                  <th className="p-3 font-semibold text-gray-700">Customer Name</th>
                  <th className="p-3 font-semibold text-gray-700">Phone</th>
                  <th className="p-3 font-semibold text-gray-700">Problem</th>
                  <th className="p-3 font-semibold text-gray-700">Days Count</th>
                  <th className="p-3 font-semibold text-gray-700">Status</th>
                  <th className="p-3 font-semibold text-gray-700 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cases.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono">{c.caseId || `CASE-${c._id.slice(-4).toUpperCase()}`}</td>
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.phone || "-"}</td>
                    <td className="p-3 max-w-xs truncate">{c.problem}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.daysCount > 7
                            ? "bg-red-100 text-red-800"
                            : c.daysCount > 3
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {c.daysCount} day{c.daysCount !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[c.status] || "bg-gray-100 text-gray-800 border border-gray-300"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setSelectedCase(c)}
                          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                          title="View Details"
                          aria-label={`View details of case ${c._id}`}
                        >
                          <FaEye />
                        </button>

                        <button
                          onClick={() => openRequestModal(c._id)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                          title="Request Information"
                          aria-label={`Request information for case ${c._id}`}
                        >
                          <FaComments />
                        </button>

                        <button
                          onClick={() => fetchChatRequests(c._id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          title="View Requests"
                          aria-label={`View requests for case ${c._id}`}
                        >
                          <FaEdit />
                        </button>

                        {c.status !== "Solved" && (
                          <button
                            onClick={() => openCompleteModal(c)}
                            className="p-2 text-teal-600 hover:bg-teal-100 rounded-full transition-colors"
                            title="Complete Case"
                            aria-label={`Complete case ${c._id}`}
                          >
                            <FaCheckCircle />
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

      {/* REQUEST Modal */}
      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request Information from Admin" size="lg">
        <div className="space-y-4">
          <TextAreaField
            label="Request Message"
            name="requestMessage"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Explain what information you need from the admin..."
            required
            rows={4}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowRequestModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={sendChatRequest}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Send Request
            </button>
          </div>
        </div>
      </Modal>

      {/* REQUESTS HISTORY Modal */}
      <Modal isOpen={showRequests} onClose={() => setShowRequests(false)} title="Chat Requests History" size="lg">
        <div className="space-y-4">
          {chatRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No requests found</p>
          ) : (
            <div className="space-y-3">
              {chatRequests.map((request, index) => (
                <div key={request._id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{request.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Status:{" "}
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            request.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "Resolved"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </p>
                      {request.adminResponse && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                          <p className="text-sm font-medium text-blue-800">Admin Response:</p>
                          <p className="text-sm text-blue-700">{request.adminResponse}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{new Date(request.timestamp).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{new Date(request.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* COMPLETE CASE Modal */}
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
              onClick={closeCompleteModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteSubmit}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              Complete Case
            </button>
          </div>
        </div>
      </Modal>

      {/* VIEW CASE DETAILS Modal */}
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
               <p className="text-sm text-gray-600">Adhar number</p>
               <p className="font-medium">{selectedCase.aadhaar || "-"}</p>
             </div>
              <div>
               <p className="text-sm text-gray-600">Pan number</p>
               <p className="font-medium">{selectedCase.pan || "-"}</p>
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
    </div>
  );
};

export default AssignedCases;