// src/components/Login.js (Updated with API)
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://crm-backend-k8of.onrender.com/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();

  if (!username || !password) {
    return setError("Please fill in all fields");
  }

  setLoading(true);
  setError("");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store token & role in localStorage
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userRole", data.user.role);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userData", JSON.stringify(data.user));

    // Show alert with role and name
    alert(`Welcome ${data.user.username}!\nRole: ${data.user.role}`);
    window.location.href = `/${data.user.role}-dashboard`; // Redirect based on role
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  // For quick testing
  const fillTestCredentials = (role) => {
    setUsername(role);
    setPassword(role);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Info Section */}
        <div className="p-10 bg-indigo-700 text-white flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold mb-4 flex items-center gap-3">
            <i className="fas fa-hand-holding-usd"></i> Loan Management CRM
          </h1>
          <p className="text-lg mb-8">Sign in to your account</p>
          <h2 className="text-2xl font-bold mb-5">Complete Loan Management Solution</h2>
          <ul className="space-y-3 list-disc list-inside">
            <li>Telecaller Management with Follow-ups</li>
            <li>Marketing Executive Field Data Collection</li>
            <li>Officer Case Handling & Document Verification</li>
            <li>Admin Dashboard with Financial Reports</li>
            <li>WhatsApp Integration for Communication</li>
            <li>Role-based Access Control</li>
          </ul>
       
        </div>

        {/* Right Login Form Section */}
        <div className="p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Login to Your Account</h2>

          <form onSubmit={handleLogin}>
            {/* Username Input */}
            <div className="mb-5">
              <label htmlFor="username" className="block mb-1 font-semibold text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-5">
              <label htmlFor="password" className="block mb-1 font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Error Message */}
            {error && <div className="text-red-600 mb-4 font-semibold">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-700 text-white py-3 rounded font-semibold hover:bg-indigo-800 transition disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-700 hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;