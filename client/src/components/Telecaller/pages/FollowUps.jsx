import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://crm-backend-k8of.onrender.com/api";

const Followups = () => {
  const { addCallLog } = useOutletContext();
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [callingCustomer, setCallingCustomer] = useState(null);
  const [notification, setNotification] = useState(null);
  const [addLeadModal, setAddLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    issueType: "",
    village: "",
    status: "Pending",
  });

  const [callStatus, setCallStatus] = useState("");
  const [callDuration, setCallDuration] = useState("");
  const [responseText, setResponseText] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callInProgress, setCallInProgress] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);

  // Fetch today's followups
  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/followups?search=${searchTerm}`);
        if (!response.ok) throw new Error("Failed to fetch followups");
        const data = await response.json();
        setFollowups(data);
      } catch (error) {
        console.error("Error fetching followups:", error);
        notify("Error loading followups", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchFollowups();
  }, [searchTerm]);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMessage = (phone) =>
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");

  const filteredFollowups = followups.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.phone.includes(searchTerm)
  );

  const initiateCall = (customer) => {
    window.open(`tel:${customer.phone}`, "_self");
    setCallingCustomer(customer);
    setCallInProgress(true);
    notify(`Calling ${customer.name} at ${customer.phone}...`);
    setTimeout(() => {
      setCallInProgress(false);
      notify("Call completed. Please provide feedback.", "success");
    }, 3000);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/followups/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      setFollowups((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status: newStatus } : f))
      );
      setEditingStatus(null);
      notify("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      notify("Error updating status", "error");
    }
  };

  const handleCallSave = async () => {
    if (!callStatus) {
      notify("Please select call status.", "error");
      return;
    }
    if (callStatus === "Connected" && !callDuration.trim()) {
      notify("Please enter call duration.", "error");
      return;
    }
    if (callStatus === "Call Back" && !callbackTime.trim()) {
      notify("Please enter callback time.", "error");
      return;
    }

    try {
      const updateResponse = await fetch(`${API_BASE_URL}/followups/${callingCustomer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response: responseText,
          status: callStatus,
          callbackTime: callStatus === "Call Back" ? callbackTime : "",
        }),
      });
      if (!updateResponse.ok) throw new Error("Failed to update followup");

      setFollowups((prev) =>
        prev.map((f) =>
          f._id === callingCustomer._id
            ? {
                ...f,
                response: responseText,
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                status: callStatus,
                callbackTime: callStatus === "Call Back" ? callbackTime : "",
              }
            : f
        )
      );

      const callTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const callLogResponse = await fetch(`${API_BASE_URL}/calllogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time: callTime,
          customer: callingCustomer.name,
          phone: callingCustomer.phone,
          duration: callStatus === "Connected" ? callDuration : "",
          status: callStatus,
          response: responseText,
          callbackTime: callStatus === "Call Back" ? callbackTime : "",
        }),
      });
      if (!callLogResponse.ok) throw new Error("Failed to save call log");

      setCallStatus("");
      setCallDuration("");
      setResponseText("");
      setCallbackTime("");
      setCallingCustomer(null);
      notify("Call info saved successfully!");
    } catch (error) {
      console.error("Error saving call:", error);
      notify("Error saving call information", "error");
    }
  };

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) {
      notify("Name and phone are required.", "error");
      return;
    }
    try {
      const lead = {
        ...newLead,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        response: "",
      };
      const response = await fetch(`${API_BASE_URL}/followups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lead),
      });
      if (!response.ok) throw new Error("Failed to add lead");
      const savedLead = await response.json();
      setFollowups((prev) => [savedLead, ...prev]);
      setNewLead({
        name: "",
        phone: "",
        issueType: "",
        village: "",
        status: "Pending",
      });
      setAddLeadModal(false);
      notify("New lead added successfully!");
    } catch (error) {
      console.error("Error adding lead:", error);
      notify("Error adding new lead", "error");
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Completed: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Rejected: "bg-red-100 text-red-800",
      "Call Back": "bg-blue-100 text-blue-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md max-w-full overflow-x-auto relative">
      {notification && (
        <div
          className={`fixed top-5 right-5 p-4 rounded shadow text-white ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          } z-50`}
          role="alert"
        >
          {notification.msg}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Today's Follow-ups</h2>
        <button
          onClick={() => setAddLeadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
        >
          Add Lead
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading follow-ups...</p>
          </div>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Time</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Mobile</th>
                <th className="py-3 px-6 text-left">Response</th>
                <th className="py-3 px-6 text-left">Issue Type</th>
                <th className="py-3 px-6 text-left">Village</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Callback</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {filteredFollowups.length > 0 ? (
                filteredFollowups.map((f) => (
                  <tr key={f._id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6">{f.time}</td>
                    <td className="py-3 px-6">{f.name}</td>
                    <td className="py-3 px-6">{f.phone}</td>
                    <td className="py-3 px-6">{f.response || "-"}</td>
                    <td className="py-3 px-6">{f.issueType}</td>
                    <td className="py-3 px-6">{f.village}</td>
                    <td className="py-3 px-6">
                      {editingStatus === f._id ? (
                        <select
                          value={f.status || "Pending"}
                          onChange={(e) => handleStatusChange(f._id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                          onBlur={() => setEditingStatus(null)}
                          autoFocus
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Call Back">Call Back</option>
                        </select>
                      ) : (
                        <div className="cursor-pointer" onClick={() => setEditingStatus(f._id)}>
                          {getStatusBadge(f.status || "Pending")}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-6">{f.callbackTime || "-"}</td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => initiateCall(f)}
                          className="text-green-600 hover:text-green-800"
                          disabled={callInProgress}
                          title="Call"
                        >
                          📞
                        </button>
                        <button
                          onClick={() => handleMessage(f.phone)}
                          className="text-green-500 hover:text-green-700"
                          title="WhatsApp"
                        >
                          💬
                        </button>
                        <button
                          onClick={() => alert(`Send message to ${f.name}`)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Message"
                        >
                          ✉️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-500">
                    No follow-ups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Call Outcome Modal */}
      {callingCustomer && !callInProgress && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setCallingCustomer(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Call Feedback: {callingCustomer.name}</h3>

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
                    placeholder="Enter customer response..."
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
                onClick={() => {
                  setCallingCustomer(null);
                  setCallStatus("");
                  setCallDuration("");
                  setResponseText("");
                  setCallbackTime("");
                }}
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

      {/* Add Lead Modal */}
      {addLeadModal && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setAddLeadModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Add New Lead</h3>

            <div className="mb-4">
              <label className="font-semibold block mb-1">Name</label>
              <input
                type="text"
                value={newLead.name}
                onChange={(e) =>
                  setNewLead((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold block mb-1">Phone</label>
              <input
                type="text"
                value={newLead.phone}
                onChange={(e) =>
                  setNewLead((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold block mb-1">Issue Type</label>
              <input
                type="text"
                value={newLead.issueType}
                onChange={(e) =>
                  setNewLead((prev) => ({ ...prev, issueType: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold block mb-1">Village</label>
              <input
                type="text"
                value={newLead.village}
                onChange={(e) =>
                  setNewLead((prev) => ({ ...prev, village: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold block mb-1">Status</label>
              <select
                value={newLead.status}
                onChange={(e) =>
                  setNewLead((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setAddLeadModal(false)}
                className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLead}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Followups;
