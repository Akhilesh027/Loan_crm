import React, { useState, useEffect } from "react";

const roles = ["All", "Telecaller", "Marketing", "Agent"];

const statusColors = {
  Active: "bg-green-600",
  Inactive: "bg-red-600",
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("All");
  const [viewUser, setViewUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("https://crm-backend-k8of.onrender.com/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const roleMatch = selectedRole === "All" || u.role === selectedRole;
    const search = searchTerm.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(search) ?? false;
    const emailMatch = u.email?.toLowerCase().includes(search) ?? false;
    return roleMatch && (nameMatch || emailMatch);
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-center">User Management</h2>

      {/* Search Input */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Search users"
        />
      </div>

      {/* Role Tabs */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2 rounded whitespace-nowrap ${
              selectedRole === role
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            aria-pressed={selectedRole === role}
          >
            {role}
          </button>
        ))}
      </div>

      {/* User List */}
      {loading ? (
        <p className="text-center">Loading users...</p>
      ) : error ? (
        <p className="text-center text-red-600">Error: {error}</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white p-4 rounded shadow hover:shadow-lg transition"
              role="region"
              aria-labelledby={`user-name-${user._id}`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 id={`user-name-${user._id}`} className="text-lg font-semibold">
                  {user.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${
                    statusColors[user.status] || "bg-gray-400"
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Role:</strong> {user.role}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Phone:</strong> {user.phone}
              </p>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  aria-label={`Call ${user.name}`}
                  onClick={() => window.open(`tel:${user.phone}`, "_self")}
                >
                  Call
                </button>
                <button
                  type="button"
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  aria-label={`Message ${user.name}`}
                >
                  Message
                </button>
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                  onClick={() => setViewUser(user)}
                  aria-haspopup="dialog"
                  aria-controls="user-view-modal"
                  aria-expanded={!!viewUser}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Details Modal */}
      {viewUser && (
        <div
          id="user-view-modal"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setViewUser(null)}
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white rounded shadow-lg max-w-lg w-full p-6 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 id="modal-title" className="text-2xl font-bold">
                {viewUser.name}
              </h3>
              <button
                onClick={() => setViewUser(null)}
                className="text-gray-600 hover:text-gray-900 font-bold text-2xl leading-none"
                aria-label="Close user details"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500">Role</p>
                <p className="text-lg font-semibold">{viewUser.role}</p>
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
                <p className="text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 rounded text-white ${
                    statusColors[viewUser.status] || "bg-gray-400"
                  }`}
                >
                  {viewUser.status}
                </span>
              </div>
              <div>
                <p className="text-gray-500">Hours Worked</p>
                <p className="text-lg font-semibold">{viewUser.totalHours || "N/A"} hrs</p>
              </div>
              <div>
                <p className="text-gray-500">Login Time</p>
                <p className="text-lg font-semibold">{viewUser.loginTime || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Logout Time</p>
                <p className="text-lg font-semibold">{viewUser.logoutTime || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Pending Tasks</p>
                <p className="text-lg font-semibold">{viewUser.pendingTasks || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
