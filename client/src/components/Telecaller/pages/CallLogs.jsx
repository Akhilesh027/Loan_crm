import React, { useState, useEffect } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://crm-backend-k8of.onrender.com/api";

const statusColors = {
  Completed: "bg-green-200 text-green-800",
  "Call Back": "bg-yellow-200 text-yellow-800",
  Rejected: "bg-red-200 text-red-800",
  "In Progress": "bg-blue-200 text-blue-800",
  Connected: "bg-green-200 text-green-800",
  "Not Connected": "bg-red-200 text-red-800",
  "Not Responded": "bg-yellow-200 text-yellow-800",
};

const CallLogs = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/calllogs`);
        if (!response.ok) throw new Error("Failed to fetch call logs");

        const data = await response.json();
        setCallLogs(data);
        setFilteredLogs(data);
      } catch (error) {
        console.error("Error fetching call logs:", error);
        setError("Error loading call logs");
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredLogs(callLogs);
      return;
    }

    const lower = searchTerm.toLowerCase();
    setFilteredLogs(
      callLogs.filter(
        (log) =>
          (log.customer && log.customer.toLowerCase().includes(lower)) ||
          (log.phone && log.phone.toLowerCase().includes(lower)) ||
          (log.status && log.status.toLowerCase().includes(lower)) ||
          (log.response && log.response.toLowerCase().includes(lower)) ||
          (log.callbackTime && log.callbackTime.toLowerCase().includes(lower))
      )
    );
  }, [searchTerm, callLogs]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Call Logs</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading call logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Call Logs</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md max-w-full overflow-x-auto relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Call Logs</h2>
        <input
          type="text"
          placeholder="Search calls..."
          className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search call logs"
        />
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {callLogs.length === 0 ? "No call logs found." : "No matching call logs found."}
        </p>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full table-auto text-gray-700">
            <thead className="bg-gray-100 uppercase text-sm text-gray-600">
              <tr>
                <th className="py-3 px-6 text-left">Time</th>
                <th className="py-3 px-6 text-left">Customer</th>
                <th className="py-3 px-6 text-left">Phone</th>
                <th className="py-3 px-6 text-left">Duration</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Response</th>
                <th className="py-3 px-6 text-left">Callback Time</th>  {/* Added new column */}
                <th className="py-3 px-6 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6">{log.time}</td>
                  <td className="py-3 px-6">{log.customer}</td>
                  <td className="py-3 px-6">{log.phone}</td>
                  <td className="py-3 px-6">{log.duration || "-"}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusColors[log.status] || "bg-gray-300 text-gray-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">{log.response || "-"}</td>
                  <td className="py-3 px-6">{log.callbackTime || "-"}</td>  {/* Display callbackTime */}
                  <td className="py-3 px-6">
                    {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CallLogs;
