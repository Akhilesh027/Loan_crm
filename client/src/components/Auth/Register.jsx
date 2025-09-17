// src/components/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://crm-backend-k8of.onrender.com/api";

const roles = [
  { key: "telecaller", label: "Telecaller", icon: "fas fa-phone" },
  { key: "marketing", label: "Marketing", icon: "fas fa-chart-line" },
  { key: "officer", label: "Officer", icon: "fas fa-user-tie" },
  { key: "admin", label: "Admin", icon: "fas fa-user-person" },
];

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "telecaller",
    firstName: "",
    lastName: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Registration failed");
      } else {
        setSuccess("Registration successful! You can now login.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Registration Error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Left Info Section */}
          <div className="md:w-2/5 p-8 bg-indigo-700 text-white">
            <h1 className="text-2xl font-extrabold mb-4 flex items-center gap-3">
              <i className="fas fa-hand-holding-usd"></i> Loan Management CRM
            </h1>
            <p className="text-lg mb-6">Create your account</p>
            <h2 className="text-xl font-bold mb-5">Join Our Team</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>Telecallers: Manage leads and follow-ups</li>
              <li>Marketing: Collect field data and generate leads</li>
              <li>Officers: Verify documents and process applications</li>
            </ul>
            <div className="mt-10">
              <p className="text-sm">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Right Registration Form Section */}
          <div className="md:w-3/5 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create Account
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label htmlFor="firstName" className="block mb-1 font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block mb-1 font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-5">
                <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-5">
                <label htmlFor="username" className="block mb-1 font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block mb-1 font-medium text-gray-700">Role</label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.key })}
                      className={`flex items-center gap-2 border rounded px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                        formData.role === role.key
                          ? "bg-indigo-700 text-white border-indigo-700"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <i className={role.icon}></i>
                      <span>{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {error && <div className="text-red-600 mb-4 font-semibold">{error}</div>}
              {success && <div className="text-green-600 mb-4 font-semibold">{success}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-700 text-white py-3 rounded font-semibold hover:bg-indigo-800 transition disabled:opacity-70"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
