import React, { useState, useEffect } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://crm-backend-k8of.onrender.com/api";

const statusColors = {
  Pending: "bg-red-200 text-red-800",
  Completed: "bg-green-200 text-green-800",
  Rejected: "bg-yellow-200 text-yellow-800",
};

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addLeadModal, setAddLeadModal] = useState(false);

  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    issueType: "",
    village: "",
    status: "Pending",
  });

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/followups`);
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) {
      alert("Please enter Name and Phone");
      return;
    }

    try {
      // Automatically set the current time
      const leadToSave = {
        ...newLead,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const res = await fetch(`${API_BASE_URL}/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadToSave),
      });
      if (!res.ok) throw new Error("Failed to add lead");
      const savedLead = await res.json();
      setLeads((prev) => [savedLead, ...prev]);
      setNewLead({
        name: "",
        phone: "",
        issueType: "",
        village: "",
        status: "Pending",
      });
      setAddLeadModal(false);
    } catch (err) {
      alert(`Error adding lead: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Leads / Follow-ups</h2>
        <button
          onClick={() => setAddLeadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Lead
        </button>
      </div>

      {loading && <p>Loading leads...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {["Time", "Name", "Phone", "Issue Type", "Village", "Status"].map((h) => (
                <th key={h} className="border border-gray-300 px-4 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{lead.time}</td>
                  <td className="border border-gray-300 px-4 py-2">{lead.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{lead.phone}</td>
                  <td className="border border-gray-300 px-4 py-2">{lead.issueType || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">{lead.village || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        statusColors[lead.status] || "bg-gray-300 text-gray-800"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {addLeadModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setAddLeadModal(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Add New Lead</h3>
            <div className="space-y-4">
              <input
                name="name"
                placeholder="Name"
                value={newLead.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                name="phone"
                placeholder="Phone"
                value={newLead.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                name="issueType"
                placeholder="Issue Type"
                value={newLead.issueType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                name="village"
                placeholder="Village"
                value={newLead.village}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <select
                name="status"
                value={newLead.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setAddLeadModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLead}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Add Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
