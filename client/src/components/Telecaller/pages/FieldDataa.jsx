import React, { useState, useEffect } from "react";
import axios from "axios";

const FieldDataa= () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);

  // Call modal states
  const [callingCustomer, setCallingCustomer] = useState(null);
  const [callStatus, setCallStatus] = useState("");
  const [callDuration, setCallDuration] = useState("");
  const [responseText, setResponseText] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callInProgress, setCallInProgress] = useState(false);

  useEffect(() => {
    fetchDataList();
  }, []);

  const fetchDataList = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://crm-backend-k8of.onrender.com/api/field-data");
      setDataList(response.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">{status}</span>;
      case "Completed":
        return <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">{status}</span>;
      case "Rejected":
        return <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">{status}</span>;
      case "Call Back":
        return <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">{status}</span>;
      default:
        return <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">{status}</span>;
    }
  };

  // Handle inline status change
  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`https://crm-backend-k8of.onrender.com/api/field-data/${id}/status`, { status });
      setDataList((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status } : item))
      );
      setEditingStatus(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Call actions
  const initiateCall = (customer) => {
    setCallingCustomer(customer);
    setCallStatus("");
    setCallDuration("");
    setResponseText("");
    setCallbackTime("");
  };

  const handleCallSave = async () => {
    if (!callingCustomer) return;
    try {
      await axios.put(`https://crm-backend-k8of.onrender.com/api/field-data/${callingCustomer._id}/call`, {
        callStatus,
        callDuration,
        responseText,
        callbackTime,
      });
      fetchDataList();
      setCallingCustomer(null);
    } catch (error) {
      console.error("Error saving call data:", error);
    }
  };

  const handleMessage = (phone) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Follow-ups / Field Data</h2>

      <div className="overflow-x-auto bg-white rounded shadow p-6">
        {loading ? (
          <p className="text-center text-gray-600">Loading data...</p>
        ) : dataList.length === 0 ? (
          <p className="text-center text-gray-500">No entries found.</p>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Bank Name</th>
                <th className="border px-4 py-2 text-left">Bank Area</th>
                <th className="border px-4 py-2 text-left">Manager Name</th>
                <th className="border px-4 py-2 text-left">Manager Phone</th>
                <th className="border px-4 py-2 text-left">Manager Type</th>
                <th className="border px-4 py-2 text-left">Executive Code</th>
                <th className="border px-4 py-2 text-left">Collection Data</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{item._id}</td>
                  <td className="border px-4 py-2">{item.bankName}</td>
                  <td className="border px-4 py-2">{item.bankArea}</td>
                  <td className="border px-4 py-2">{item.managerName}</td>
                  <td className="border px-4 py-2">{item.managerPhone}</td>
                  <td className="border px-4 py-2">{item.managerType}</td>
                  <td className="border px-4 py-2">{item.executiveCode}</td>
                  <td className="border px-4 py-2">{item.collectionData || "-"}</td>
                  <td className="border px-4 py-2">
                    {editingStatus === item._id ? (
                      <select
                        value={item.status || "Pending"}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        onBlur={() => setEditingStatus(null)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                        autoFocus
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Call Back">Call Back</option>
                      </select>
                    ) : (
                      <div className="cursor-pointer" onClick={() => setEditingStatus(item._id)}>
                        {getStatusBadge(item.status || "Pending")}
                      </div>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => initiateCall(item)}
                        className="text-green-600 hover:text-green-800"
                        title="Call"
                        disabled={callInProgress}
                      >
                        📞
                      </button>
                      <button
                        onClick={() => handleMessage(item.managerPhone)}
                        className="text-green-500 hover:text-green-700"
                        title="WhatsApp"
                      >
                        💬
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Call Modal */}
      {callingCustomer && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setCallingCustomer(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Call Feedback: {callingCustomer.managerName}</h3>
            <div className="mb-4">
              <label className="font-semibold block mb-1">Call Status</label>
              <select
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select status</option>
                <option value="Connected">Connected</option>
                <option value="Not Connected">Not Connected</option>
                <option value="Not Responded">Not Responded</option>
                <option value="Call Back">Call Back</option>
              </select>
            </div>
            {callStatus === "Connected" && (
              <>
                <div className="mb-4">
                  <label className="font-semibold block mb-1">Call Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 min"
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="font-semibold block mb-1">Response</label>
                  <textarea
                    rows="3"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter response..."
                  />
                </div>
              </>
            )}
            {callStatus === "Call Back" && (
              <div className="mb-4">
                <label className="font-semibold block mb-1">Callback Date & Time</label>
                <input
                  type="datetime-local"
                  value={callbackTime}
                  onChange={(e) => setCallbackTime(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setCallingCustomer(null)}
                className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCallSave}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Save Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldDataa;
