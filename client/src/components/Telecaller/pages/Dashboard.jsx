import React, { useState, useEffect } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://crm-backend-k8of.onrender.com/api";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("today-calls");
  const [bank, setBank] = useState("");
  const [showOtherBank, setShowOtherBank] = useState(false);
  const [otherBankName, setOtherBankName] = useState("");
  const [statsData, setStatsData] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bankOptions = [
    "HDFC Bank",
    "ICICI Bank",
    "State Bank of India",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Yes Bank",
    "IndusInd Bank",
    "Other"
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`);
        if (!statsResponse.ok) throw new Error("Failed to fetch stats");
        const stats = await statsResponse.json();
        setStatsData(stats);

        const logsResponse = await fetch(`${API_BASE_URL}/calllogs`);
        if (!logsResponse.ok) throw new Error("Failed to fetch call logs");
        const logs = await logsResponse.json();
        setCallLogs(logs);

        const activitiesResponse = await fetch(`${API_BASE_URL}/dashboard/activities`);
        if (!activitiesResponse.ok) throw new Error("Failed to fetch activities");
        const activities = await activitiesResponse.json();
        setRecentActivities(activities);

        const metricsResponse = await fetch(`${API_BASE_URL}/dashboard/metrics`);
        if (!metricsResponse.ok) throw new Error("Failed to fetch metrics");
        const metrics = await metricsResponse.json();
        setPerformanceMetrics(metrics);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleBankChange = (e) => {
    const value = e.target.value;
    setBank(value);
    setShowOtherBank(value === "Other");
    if (value !== "Other") {
      setOtherBankName("");
    }
  };

  const handleOtherBankChange = (e) => {
    setOtherBankName(e.target.value);
  };

  const handleBankSubmit = () => {
    const selectedBank = bank === "Other" ? otherBankName : bank;
    if (!selectedBank) {
      alert("Please select or enter a bank name");
      return;
    }
    console.log("Selected bank:", selectedBank);
    notify(`Bank set to: ${selectedBank}`, "success");
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
  };

  const notify = (msg, type = "success") => {
    alert(`${type === "success" ? "✓" : "✗"} ${msg}`);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Connected: "bg-green-100 text-green-800",
      "Not Connected": "bg-red-100 text-red-800",
      "Not Responded": "bg-yellow-100 text-yellow-800",
      "Call Back": "bg-blue-100 text-blue-800",
      "In Progress": "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter call logs for today's date safely
const today = new Date().toISOString().split('T')[0];

const todaysFollowups = callLogs.filter(log => {
  if (!log.createdAt) return false;
  const logDateObj = new Date(log.createdAt);
  if (isNaN(logDateObj.getTime())) return false;
  const logDate = logDateObj.toISOString().split('T')[0];
  return logDate === today;
});

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500">{currentDate}</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
          {/* Bank Selection */}
          <div className="flex items-center">
            <select
              value={bank}
              onChange={handleBankChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Bank</option>
              {bankOptions.map((bankOption, index) => (
                <option key={index} value={bankOption}>{bankOption}</option>
              ))}
            </select>
            {showOtherBank && (
              <input
                type="text"
                value={otherBankName}
                onChange={handleOtherBankChange}
                placeholder="Enter bank name"
                className="ml-2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <button onClick={handleBankSubmit} className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Set Bank
            </button>
          </div>
          
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
            <i className="fab fa-whatsapp mr-2"></i>
            Send WhatsApp Updates
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mr-4`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Call Summary */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">Today's Call Summary</h3>
          <div className="flex mt-2 md:mt-0">
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${activeTab === 'today-calls' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              onClick={() => switchTab('today-calls')}
            >
              Today's Calls
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${activeTab === 'pending-followups' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              onClick={() => switchTab('pending-followups')}
            >
              Pending Follow-ups
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
              </tr>
            </thead>
         <tbody className="bg-white divide-y divide-gray-200">
  {todaysFollowups.map((log, index) => (
    <tr key={index}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{log.time || "No time"}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.customer || "No name"}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{log.phone || "No phone"}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(log.status)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <a 
          href={`https://wa.me/${(log.phone || "").replace(/\D/g, "")}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-xs inline-flex items-center"
        >
          <i className="fab fa-whatsapp mr-1"></i> Message
        </a>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Showing today's follow-ups only ({todaysFollowups.length} results)
          </p>
        </div>
      </div>

      {/* Recent Activities and Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activities</h3>
          <ul className="space-y-4">
            {recentActivities.map((activity, index) => (
              <li key={index} className="flex items-start">
                <div className={`${activity.iconColor} p-2 rounded-full mr-3`}>
                  <i className={`fas ${activity.icon} ${activity.textColor}`}></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time} · {activity.details}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                <span className="text-sm font-medium text-gray-700">{performanceMetrics.conversionRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${performanceMetrics.conversionRate || 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Call Completion</span>
                <span className="text-sm font-medium text-gray-700">{performanceMetrics.callCompletion || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${performanceMetrics.callCompletion || 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Follow-up Rate</span>
                <span className="text-sm font-medium text-gray-700">{performanceMetrics.followupRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${performanceMetrics.followupRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
