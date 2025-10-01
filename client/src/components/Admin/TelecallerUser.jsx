import React, { useState, useEffect } from "react";
import { 
  FaPhone, 
  FaWhatsapp, 
  FaEye, 
  FaTimes, 
  FaSearch, 
  FaUser, 
  FaEnvelope, 
  FaMobile, 
  FaCalendar,
  FaClock,
  FaChartLine,
  FaSyncAlt,
  FaExclamationTriangle
} from "react-icons/fa";

const TelecallerUsers = () => {
  const [users, setUsers] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userAttendance, setUserAttendance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
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
        const telecallers = data.users.filter((user) => user.role === "telecaller");
        setUsers(telecallers);
      } else throw new Error(data.error || "Failed to fetch users");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUserStats = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");

      const [statsRes, attendanceRes] = await Promise.all([
        fetch(`http://localhost:5000/api/dashboard/telecaller/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://localhost:5000/api/attendance/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const attendanceData = await attendanceRes.json();

      setUserStats(statsRes.ok ? statsData : null);
      setUserAttendance(attendanceRes.ok ? attendanceData : null);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUserStats(null);
      setUserAttendance(null);
    }
  };

  const handleViewUser = (user) => {
    setViewUser(user);
    setUserStats(null);
    setUserAttendance(null);
    fetchUserStats(user._id);
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const phone = u.phone?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search) || phone.includes(search);
  });

  const formatTime = (isoString) =>
    isoString ? new Date(isoString).toLocaleString() : "Not Available";

  const calculateDuration = (login, logout) => {
    if (!login || !logout) return "N/A";
    const diff = new Date(logout) - new Date(login);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: "bg-emerald-100 text-emerald-800 border-emerald-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      busy: "bg-amber-100 text-amber-800 border-amber-200",
      offline: "bg-red-100 text-red-800 border-red-200"
    };
    return statusColors[status] || statusColors.inactive;
  };

  // Stats card component
  const StatCard = ({ icon, label, value, color = "indigo" }) => (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4 text-center transition-all duration-300 hover:shadow-md`}>
      <div className={`inline-flex items-center justify-center w-12 h-12 bg-${color}-100 rounded-full mb-3`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Telecaller Team
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage and monitor your telecaller team's performance and attendance
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
              placeholder="Search telecallers by name, email, or phone..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'telecaller' : 'telecallers'}
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading telecallers...</p>
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
              <FaUser className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Telecallers Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? "No telecallers match your search criteria." : "No telecaller users available."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Users Grid */}
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
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {user.firstName} {user.lastName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor('active')}`}>
                          ● Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="w-4 h-4 mr-3 text-indigo-500" />
                      <span className="text-sm truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMobile className="w-4 h-4 mr-3 text-green-500" />
                      <span className="text-sm">{user.phone || "Not provided"}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {user.phone && (
                      <>
                        <button
                          onClick={() => window.open(`tel:${user.phone}`, "_self")}
                          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          title={`Call ${user.firstName}`}
                        >
                          <FaPhone className="w-4 h-4" />
                        
                        </button>
                        <button
                          onClick={() => window.open(`https://wa.me/${user.phone}`, "_blank")}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          title={`WhatsApp ${user.firstName}`}
                        >
                          <FaWhatsapp className="w-4 h-4" />
                  
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleViewUser(user)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      title={`View details of ${user.firstName}`}
                    >
                      <FaEye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {viewUser && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex justify-center items-center p-4 backdrop-blur-sm"
          onClick={() => setViewUser(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {viewUser.firstName?.[0]}{viewUser.lastName?.[0]}
                  </div>
                  <div>
                    <h2 id="modal-title" className="text-2xl font-bold">
                      {viewUser.firstName} {viewUser.lastName}
                    </h2>
                    <p className="text-indigo-100 opacity-90">Telecaller Profile</p>
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
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center">
                    <FaUser className="mr-2 text-indigo-500" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Username</span>
                      <span className="text-gray-900">{viewUser.username}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Email</span>
                      <span className="text-gray-900">{viewUser.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Phone</span>
                      <span className="text-gray-900">{viewUser.phone || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Role</span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        {viewUser.role}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Member Since</span>
                      <span className="text-gray-900">
                        {new Date(viewUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center">
                    <FaChartLine className="mr-2 text-green-500" />
                    Today's Performance
                  </h3>
                  
                  {userStats ? (
                    <div className="grid grid-cols-2 gap-4">
                      {userStats.map((stat, index) => (
                        <StatCard
                          key={index}
                          icon={<span className="text-lg">{stat.icon}</span>}
                          label={stat.label}
                          value={stat.value}
                          color={stat.color || "indigo"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      Loading performance data...
                    </div>
                  )}

                  {/* Attendance Section */}
                  {userAttendance && (
                    <>
                      <h4 className="text-lg font-semibold text-gray-800 mt-6 flex items-center">
                        <FaClock className="mr-2 text-blue-500" />
                        Today's Attendance
                      </h4>
                      <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-700">Login Time</span>
                          <span className="text-blue-900">{formatTime(userAttendance.loginTime)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-700">Logout Time</span>
                          <span className="text-blue-900">{formatTime(userAttendance.logoutTime)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                          <span className="font-bold text-blue-800">Total Duration</span>
                          <span className="font-bold text-blue-900">
                            {calculateDuration(userAttendance.loginTime, userAttendance.logoutTime)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end space-x-3">
                {viewUser.phone && (
                  <>
                    <button
                      onClick={() => window.open(`tel:${viewUser.phone}`, "_self")}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
                    >
                      <FaPhone /> Call Now
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/${viewUser.phone}`, "_blank")}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md"
                    >
                      <FaWhatsapp /> WhatsApp
                    </button>
                  </>
                )}
                <button
                  onClick={() => setViewUser(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelecallerUsers;