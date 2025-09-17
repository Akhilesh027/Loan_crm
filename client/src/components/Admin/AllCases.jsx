import React, { useState, useEffect } from "react";
import { FaEye, FaUserPlus, FaCheckCircle, FaEdit, FaTimes, FaTrash } from "react-icons/fa";

const statusColors = {
  Solved: "bg-green-100 text-green-800 border border-green-300",
  "In Progress": "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Pending: "bg-red-100 text-red-800 border border-red-300",
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
          src={`https://crm-backend-k8of.onrender.com/uploads/${url}`}
          alt={`${label} Document`}
          className="w-full max-w-sm border rounded shadow-sm"
        />
      ) : isPdf ? (
        <iframe
          src={`https://crm-backend-k8of.onrender.com/uploads/${url}`}
          title={label}
          className="w-full h-48 border rounded shadow-sm"
        />
      ) : (
        <a
          href={`https://crm-backend-k8of.onrender.com/uploads/${url}`}
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [casesResponse, agentsResponse] = await Promise.all([
        fetch("https://crm-backend-k8of.onrender.com/api/customers"),
        fetch("https://crm-backend-k8of.onrender.com/api/users/role?role=agent")
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

  // ----- Assign Officer -----
  const openAssignModal = (caseId) => {
    setAssignCaseId(caseId);
    const c = cases.find((c) => c._id === caseId);
    setSelectedOfficer(c.assignedTo || "");
    setEditCase({ ...c });
    setShowAssignModal(true);
  };

  const assignOfficer = async () => {
    if (!selectedOfficer) {
      setError("Please select an officer");
      return;
    }
    
    if (!editCase.amount) {
      setError("Please enter amount before assigning");
      return;
    }

    try {
      const response = await fetch(
        `https://crm-backend-k8of.onrender.com/api/customers/${assignCaseId}/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: selectedOfficer,
            amount: editCase.amount,
          }),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to assign case");

      setCases((prev) =>
        prev.map((c) =>
          c._id === assignCaseId ? { ...data.customer, amount: editCase.amount } : c
        )
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
        `https://crm-backend-k8of.onrender.com/api/customers/${completeCaseId}/complete`,
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
        `https://crm-backend-k8of.onrender.com/api/customers/${editCase._id}/update`,
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
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              title="Complete Case"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                          
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"
                            title="Edit Case"
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
      {/* Assign Modal */}
      <Modal 
        isOpen={showAssignModal} 
        onClose={() => setShowAssignModal(false)} 
        title="Assign Officer"
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
          
          <InputField
            label="Amount"
            name="amount"
            type="number"
            value={editCase?.amount || ""}
            onChange={(e) => setEditCase({...editCase, amount: e.target.value})}
            placeholder="Enter amount"
            required
          />
          
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Complete Case
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
        size="lg"
      >
        {selectedCase && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-sm text-gray-600">Bank</p>
                <p className="font-medium">{selectedCase.bank || "-"}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Loan Type</p>
                <p className="font-medium">{selectedCase.loanType || "-"}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium">{selectedCase.amount ? `₹${selectedCase.amount}` : "-"}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">CIBIL Before</p>
                <p className="font-medium">{selectedCase.cibilBefore || "-"}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">CIBIL After</p>
                <p className="font-medium">{selectedCase.cibilAfter || "-"}</p>
              </div>
            </div>
            
            {selectedCase.documents && selectedCase.documents.length > 0 && (
              <div className="pt-4">
                <h4 className="font-medium text-gray-700 mb-2">Documents</h4>
                <div className="space-y-4">
                  {selectedCase.documents.map((doc, i) => (
                    <DocumentPreview key={i} label={`Document ${i+1}`} url={doc} />
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