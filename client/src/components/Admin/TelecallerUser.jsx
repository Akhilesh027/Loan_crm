import React, { useState, useEffect } from "react";

const TelecallerUsers = () => {
  const [users, setUsers] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userAttendance, setUserAttendance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
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
        setUsers(data.users.filter((user) => user.role === "telecaller"));
      } else throw new Error(data.error || "Failed to fetch users");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUserStats = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");

      const statsRes = await fetch(
        `http://localhost:5000/api/dashboard/telecaller/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const statsData = await statsRes.json();
      setUserStats(statsRes.ok ? statsData : null);

      const attendanceRes = await fetch(
        `http://localhost:5000/api/attendance/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const attendanceData = await attendanceRes.json();
      setUserAttendance(attendanceRes.ok ? attendanceData : null);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUserStats(null);
      setUserAttendance(null);
    }
  };

  const handleViewUser = (user) => {
    setViewUser(user);
    fetchUserStats(user._id);
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const formatTime = (isoString) =>
    isoString ? new Date(isoString).toLocaleString() : "N/A";

  const calculateDuration = (login, logout) => {
    if (!login || !logout) return "N/A";
    const diff = new Date(logout) - new Date(login);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-white py-12 px-4 sm:px-8 lg:px-16">
      <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-10 drop-shadow-md">
        Telecaller Users Dashboard
      </h2>

      <div className="max-w-xl mx-auto mb-10">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search telecallers by name or email..."
          className="w-full rounded-lg border border-indigo-300 px-5 py-3 text-gray-800 text-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-600 transition"
        />
      </div>

      {loading ? (
        <p className="text-center text-indigo-600 text-lg font-medium">
          Loading users...
        </p>
      ) : error ? (
        <p className="text-center text-red-600 text-lg font-semibold">{error}</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500 text-lg italic">
          No telecaller users found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-2xl shadow-xl hover:shadow-indigo-500/30 transition p-6 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-2xl font-semibold text-indigo-800 mb-1 tracking-wide">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p className="text-gray-600 mb-4">
                  <span className="font-semibold">Phone:</span> {user.phone}
                </p>
              </div>

              <div className="flex justify-between space-x-3">
                <button
                  type="button"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg py-2 shadow-md transition"
                  onClick={() => window.open(`tel:${user.phone}`, "_self")}
                  aria-label={`Call ${user.firstName}`}
                >
                  Call
                </button>
                <button
                  type="button"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg py-2 shadow-md transition"
                  onClick={() => window.open(`https://wa.me/${user.phone}`, "_blank")}
                  aria-label={`WhatsApp ${user.firstName}`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  className="flex-1 bg-indigo-900 hover:bg-indigo-950 text-white font-medium rounded-lg py-2 shadow-md transition"
                  onClick={() => handleViewUser(user)}
                  aria-label={`View details of ${user.firstName}`}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {viewUser && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex justify-center items-center p-6"
          onClick={() => setViewUser(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-y-auto max-h-[85vh] p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex justify-between items-center mb-7 border-b border-indigo-300 pb-3">
              <h3
                id="modal-title"
                className="text-3xl font-extrabold text-indigo-800 tracking-wide"
              >
                {viewUser.firstName} {viewUser.lastName}
              </h3>
              <button
                onClick={() => setViewUser(null)}
                className="text-indigo-700 hover:text-indigo-900 text-4xl font-bold leading-none"
                aria-label="Close modal"
              >
                &times;
              </button>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700 text-lg">
              <div className="space-y-3">
                <p>
                  <span className="font-semibold">Username:</span> {viewUser.username}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {viewUser.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> {viewUser.phone}
                </p>
                <p>
                  <span className="font-semibold">Role:</span> {viewUser.role}
                </p>
                <p>
                  <span className="font-semibold">Created At:</span>{" "}
                  {new Date(viewUser.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Updated At:</span>{" "}
                  {new Date(viewUser.updatedAt).toLocaleString()}
                </p>
              </div>

              {/* Telecaller stats */}
              <div>
                <h4 className="text-2xl font-bold mb-4 text-indigo-800">Today's Stats</h4>
                {userStats ? (
                  <ul className="divide-y divide-indigo-200 rounded-xl shadow-inner bg-indigo-50">
                    {userStats.map((stat, index) => (
                      <li
                        key={index}
                        className={`flex justify-between items-center py-3 px-5 font-semibold rounded-tl-xl rounded-br-xl ${stat.color} text-white`}
                      >
                        <span>{stat.label}</span>
                        <span>{stat.value}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-indigo-400">Loading stats...</p>
                )}
              </div>

              {/* Attendance */}
              {userAttendance && (
                <div>
                  <h4 className="text-2xl font-bold mb-4 mt-6 md:mt-0 text-indigo-800">
                    Attendance
                  </h4>
                  <ul className="bg-indigo-50 rounded-lg p-4 shadow-inner space-y-2 font-medium text-indigo-700">
                    <li>
                      <span className="font-semibold">Login Time: </span>{" "}
                      {formatTime(userAttendance.loginTime)}
                    </li>
                    <li>
                      <span className="font-semibold">Logout Time: </span>{" "}
                      {formatTime(userAttendance.logoutTime)}
                    </li>
                    <li>
                      <span className="font-semibold">Total Time: </span>{" "}
                      {calculateDuration(userAttendance.loginTime, userAttendance.logoutTime)}
                    </li>
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelecallerUsers;
