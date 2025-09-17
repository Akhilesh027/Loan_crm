import React, { useState } from "react";

const initialRequests = [
  {
    id: 1,
    requester: "Telecaller Rahul",
    requestType: "Resource Request",
    description: "Need additional leads data for upcoming campaign.",
    priority: "High",
    status: "Pending",
    dateSubmitted: "2025-09-01",
  },
  {
    id: 2,
    requester: "Officer Meena",
    requestType: "Technical Support",
    description: "System is slow when accessing case files.",
    priority: "Medium",
    status: "In Progress",
    dateSubmitted: "2025-09-02",
  },
  {
    id: 3,
    requester: "Executive Amit",
    requestType: "Budget Approval",
    description: "Requesting budget increase for marketing expenses.",
    priority: "High",
    status: "Approved",
    dateSubmitted: "2025-09-03",
  },
];

const priorityColors = {
  High: "bg-red-500 text-white",
  Medium: "bg-yellow-400 text-black",
  Low: "bg-green-400 text-black",
};

const statusColors = {
  Pending: "bg-yellow-500",
  "In Progress": "bg-blue-500",
  Approved: "bg-green-600",
  Rejected: "bg-red-600",
};

const RequestsPage = ({ currentUser }) => {
  // Example currentUser prop: { name: 'Rahul', role: 'Telecaller' }
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [requestType, setRequestType] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requestType || !description) {
      notify("Please fill in all required fields.", "error");
      return;
    }
    const newRequest = {
      id: requests.length + 1,
      requester: `${currentUser.role} ${currentUser.name}`,
      requestType,
      description,
      priority,
      status: "Pending",
      dateSubmitted: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    };
    setRequests([newRequest, ...requests]);
    setRequestType("");
    setPriority("Medium");
    setDescription("");
    setShowForm(false);
    notify("Request submitted successfully.");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Submit & View Requests</h1>

      {notification && (
        <div
          className={`p-4 mb-4 rounded text-white ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
          role="alert"
        >
          {notification.msg}
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {showForm ? "Cancel" : "Submit New Request"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded shadow">
          <div className="mb-4">
            <label className="block mb-1 font-semibold" htmlFor="requestType">
              Request Type <span className="text-red-600">*</span>
            </label>
            <select
              id="requestType"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Choose type</option>
              <option value="Resource Request">Resource Request</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Budget Approval">Budget Approval</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold" htmlFor="description">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Submit Request
          </button>
        </form>
      )}

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-96 focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-left text-gray-700">
          <thead className="bg-gray-100 uppercase text-sm text-gray-600">
            <tr>
              <th className="py-3 px-6">Requester</th>
              <th className="py-3 px-6">Request Type</th>
              <th className="py-3 px-6">Priority</th>
              <th className="py-3 px-6">Description</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Date Submitted</th>
              <th className="py-3 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No requests found.
                </td>
              </tr>
            ) : (
              filteredRequests.map(
                ({ id, requester, requestType, priority, description, status, dateSubmitted }) => (
                  <tr
                    key={id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-6">{requester}</td>
                    <td className="py-3 px-6">{requestType}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-2 py-1 rounded text-white ${
                          priority === "High"
                            ? "bg-red-600"
                            : priority === "Medium"
                            ? "bg-yellow-400 text-black"
                            : "bg-green-600"
                        }`}
                      >
                        {priority}
                      </span>
                    </td>
                    <td className="py-3 px-6 max-w-sm truncate">{description}</td>
                    <td className="py-3 px-6">{status}</td>
                    <td className="py-3 px-6">{dateSubmitted}</td>
                    <td className="py-3 px-6 text-center">
                      <button className="btn-primary btn-sm hover:bg-indigo-700 text-white px-3 py-1 rounded">
                        View
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestsPage;
