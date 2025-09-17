import React, { useState, useEffect } from "react";

const statusColors = {
  Solved: "bg-green-200 text-green-800",
  "In Progress": "bg-yellow-200 text-yellow-800",
  "Customer Pending": "bg-orange-200 text-orange-800",
  "Agent Pending": "bg-blue-200 text-blue-800",
  "Admin Pending": "bg-red-200 text-red-800",
};

// Utility to calculate days since assigned
const calculateDaysCount = (dateStr) => {
  if (!dateStr) return 0;
  const assignedDate = new Date(dateStr);
  const today = new Date();
  assignedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today - assignedDate) / (1000 * 60 * 60 * 24)));
};

// Component to render image or PDF documents
const DocumentPreview = ({ label, url }) => {
  if (!url) return <p className="italic text-gray-500 mb-3">No {label} uploaded</p>;

  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);

  return (
    <div className="mb-4">
      <p className="font-semibold mb-1">{label}</p>
      {isImage ? (
        <img src={`https://crm-backend-k8of.onrender.com/uploads/${url}`} alt={label} className="w-full max-w-sm border rounded" />
      ) : isPdf ? (
        <iframe src={url} title={label} className="w-full h-48 border rounded" />
      ) : (
        <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600 underline">
          View {label}
        </a>
      )}
    </div>
  );
};

const AssignedCases = () => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [cibilBefore, setCibilBefore] = useState("");
  const [cibilAfter, setCibilAfter] = useState("");
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const userId = localStorage.getItem("userId");

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

  const fetchAssignedCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

      const res = await fetch(`https://crm-backend-k8of.onrender.com/api/customers/assigned/${userId}`, {
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
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
    if (!cibilBefore || !cibilAfter) return alert("Please enter both previous and current CIBIL scores.");
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

      const res = await fetch(`https://crm-backend-k8of.onrender.com/api/customers/${activeCaseId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cibilBefore, cibilAfter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete case.");

      await fetchAssignedCases();
      closeCompleteModal();
      if (selectedCase && selectedCase._id === activeCaseId) setSelectedCase(null);
      alert("Case marked as completed!");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading assigned cases...</div>;
  if (error)
    return (
      <div className="p-6">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button onClick={fetchAssignedCases} className="bg-indigo-600 text-white px-4 py-2 rounded mr-2">
          Retry
        </button>
        <button onClick={handleLogout} className="bg-gray-600 text-white px-4 py-2 rounded">
          Login
        </button>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6 items-center">
        {userInfo && (
          <div>
            <h2 className="text-2xl font-semibold">Welcome, {userInfo.name}</h2>
            <p className="text-gray-600">Role: {userInfo.role}</p>
          </div>
        )}
        <div className="space-x-2">
          <button onClick={fetchAssignedCases} className="bg-indigo-600 text-white px-4 py-2 rounded">
            Refresh
          </button>
          <button onClick={handleLogout} className="bg-gray-600 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6">
        <h2 className="text-2xl font-semibold mb-4">My Assigned Cases ({cases.length})</h2>

        {cases.length === 0 ? (
          <p className="text-gray-500 text-center">No cases assigned yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-gray-700">
              <thead className="bg-gray-100">
                <tr>
                  {["Case ID", "Customer", "Problem", "Assigned Date", "Days Count", "Status", "Actions"].map((th) => (
                    <th key={th} className="py-2 px-4">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-mono">{c.caseId || `CASE-${c._id.slice(-4).toUpperCase()}`}</td>
                    <td className="py-2 px-4">{c.name}</td>
                    <td className="py-2 px-4">{c.problem}</td>
                    <td className="py-2 px-4">{c.assignedDate ? new Date(c.assignedDate).toLocaleDateString() : "N/A"}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          c.daysCount > 7 ? "bg-red-100 text-red-800" : c.daysCount > 3 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {c.daysCount} day{c.daysCount !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[c.status] || "bg-gray-300 text-gray-800"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 space-x-2">
                      <button onClick={() => setSelectedCase(c)} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
                        View
                      </button>
                      {c.status !== "Solved" && (
                        <button onClick={() => openCompleteModal(c)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={() => setSelectedCase(null)}>
          <div className="bg-white rounded shadow-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-semibold">{selectedCase.caseId || `CASE-${selectedCase._id.slice(-4).toUpperCase()}`} - Details</h3>
              <button onClick={() => setSelectedCase(null)} className="text-2xl font-bold hover:text-gray-700">&times;</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Customer Info</h4>
                <p><strong>Name:</strong> {selectedCase.name}</p>
                <p><strong>Email:</strong> {selectedCase.email || "N/A"}</p>
                <p><strong>Phone:</strong> {selectedCase.phone || "N/A"}</p>
                <p><strong>Problem:</strong> {selectedCase.problem}</p>
                <p><strong>Bank:</strong> {selectedCase.bank || "N/A"}</p>
                <p><strong>Loan Type:</strong> {selectedCase.loanType || "N/A"}</p>
                <p><strong>Assigned Date:</strong> {selectedCase.assignedDate ? new Date(selectedCase.assignedDate).toLocaleDateString() : "N/A"}</p>
                <p><strong>Days Count:</strong> {selectedCase.daysCount} day{selectedCase.daysCount !== 1 ? "s" : ""}</p>
                <p><strong>Status:</strong> {selectedCase.status}</p>
                {selectedCase.status === "Solved" && (
                  <>
                    <p><strong>Previous CIBIL:</strong> {selectedCase.cibilBefore || "N/A"}</p>
                    <p><strong>Current CIBIL:</strong> {selectedCase.cibilAfter || "N/A"}</p>
                    <p><strong>Resolved Date:</strong> {selectedCase.resolvedDate ? new Date(selectedCase.resolvedDate).toLocaleDateString() : "N/A"}</p>
                  </>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Documents</h4>
                {selectedCase.documents && Object.entries(selectedCase.documents).length > 0 ? (
                  Object.entries(selectedCase.documents).map(([docType, url]) => (
                    <DocumentPreview key={docType} label={docType} url={url} />
                  ))
                ) : (
                  <p className="text-gray-500 italic">No documents uploaded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={closeCompleteModal}>
          <div className="bg-white rounded shadow-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Mark Case as Completed</h3>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Previous CIBIL Score</label>
              <input type="number" min="300" max="900" className="w-full border rounded px-3 py-2" value={cibilBefore} onChange={(e) => setCibilBefore(e.target.value)} />
            </div>
            <div className="mb-6">
              <label className="block mb-1 font-semibold">Current CIBIL Score</label>
              <input type="number" min="300" max="900" className="w-full border rounded px-3 py-2" value={cibilAfter} onChange={(e) => setCibilAfter(e.target.value)} />
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={closeCompleteModal} className="px-4 py-2 rounded border hover:bg-gray-100">Cancel</button>
              <button onClick={handleCompleteSubmit} disabled={!cibilBefore || !cibilAfter} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedCases;
