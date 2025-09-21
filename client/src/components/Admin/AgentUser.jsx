import React, { useState, useEffect } from "react";
import { FiPhone, FiEye } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const statusColors = {
  Active: "bg-green-600",
  Inactive: "bg-red-600",
};

const AgentUsers = () => {
  const [users, setUsers] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
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
        const filtered = data.users.filter((user) => user.role === "agent");
        setUsers(filtered);
      } else throw new Error(data.error || "Failed to fetch users");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId) => {
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
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const handleViewUser = async (user) => {
    setViewUser(user);
    await fetchUserStats(user._id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-white py-12 px-4 sm:px-8 lg:px-16">
      <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-10 drop-shadow-md">
        Agent Users Dashboard
      </h2>

      <div className="max-w-xl mx-auto mb-10">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search agents by name or email..."
          className="w-full rounded-lg border border-indigo-300 px-5 py-3 text-gray-800 text-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-600 transition"
          aria-label="Search agent users"
        />
      </div>

      {loading ? (
        <p className="text-center text-indigo-600 text-lg font-medium">
          Loading users...
        </p>
      ) : error ? (
        <p className="text-center text-red-600 text-lg font-semibold">{error}</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500 text-lg italic">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-2xl shadow-xl hover:shadow-indigo-500/30 transition p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-semibold text-indigo-800 tracking-wide">
                  {user.firstName} {user.lastName}
                </h3>
                <span
                  className={`px-3 py-1 rounded text-white text-xs font-semibold ${statusColors["Active"]}`}
                >
                  Active
                </span>
              </div>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p className="text-gray-600 mb-5">
                <span className="font-semibold">Phone:</span> {user.phone}
              </p>

              <div className="flex justify-between space-x-3">
                <button
                  type="button"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg py-2 shadow-md flex items-center justify-center space-x-2 transition"
                  onClick={() => window.open(`tel:${user.phone}`, "_self")}
                  aria-label={`Call ${user.firstName}`}
                >
                  <FiPhone size={20} />
                  <span>Call</span>
                </button>
                <button
                  type="button"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg py-2 shadow-md flex items-center justify-center space-x-2 transition"
                  onClick={() => window.open(`https://wa.me/${user.phone}`, "_blank")}
                  aria-label={`WhatsApp ${user.firstName}`}
                >
                  <FaWhatsapp size={20} />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  className="flex-1 bg-indigo-900 hover:bg-indigo-950 text-white font-medium rounded-lg py-2 shadow-md flex items-center justify-center space-x-2 transition"
                  onClick={() => handleViewUser(user)}
                  aria-label={`View details of ${user.firstName}`}
                >
                  <FiEye size={20} />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {viewUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center p-6 z-50"
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

            <section className="space-y-6 text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
                <div>
                  <p className="text-gray-500">Username</p>
                  <p className="text-lg font-semibold">{viewUser.username}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="text-lg font-semibold">{viewUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="text-lg font-semibold">{viewUser.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="text-lg font-semibold">{viewUser.role}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="text-lg font-semibold">
                    {new Date(viewUser.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Updated At</p>
                  <p className="text-lg font-semibold">
                    {new Date(viewUser.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Agent Stats */}
              {userStats && (
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-indigo-800">Today's Stats</h4>
                  <ul className="rounded-xl shadow-inner bg-indigo-50 p-6 space-y-3 font-semibold text-indigo-900">
                    {userStats.stats?.map((s, idx) => (
                      <li key={idx} className="flex justify-between border-b border-indigo-200 pb-1">
                        <span>{s.label}</span>
                        <span>{s.value}</span>
                      </li>
                    ))}
                  </ul>

                  <h4 className="text-2xl font-bold my-6 text-indigo-800">Recent Cases</h4>
                  {userStats.recentCases?.length > 0 ? (
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {userStats.recentCases.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-4 border border-indigo-300 rounded-lg bg-white shadow-sm"
                        >
                          <p><strong>Case ID:</strong> {c.caseId}</p>
                          <p><strong>Customer:</strong> {c.customer}</p>
                          <p><strong>Problem:</strong> {c.problem}</p>
                          <p><strong>Status:</strong> {c.status}</p>
                          <p><strong>Assigned:</strong> {c.assignedDate}</p>
                          <p><strong>Days Count:</strong> {c.daysCount}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-indigo-400">No recent cases found.</p>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentUsers;
