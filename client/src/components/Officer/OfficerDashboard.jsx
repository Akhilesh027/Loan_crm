import React, { useState, useEffect } from "react";
import axios from "axios";

const statusColors = {
  Solved: "bg-green-200 text-green-800",
  "In Progress": "bg-yellow-200 text-yellow-800",
  Pending: "bg-red-200 text-red-800",
};

const OfficerDashboard = ({  }) => {
  const [stats, setStats] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
const officerId = localStorage.getItem("userId");
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    if (!officerId) return;

    axios
      .get(`https://crm-backend-k8of.onrender.com/api/agent/stats/${officerId}`)
      .then((res) => {
        setStats(res.data.stats || []);
        setRecentCases(res.data.recentCases || []);
      })
      .catch((err) => console.error("Error fetching officer data:", err))
      .finally(() => setLoading(false));
  }, [officerId]);

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800">Officer Dashboard</h2>
        <div className="text-gray-600">{formattedDate}</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {stats.map(({ icon, label, value }) => (
          <div
            key={label}
            className="bg-white rounded-lg shadow p-5 flex flex-col items-center"
          >
            <i className={`fas ${icon} text-4xl text-indigo-600 mb-4`}></i>
            <h3 className="text-3xl font-bold">{value}</h3>
            <p className="text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Assigned Cases Table */}
      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Recent Assigned Cases</h3>
          <button className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700 transition">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-gray-700">
            <thead className="bg-gray-100 uppercase text-sm text-gray-600">
              <tr>
                {["Case ID", "Customer", "Problem", "Assigned Date", "Days Count", "Status", "Action"].map(
                  (h) => (
                    <th key={h} className="py-3 px-6">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {recentCases.map(
                ({ caseId, customer, problem, assignedDate, status, daysCount }, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6">{caseId}</td>
                    <td className="py-3 px-6">{customer}</td>
                    <td className="py-3 px-6">{problem}</td>
                    <td className="py-3 px-6">{assignedDate}</td>
                    <td className="py-3 px-6">{daysCount}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          statusColors[status] || "bg-gray-300 text-gray-800"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm">
                        View
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
