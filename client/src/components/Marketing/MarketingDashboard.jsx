import React, { useState, useEffect } from "react";
import axios from "axios";

const statusColors = {
  Completed: "bg-green-200 text-green-800",
  Pending: "bg-yellow-200 text-yellow-800",
};

const MarketingDashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("https://crm-backend-k8of.onrender.com/api/marketing/stats");
        const { dashboardStatsTop, recentVisits: visits } = res.data;

        setStats(dashboardStatsTop);
        setRecentVisits(visits);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800">Marketing Executive Dashboard</h2>
        <div className="text-gray-600">{new Date().toLocaleDateString()}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map(({ icon, label, value }) => (
          <div key={label} className="stat-card bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <i className={`fas ${icon} text-4xl text-indigo-600 mb-4`}></i>
            <h3 className="text-3xl font-bold">{value}</h3>
            <p className="text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="card bg-white rounded shadow p-6">
        <div className="card-header flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Recent Field Visits</h3>
          <button className="btn btn-primary bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
            Add New Entry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-700">
            <thead className="bg-gray-100 uppercase text-sm text-gray-600">
              <tr>
                {["Date", "Bank Name", "Manager", "Contact", "Area", "Status"].map((header) => (
                  <th key={header} className="py-3 px-6">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentVisits.map(({ date, bank, manager, contact, area, status }, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6">{new Date(date).toLocaleDateString()}</td>
                  <td className="py-3 px-6">{bank}</td>
                  <td className="py-3 px-6">{manager}</td>
                  <td className="py-3 px-6">{contact}</td>
                  <td className="py-3 px-6">{area}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        statusColors[status] || "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
