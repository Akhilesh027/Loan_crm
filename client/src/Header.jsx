import React from "react";
import { useNavigate } from "react-router-dom";

const roleIcons = {
  telecaller: "fa-phone",
  marketing: "fa-chart-line",
  officer: "fa-user-tie",
  admin: "fa-crown",
};

const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const Header = () => {
  const navigate = useNavigate();

  // Read role, name, loginTime, and lastLogin from localStorage
  const role = localStorage.getItem("userRole") || "user";
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userName = userData.username || "User";
  const loginTime = userData.loginTime || "N/A";   // Added loginTime
  const lastLogin = userData.lastLogin || "N/A";   // Existing lastLogin

  const iconClass = roleIcons[role] || "fa-user";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-3" aria-label={`Role icon and title for ${capitalize(role)}`}>
        <div className="bg-indigo-600 p-3 rounded-lg">
          <i className={`fas ${iconClass} text-white text-xl`} aria-hidden="true"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{`Loan CRM - ${capitalize(role)}`}</h1>
          <p className="text-sm text-gray-500">Customer Relationship Management</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex flex-col items-end text-right">
          <div className="text-sm font-medium text-gray-700">{userName}</div>
          <div className="text-xs text-gray-500">
            Login time: {loginTime}
          </div>
          <div className="text-xs text-gray-500">
            Last login: {lastLogin}
          </div>
        </div>

        <div className="relative group">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff`}
            alt={`Avatar for ${userName}`}
            className="w-10 h-10 rounded-full border-2 border-indigo-100 cursor-pointer"
          />
          <div className="absolute hidden group-hover:block right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
