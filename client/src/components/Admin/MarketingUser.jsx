import React, { useState, useEffect } from "react";

const statusColors = {
  Active: "bg-green-600",
  Inactive: "bg-red-600",
};

const MarketingUsers = () => {
  const [users, setUsers] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const filtered = data.users.filter((user) => user.role === "marketing");
        setUsers(filtered);
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

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-center">Marketing Users</h2>

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

      {loading ? (
        <p className="text-center">Loading users...</p>
      ) : error ? (
        <p className="text-center text-red-600">Error: {error}</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{`${user.firstName} ${user.lastName}`}</h3>
                <span className={`px-2 py-1 rounded text-white text-xs bg-gray-400`}>
                  N/A
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {user.email}</p>
              <p className="text-sm text-gray-600 mb-3"><strong>Phone:</strong> {user.phone}</p>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={() => window.open(`tel:${user.phone}`, "_self")}
                >
                  Call
                </button>
                <button
                  type="button"
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Message
                </button>
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                  onClick={() => setViewUser(user)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setViewUser(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded shadow-lg max-w-lg w-full p-6 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">{`${viewUser.firstName} ${viewUser.lastName}`}</h3>
              <button
                onClick={() => setViewUser(null)}
                className="text-gray-600 hover:text-gray-900 font-bold text-2xl leading-none"
                aria-label="Close user details"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <p><strong>Username:</strong> {viewUser.username}</p>
              <p><strong>Email:</strong> {viewUser.email}</p>
              <p><strong>Phone:</strong> {viewUser.phone}</p>
              <p><strong>Role:</strong> {viewUser.role}</p>
              <p><strong>Created At:</strong> {new Date(viewUser.createdAt).toLocaleString()}</p>
              <p><strong>Updated At:</strong> {new Date(viewUser.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingUsers;
