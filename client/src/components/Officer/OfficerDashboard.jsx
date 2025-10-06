import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaUsers, 
  FaBriefcase, 
  FaCheckCircle, 
  FaClock, 
  FaChartLine, 
  FaExclamationTriangle,
  FaEye,
  FaArrowRight,
  FaMoneyBillWave,
  FaMoneyBill,
  FaChartPie,
  FaBullseye,
  FaSpinner,
  FaUserClock
} from "react-icons/fa";

const statusColors = {
  Solved: "bg-green-100 text-green-800 border border-green-300",
  "In Progress": "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Pending: "bg-red-100 text-red-800 border border-red-300",
  "Customer Pending": "bg-orange-100 text-orange-800 border border-orange-300",
  "Agent Pending": "bg-blue-100 text-blue-800 border border-blue-300",
  "Admin Pending": "bg-purple-100 text-purple-800 border border-purple-300",
  "Cible": "bg-indigo-100 text-indigo-800 border border-indigo-300",
  "new": "bg-gray-100 text-gray-800 border border-gray-300",
};

const caseTypeColors = {
  normal: "bg-blue-100 text-blue-800 border border-blue-300",
  cibil: "bg-purple-100 text-purple-800 border border-purple-300",
};

const OfficerDashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [caseOverview, setCaseOverview] = useState({
    total: 0,
    solved: 0,
    pending: 0,
    inProgress: 0,
    cible: 0,
    cibil: 0,
    successRate: 0,
    pendingResolution: 0
  });
  const [attendanceStatus, setAttendanceStatus] = useState({
    clockedIn: false,
    lastPunch: null,
    todayLogs: []
  });

  const officerId = localStorage.getItem("userId");
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Status Badge Component
  const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.Pending}`}>
      {status}
    </span>
  );

  // Case Type Badge Component
  const CaseTypeBadge = ({ caseType }) => {
    const displayText = caseType === 'cibil' ? 'CIBIL' : 'Normal';
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${caseTypeColors[caseType] || caseTypeColors.normal}`}>
        {displayText}
      </span>
    );
  };

  // Priority Badge Component
  const PriorityBadge = ({ priority }) => {
    const priorityColors = {
      high: "bg-red-100 text-red-800 border border-red-300",
      medium: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      low: "bg-green-100 text-green-800 border border-green-300"
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority] || priorityColors.medium}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Medium'}
      </span>
    );
  };

  useEffect(() => {
    if (!officerId) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/agent/stats/${officerId}`);
        const data = response.data;

        if (data.success) {
          setStats(data.stats || []);
          setRecentCases(data.recentCases || []);
          setCaseOverview(data.caseOverview || {
            total: 0,
            solved: 0,
            pending: 0,
            inProgress: 0,
            cible: 0,
            cibil: 0,
            successRate: 0,
            pendingResolution: 0
          });
          setAttendanceStatus(data.attendanceStatus || {
            clockedIn: false,
            lastPunch: null,
            todayLogs: []
          });
        }
      } catch (err) {
        console.error("Error fetching officer data:", err);
        // Fallback to calculating from recent cases if API fails
        if (recentCases.length > 0) {
          const caseOverviewData = {
            total: recentCases.length,
            solved: recentCases.filter(c => c.status === 'Solved').length,
            pending: recentCases.filter(c => c.status.includes('Pending')).length,
            inProgress: recentCases.filter(c => c.status === 'In Progress').length,
            cible: recentCases.filter(c => c.status === 'Cible').length,
            cibil: recentCases.filter(c => c.caseType === 'cibil').length,
            successRate: recentCases.length > 0 ? 
              Math.round((recentCases.filter(c => c.status === 'Solved').length / recentCases.length) * 100) : 0,
            pendingResolution: recentCases.filter(c => 
              c.status === 'In Progress' || c.status.includes('Pending')
            ).length
          };
          setCaseOverview(caseOverviewData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [officerId]);

  // Icon mapping for stats
  const getIconForLabel = (label) => {
    const iconMap = {
      'Total Assigned Cases': FaBriefcase,
      'Solved Cases': FaCheckCircle,
      'Pending Cases': FaClock,
      'In Progress': FaSpinner,
      'Cible Cases': FaBullseye,
      'CIBIL Cases': FaChartLine,
      'Total Revenue': FaMoneyBillWave,
      'Advance Received': FaMoneyBill,
      'Pending Amount': FaClock,
      'Success Rate': FaChartPie,
      'Assigned Cases': FaBriefcase,
      'Today Attendance': FaUserClock
    };
    return iconMap[label] || FaBriefcase;
  };

  // Color mapping for stats
  const getColorForLabel = (label) => {
    const colorMap = {
      'Total Assigned Cases': 'bg-blue-100 text-blue-600',
      'Solved Cases': 'bg-green-100 text-green-600',
      'Pending Cases': 'bg-orange-100 text-orange-600',
      'In Progress': 'bg-yellow-100 text-yellow-600',
      'Cible Cases': 'bg-indigo-100 text-indigo-600',
      'CIBIL Cases': 'bg-purple-100 text-purple-600',
      'Total Revenue': 'bg-emerald-100 text-emerald-600',
      'Advance Received': 'bg-teal-100 text-teal-600',
      'Pending Amount': 'bg-amber-100 text-amber-600',
      'Success Rate': 'bg-cyan-100 text-cyan-600'
    };
    return colorMap[label] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Officer Dashboard
            </h2>
            <p className="text-gray-600 mt-2">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
              attendanceStatus.clockedIn 
                ? 'bg-green-100 text-green-800 border-green-300' 
                : 'bg-red-100 text-red-800 border-red-300'
            }`}>
              {attendanceStatus.clockedIn ? '🟢 Clocked In' : '🔴 Clocked Out'}
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
              Officer
            </span>
          </div>
        </div>
      </div>

      {/* Case Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Cases */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Cases</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{caseOverview.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaBriefcase className="text-2xl text-blue-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Assigned to you</span>
            </div>
          </div>
        </div>

        {/* Solved Cases */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Solved Cases</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{caseOverview.solved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FaCheckCircle className="text-2xl text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Successfully resolved</span>
              <span className="font-semibold text-green-600">
                {caseOverview.successRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Pending Cases */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending Cases</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{caseOverview.pending}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <FaClock className="text-2xl text-orange-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Awaiting action</span>
              <span className="font-semibold text-orange-600">
                {caseOverview.total > 0 ? Math.round((caseOverview.pending / caseOverview.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* CIBIL Cases */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">CIBIL Cases</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{caseOverview.cibil}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaChartLine className="text-2xl text-purple-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Credit score cases</span>
              <span className="font-semibold text-purple-600">
                {caseOverview.total > 0 ? Math.round((caseOverview.cibil / caseOverview.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        {stats.map(({ label, value }, index) => {
          const IconComponent = getIconForLabel(label);
          const colorClass = getColorForLabel(label);

          return (
            <div
              key={label}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide truncate">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2 truncate">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${colorClass} flex-shrink-0 ml-3`}>
                  <IconComponent className="text-2xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Assigned Cases Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-2xl font-bold text-gray-800">
              Recent Assigned Cases
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                {recentCases.length} {recentCases.length === 1 ? 'case' : 'cases'}
              </span>
            </h3>
            <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
              View All
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>

        {recentCases.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBriefcase className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Cases Assigned</h3>
            <p className="text-gray-500">You don't have any assigned cases yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Case Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Case Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentCases.map((caseItem) => (
                  <tr key={caseItem._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono font-semibold text-gray-900 text-sm">
                          {caseItem.caseId}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {caseItem.problem}
                        </p>
                        {caseItem.banks && caseItem.banks.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Banks: {caseItem.banks.join(', ')}
                            {caseItem.totalBanks > 2 && ` +${caseItem.totalBanks - 2} more`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{caseItem.name}</p>
                        <p className="text-sm text-gray-600">{caseItem.phone}</p>
                        <p className="text-xs text-gray-500">{caseItem.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CaseTypeBadge caseType={caseItem.caseType} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={caseItem.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={caseItem.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        caseItem.daysCount > 7
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : caseItem.daysCount > 3
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                          : "bg-green-100 text-green-800 border border-green-300"
                      }`}>
                        {caseItem.daysCount}d
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm">
                        <FaEye className="mr-2" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Success Rate</p>
              <p className="text-2xl font-bold mt-1">{caseOverview.successRate}%</p>
            </div>
            <FaCheckCircle className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending Resolution</p>
              <p className="text-2xl font-bold mt-1">{caseOverview.pendingResolution}</p>
            </div>
            <FaClock className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">CIBIL Focus</p>
              <p className="text-2xl font-bold mt-1">{caseOverview.cibil}</p>
            </div>
            <FaChartLine className="text-3xl opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;