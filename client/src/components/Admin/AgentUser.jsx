import React, { useState, useEffect } from "react";
import { 
  FiPhone, 
  FiEye, 
  FiMail,
  FiUser,
  FiCalendar,
  FiBriefcase,
  FiBarChart2,
  FiRefreshCw
} from "react-icons/fi";
import { 
  FaWhatsapp, 
  FaTimes, 
  FaSearch, 
  FaUserCircle,
  FaPhone,
  FaSyncAlt,
  FaExclamationTriangle,
  FaChartLine,
  FaIdCard,
  FaClock
} from "react-icons/fa";

const statusColors = {
  Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Inactive: "bg-red-100 text-red-800 border-red-200",
  Busy: "bg-amber-100 text-amber-800 border-amber-200",
  Offline: "bg-gray-100 text-gray-800 border-gray-200"
};

const AgentUsers = () => {
  const [users, setUsers] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      if (data.success) {
        const filtered = data.users.filter((user) => user.role === "agent");
        setUsers(filtered);
      } else throw new Error(data.error || "Failed to fetch users");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserStats = async (userId) => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:5000/api/agent/stats/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user stats");
      const data = await res.json();
      setUserStats(data);
    } catch (err) {
      console.error(err);
      setUserStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const phone = u.phone?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search) || phone.includes(search);
  });

  const handleViewUser = async (user) => {
    setViewUser(user);
    setUserStats(null);
    await fetchUserStats(user._id);
  };

  // Stats card component
  const StatCard = ({ icon, label, value, color = "blue" }) => (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4 text-center transition-all duration-300 hover:shadow-md`}>
      <div className={`inline-flex items-center justify-center w-12 h-12 bg-${color}-100 rounded-full mb-3`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
    </div>
  );

  // Case status badge
  const CaseStatusBadge = ({ status }) => {
    const statusConfig = {
      Solved: "bg-emerald-100 text-emerald-800 border-emerald-200",
      "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
      Pending: "bg-blue-100 text-blue-800 border-blue-200",
      "On Hold": "bg-red-100 text-red-800 border-red-200"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[status] || statusConfig.Pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Agent Team
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage and monitor your agent team's performance and case assignments
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agents by name, email, or phone..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              aria-label="Search agent users"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'agent' : 'agents'}
            </span>
            <button
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              <FaSyncAlt className={`${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading agents...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 text-xl mr-3" />
                <div>
                  <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
              <button
                onClick={() => fetchUsers(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaSyncAlt /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Agents Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? "No agents match your search criteria." : "No agent users available."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Agents Grid */}
        {!loading && filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                <div className="p-6">
                  {/* User Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {user.firstName} {user.lastName}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          ● Agent
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors.Active}`}>
                      ● Active
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-600">
                      <FiMail className="w-4 h-4 mr-3 text-blue-500" />
                      <span className="text-sm truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="w-4 h-4 mr-3 text-green-500" />
                      <span className="text-sm">{user.phone || "Not provided"}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {user.phone && (
                      <>
                        <button
                          onClick={() => window.open(`tel:${user.phone}`, "_self")}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          title={`Call ${user.firstName}`}
                        >
                          <FiPhone className="w-4 h-4" />
                          Call
                        </button>
                        <button
                          onClick={() => window.open(`https://wa.me/${user.phone}`, "_blank")}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          title={`WhatsApp ${user.firstName}`}
                        >
                          <FaWhatsapp className="w-4 h-4" />
                          WhatsApp
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleViewUser(user)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      title={`View details of ${user.firstName}`}
                    >
                      <FiEye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent Details Modal */}
      {viewUser && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex justify-center items-center p-4 backdrop-blur-sm"
          onClick={() => setViewUser(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white max-w-6xl w-full rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {viewUser.firstName?.[0]}{viewUser.lastName?.[0]}
                  </div>
                  <div>
                    <h2 id="modal-title" className="text-2xl font-bold">
                      {viewUser.firstName} {viewUser.lastName}
                    </h2>
                    <p className="text-blue-100 opacity-90">Credit Repair Agent</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewUser(null)}
                  className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
                  aria-label="Close modal"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information & Stats */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center">
                      <FaIdCard className="mr-2 text-blue-500" />
                      Agent Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-gray-600">Username</span>
                        <span className="text-gray-900">{viewUser.username}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-100">
                        <span className="font-medium text-gray-600">Email</span>
                        <span className="text-gray-900">{viewUser.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-100">
                        <span className="font-medium text-gray-600">Phone</span>
                        <span className="text-gray-900">{viewUser.phone || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-100">
                        <span className="font-medium text-gray-600">Role</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {viewUser.role}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-100">
                        <span className="font-medium text-gray-600">Member Since</span>
                        <span className="text-gray-900">
                          {new Date(viewUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-100">
                        <span className="font-medium text-gray-600">Last Updated</span>
                        <span className="text-gray-900">
                          {new Date(viewUser.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  {userStats && userStats.stats && userStats.stats.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center">
                        <FaChartLine className="mr-2 text-green-500" />
                        Today's Performance
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {userStats.stats.map((stat, idx) => (
                          <StatCard
                            key={idx}
                            icon={<span className="text-lg">{stat.icon || "📊"}</span>}
                            label={stat.label}
                            value={stat.value}
                            color={idx % 2 === 0 ? "blue" : "cyan"}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Cases */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center">
                      <FiBriefcase className="mr-2 text-purple-500" />
                      Recent Cases
                    </h3>
                    
                    {statsLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        Loading case data...
                      </div>
                    ) : userStats && userStats.recentCases && userStats.recentCases.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {userStats.recentCases.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white transition-colors duration-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {c.caseId || `CASE-${idx + 1}`}
                                </p>
                                <p className="text-gray-700 font-medium">{c.customer}</p>
                              </div>
                              <CaseStatusBadge status={c.status} />
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{c.problem}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <div className="flex items-center">
                                <FiCalendar className="mr-1" />
                                {c.assignedDate}
                              </div>
                              <div className="flex items-center">
                                <FaClock className="mr-1" />
                                {c.daysCount} days
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FiBriefcase className="text-gray-400 text-xl" />
                        </div>
                        <p className="font-medium">No recent cases</p>
                        <p className="text-sm">Case data will appear here once available</p>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FiBarChart2 className="mr-2 text-blue-500" />
                      Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {viewUser.phone && (
                        <>
                          <button
                            onClick={() => window.open(`tel:${viewUser.phone}`, "_self")}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <FiPhone className="w-4 h-4" />
                            Call
                          </button>
                          <button
                            onClick={() => window.open(`https://wa.me/${viewUser.phone}`, "_blank")}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                          >
                            <FaWhatsapp className="w-4 h-4" />
                            WhatsApp
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => window.open(`mailto:${viewUser.email}`, "_blank")}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-sm"
                      >
                        <FiMail className="w-4 h-4" />
                        Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentUsers;