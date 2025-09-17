import React, { useState, useEffect } from "react";

const CaseOffers = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState("");
  const [dealAmount, setDealAmount] = useState(25000);
  const [advancePaid, setAdvancePaid] = useState(10000);
  const [caseStatus, setCaseStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [offers, setOffers] = useState([]);
  const [assignedCases, setAssignedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
const [paymentProof, setPaymentProof] = useState(null);

// Handle file selection
const handleFileChange = (e) => {
  setPaymentProof(e.target.files[0]);
};

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  // Fetch assigned cases and offers from backend
  useEffect(() => {
    fetchAssignedCases();
    fetchOffers();
  }, []);

  const fetchAssignedCases = async () => {
    try {
      const response = await fetch(`https://crm-backend-k8of.onrender.com/api/customers/assigned/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cases: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.cases)) {
        setAssignedCases(data.cases);
      } else {
        throw new Error(data.error || "Failed to fetch cases");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching assigned cases:", err);
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://crm-backend-k8of.onrender.com/api/offers/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch offers: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.offers)) {
        setOffers(data.offers);
      } else {
        throw new Error(data.error || "Failed to fetch offers");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

const handleSubmitOffer = async (e) => {
  e.preventDefault();
  
  if (!selectedCase) {
    setError("Please select a case");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("caseId", selectedCase);
    formData.append("dealAmount", dealAmount);
    formData.append("advancePaid", advancePaid);
    formData.append("pendingAmount", dealAmount - advancePaid);
    formData.append("caseStatus", caseStatus);
    formData.append("paymentStatus", paymentStatus);
    formData.append("agentId", userId);
    if (paymentProof) {
      formData.append("paymentProof", paymentProof);
    }

    const response = await fetch("https://crm-backend-k8of.onrender.com/api/offers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Send FormData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create offer");

    setSuccessMessage("Case offer created successfully!");
    setShowCreateForm(false);

    // Reset form
    setSelectedCase("");
    setDealAmount(25000);
    setAdvancePaid(10000);
    setCaseStatus("");
    setPaymentStatus("");
    setPaymentProof(null);

    // Refresh offers list
    fetchOffers();
    setTimeout(() => setSuccessMessage(""), 3000);
  } catch (err) {
    setError(err.message);
    console.error("Error creating offer:", err);
  }
};


  const updateOffer = async (offerId, updates) => {
    try {
      const response = await fetch(`https://crm-backend-k8of.onrender.com/api/offers/${offerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update offer");
      }

      setSuccessMessage("Offer updated successfully!");
      fetchOffers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      console.error("Error updating offer:", err);
    }
  };

  const deleteOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    
    try {
      const response = await fetch(`https://crm-backend-k8of.onrender.com/api/offers/${offerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete offer");
      }

      setSuccessMessage("Offer deleted successfully!");
      fetchOffers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      console.error("Error deleting offer:", err);
    }
  };

  // Calculate statistics
  const totalOffers = offers.length;
  const totalDealValue = offers.reduce((sum, offer) => sum + offer.dealAmount, 0);
  const successRate = totalOffers > 0 
    ? Math.round((offers.filter(offer => offer.caseStatus === "Completed").length / totalOffers) * 100)
    : 0;

  const pendingAmount = dealAmount - advancePaid;

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading case offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <button
            className="mt-2 text-red-700 underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p>{successMessage}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Case Offers</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 transition"
        >
          Create New Case Offer
        </button>
      </div>

      <p className="text-gray-600 mb-6">Create and manage case offers with deal amounts and payment terms</p>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Case Offer</h3>
              <button
                className="text-gray-600 text-2xl font-bold hover:text-gray-900 transition"
                onClick={() => setShowCreateForm(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitOffer}>
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Select Case *
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  required
                >
                  <option value="">Choose an assigned case</option>
                  {assignedCases.map((caseItem) => (
                    <option key={caseItem._id} value={caseItem._id}>
                      {caseItem.caseId || `CASE-${caseItem._id.slice(-4)}`} - {caseItem.name} ({caseItem.problem})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Deal Amount (₹) *
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={dealAmount}
                  onChange={(e) => setDealAmount(Number(e.target.value))}
                  required
                  min="0"
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Advance Paid (₹)
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(Number(e.target.value))}
                  min="0"
                  max={dealAmount}
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Pending Amount (₹)
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  value={pendingAmount}
                  readOnly
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Case Status
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={caseStatus}
                  onChange={(e) => setCaseStatus(e.target.value)}
                >
                  <option value="">Select case status</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block font-semibold mb-1">
                  Payment Status
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  <option value="">Select payment status</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
<div className="mb-4">
  <label className="block font-semibold mb-1">Payment Proof (Optional)</label>
  <input
    type="file"
    accept="image/*,application/pdf"
    onChange={handleFileChange}
    className="w-full"
  />
  {paymentProof && <p className="text-sm text-gray-600 mt-1">{paymentProof.name}</p>}
</div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Submit Case Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Statistics Cards */}
        <div className="bg-white rounded shadow p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Offers</h3>
          <p className="text-3xl font-bold text-indigo-600">{totalOffers}</p>
        </div>

        <div className="bg-white rounded shadow p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Deal Value</h3>
          <p className="text-3xl font-bold text-indigo-600">₹{totalDealValue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded shadow p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-indigo-600">{successRate}%</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">My Case Offers</h3>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
            {offers.length} offer{offers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg mb-2">No case offers created yet.</p>
            <p className="text-gray-400">Click "Create New Case Offer" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer._id} className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{offer.caseId?.name || "Unknown Customer"}</h4>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        offer.caseStatus === "Completed" ? "bg-green-100 text-green-800" :
                        offer.caseStatus === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {offer.caseStatus}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        offer.paymentStatus === "Complete" ? "bg-green-100 text-green-800" :
                        offer.paymentStatus === "Partial" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {offer.paymentStatus}
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-600">Deal Amount: <span className="font-semibold">₹{offer.dealAmount?.toLocaleString()}</span></p>
                      <p className="text-gray-600">Advance: <span className="font-semibold">₹{offer.advancePaid?.toLocaleString()}</span></p>
                      <p className="text-gray-600">Pending: <span className="font-semibold">₹{offer.pendingAmount?.toLocaleString()}</span></p>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Case ID: {offer.caseId?._id || "N/A"} • Offer Date: {new Date(offer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="bg-indigo-600 text-white rounded px-3 py-1 text-sm hover:bg-indigo-700 transition"
                      onClick={() => updateOffer(offer._id, { caseStatus: "Completed" })}
                    >
                      Mark Complete
                    </button>
                    <button 
                      className="bg-gray-600 text-white rounded px-3 py-1 text-sm hover:bg-gray-700 transition"
                      onClick={() => deleteOffer(offer._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseOffers;