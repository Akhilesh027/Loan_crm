import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { FaUserPlus, FaWhatsapp } from "react-icons/fa";
import AddCustomer from "./AddCustomer";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const TodaysFollowups = () => {
  const { addCallLog } = useOutletContext();
  const [followups, setFollowups] = useState([]);
  const [todaysFollowups, setTodaysFollowups] = useState([]);
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

  // Add Customer modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerPrefill, setCustomerPrefill] = useState(null);

  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCallbackTodayOrPast = (callbackTimeString) => {
    if (!callbackTimeString) return false;
    const callback = new Date(callbackTimeString);
    return callback <= new Date() || isToday(callbackTimeString);
  };

  const filterTodaysFollowups = (data) =>
    data.filter(
      (f) =>
        isToday(f.createdAt) ||
        isCallbackTodayOrPast(f.callbackTime) ||
        f.status === "Pending" ||
        f.status === "Call Back"
    );

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/followups`);
        if (!res.ok) throw new Error("Failed to fetch followups");
        const data = await res.json();
        setFollowups(data);
        setTodaysFollowups(filterTodaysFollowups(data));
      } catch (err) {
        console.error(err);
        notify("Error loading followups", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchFollowups();
  }, []);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMessage = (phone) =>
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");

  const filteredFollowups = todaysFollowups.filter(
    (f) =>
      (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
      const res = await fetch(`${API_BASE_URL}/followups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setFollowups((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status: newStatus } : f))
      );
      setTodaysFollowups((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status: newStatus } : f))
      );
      setEditingStatus(null);
      notify("Status updated successfully!");
    } catch (err) {
      console.error(err);
      notify("Error updating status", "error");
    }
  };

  const handleCallSave = async () => {
    if (!callStatus) return notify("Please select call status.", "error");
    if (callStatus === "Connected" && !callDuration.trim())
      return notify("Please enter call duration.", "error");
    if (callStatus === "Call Back" && !callbackTime.trim())
      return notify("Please enter callback time.", "error");

    // Convert "Connected" to "Success"
    let finalStatus = callStatus === "Connected" ? "Success" : callStatus;

    try {
      const updatedFollowup = {
        ...callingCustomer,
        response: responseText,
        status: finalStatus,
        callbackTime: callStatus === "Call Back" ? callbackTime : "",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Update followup on backend
      await fetch(`${API_BASE_URL}/followups/${callingCustomer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFollowup),
      });

      // Update state
      setFollowups((prev) =>
        prev.map((f) => (f._id === callingCustomer._id ? updatedFollowup : f))
      );
      setTodaysFollowups((prev) =>
        prev.map((f) => (f._id === callingCustomer._id ? updatedFollowup : f))
      );

      // Save call log
      await fetch(`${API_BASE_URL}/calllogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time: updatedFollowup.time,
          customer: callingCustomer.name,
          phone: callingCustomer.phone,
          duration: finalStatus === "Success" ? callDuration : "",
          status: finalStatus,
          response: responseText,
          callbackTime: finalStatus === "Call Back" ? callbackTime : "",
        }),
      });

      // Clear call modal
      setCallingCustomer(null);
      setCallStatus("");
      setCallDuration("");
      setResponseText("");
      setCallbackTime("");

      notify("Call info saved successfully!");
    } catch (err) {
      console.error(err);
      notify("Error saving call info", "error");
    }
  };

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone)
      return notify("Name and phone are required.", "error");
    try {
      const lead = {
        ...newLead,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: new Date().toISOString(),
        response: "",
      };
      const res = await fetch(`${API_BASE_URL}/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error("Failed to add lead");
      const savedLead = await res.json();
      setFollowups((prev) => [savedLead, ...prev]);
      setTodaysFollowups((prev) => [savedLead, ...prev]);
      setNewLead({
        name: "",
        phone: "",
        issueType: "",
        village: "",
        status: "Pending",
      });
      setAddLeadModal(false);
      notify("New lead added successfully!");
    } catch (err) {
      console.error(err);
      notify("Error adding new lead", "error");
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      Success: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Rejected: "bg-red-100 text-red-800",
      "Call Back": "bg-blue-100 text-blue-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          classes[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateString) =>
    !dateString
      ? "-"
      : new Date(dateString).toLocaleString([], {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-50 rounded-lg shadow-md max-w-full overflow-x-auto relative">
      {notification && (
        <div
          className={`fixed top-5 right-5 p-2 sm:p-4 rounded shadow text-white ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          } z-50 text-xs sm:text-base`}
          role="alert"
        >
          {notification.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Today's Follow-ups</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-gray-600">
            Showing {filteredFollowups.length} of {todaysFollowups.length} today's followups
          </span>
          <button
            onClick={() => setAddLeadModal(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center text-xs sm:text-sm"
          >
            Add Lead
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-[700px] w-full text-xs sm:text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-[10px] sm:text-xs md:text-sm">
            <tr>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">Time</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">Name</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">Mobile</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">Response</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">Issue Type</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">Village</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">Status</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">Callback</th>
           
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredFollowups.length ? (
              filteredFollowups.map((f) => (
                <tr key={f._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-2 px-2 sm:py-3 sm:px-4">{f.time}</td>
                  <td className="py-2 px-2 sm:py-3 sm:px-4">{f.name}</td>
                  <td className="py-2 px-2 sm:py-3 sm:px-4">{f.phone}</td>
                  <td className="py-2 px-2 sm:py-3 sm:px-4">{f.response || "-"}</td>
                  <td className="py-2 px-2 sm:py-3 sm:px-4">{f.issueType}</td>
                  <td className="py-2 px-2 sm:py-3 sm:px-4">{f.village}</td>
                <td className="py-3 px-6">
                                      {editingStatus === f._id ? (
                                        <select
                                          value={f.status || "Pending"}
                                          onChange={(e) =>
                                            handleStatusChange(f._id, e.target.value)
                                          }
                                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                                          onBlur={() => setEditingStatus(null)}
                                          autoFocus
                                        >
                                          <option value="Pending">Pending</option>
                                          <option value="Success">Success</option>
                                          <option value="Rejected">Rejected</option>
                                          <option value="Call Back">Call Back</option>
                                        </select>
                                      ) : (
                                        <div
                                          className="cursor-pointer"
                                          onClick={() => setEditingStatus(f._id)}
                                        >
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
                                          <FaWhatsapp size={17} />
                                        </button>
                                        {/* Show Add Customer only if status is Success */}
                                        {f.status === "Success" && (
                                          <button
                                            onClick={() => {
                                              setShowCustomerModal(true);
                                              setCustomerPrefill({
                                                name: f.name,
                                                phone: f.phone,
                                                issueType: f.issueType || "",
                                                village: f.village || "",
                                                leadId: f._id,
                                              });
                                            }}
                                            className="text-purple-600 hover:text-purple-800"
                                            title="Add Customer"
                                          >
                                            <FaUserPlus size={18} />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-4 text-gray-500">
                  No follow-ups found for today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Call Feedback Modal */}
      {callingCustomer && !callInProgress && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setCallingCustomer(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              Call Feedback: {callingCustomer.name}
            </h3>

            <div className="mb-4">
              <label className="font-semibold block mb-1">Call Status</label>
              <select
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select status</option>
                <option value="Success">Success</option>
                <option value="Not Connected">Not Connected</option>
                <option value="Not Responded">Not Responded</option>
                <option value="Call Back">Call Back</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {callStatus === "Call Back" && (
              <div className="mb-4">
                <label className="font-semibold block mb-1">
                  Callback Date & Time
                </label>
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

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <AddCustomer
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          prefill={customerPrefill}
          notify={notify}
        />
      )}

      {/* Add Lead Modal */}
      {addLeadModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3">Add New Lead</h3>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Name"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2"
              />
              <input
                type="text"
                placeholder="Phone"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2"
              />
              <input
                type="text"
                placeholder="Issue Type"
                value={newLead.issueType}
                onChange={(e) => setNewLead({ ...newLead, issueType: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2"
              />
              <input
                type="text"
                placeholder="Village"
                value={newLead.village}
                onChange={(e) => setNewLead({ ...newLead, village: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setAddLeadModal(false)}
                className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLead}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
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

export default TodaysFollowups;
