import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css"; // Import the CSS file

const menuItems = {
  telecaller: [
    // Updated Icons for Telecaller
    { path: "/telecaller/dashboard", icon: "fa-tachometer-alt", label: "Dashboard" }, // fa-home -> fa-tachometer-alt
    { path: "/telecaller/today-followup", icon: "fa-calendar-day", label: "Today's Follow-ups" }, // fa-list -> fa-calendar-day
    { path: "/telecaller/followups", icon: "fa-clipboard-list", label: "All Follow-ups" }, // fa-list -> fa-clipboard-list
    { path: "/telecaller/call-logs", icon: "fa-phone-volume", label: "Call Logs" }, // fa-phone -> fa-phone-volume
    { path: "/telecaller/field-data", icon: "fa-map-marker-alt", label: "Field Data Collection" }, // fa-clipboard-list -> fa-map-marker-alt
    { path: "/telecaller/reports", icon: "fa-chart-line", label: "Reports" }, // fa-chart-bar -> fa-chart-line
  ],
  marketing: [
    // Updated Icons for Marketing
    { path: "/marketing/dashboard", icon: "fa-tachometer-alt", label: "Dashboard" }, // fa-home -> fa-tachometer-alt
    { path: "/marketing/field-data", icon: "fa-street-view", label: "Field Data Collection" }, // fa-clipboard-list -> fa-street-view
    { path: "/marketing/Leads", icon: "fa-bullseye", label: "Leads" }, // fa-clipboard-list -> fa-bullseye
    { path: "/marketing/expenses", icon: "fa-file-invoice-dollar", label: "Expense Tracking" }, // fa-money-bill-wave -> fa-file-invoice-dollar
    { path: "/marketing/marketing-reports", icon: "fa-chart-area", label: "Reports" }, // fa-chart-bar -> fa-chart-area
  ],
  agent: [
    // Updated Icons for Agent
    { path: "/agent/dashboard", icon: "fa-tachometer-alt", label: "Dashboard" }, // fa-home -> fa-tachometer-alt
    { path: "/agent/assigned-cases", icon: "fa-folder-open", label: "Assigned Cases" }, // fa-briefcase -> fa-folder-open
    { path: "/agent/adminresponse", icon: "fa-reply", label: "Admin Response" }, // fa-briefcase -> fa-reply
    { path: "/agent/case-offers", icon: "fa-hand-holding-usd", label: "Case Offers" }, // fa-handshake -> fa-hand-holding-usd
    { path: "/agent/payments", icon: "fa-wallet", label: "Payments" }, // fa-money-bill-wave -> fa-wallet
  ],
  admin: [
    // Updated Icons for Admin
    { path: "/admin/dashboard", icon: "fa-user-cog", label: "Dashboard" }, // fa-home -> fa-user-cog
    { path: "/admin/all-cases", icon: "fa-database", label: "All Cases" }, // fa-briefcase -> fa-database
    { path: "/admin/field-data", icon: "fa-globe", label: "Field Data Collection" }, // fa-clipboard-list -> fa-globe
    { path: "/admin/Leadss", icon: "fa-funnel-dollar", label: "Leads" }, // fa-clipboard-list -> fa-funnel-dollar
    { path: "/admin/financial-reports", icon: "fa-balance-scale-right", label: "Financial Reports" }, // fa-chart-line -> fa-balance-scale-right
    { path: "/admin/Requests", icon: "fa-inbox", label: "Requests" }, // fa-chart-line -> fa-inbox
    { path: "/admin/ciblereport", icon: "fa-credit-card", label: "CIBIL Reports" }, // fa-chart-line -> fa-credit-card
    { path: "/admin/Attendence", icon: "fa-user-check", label: "Attendance" }, // fa-chart-line -> fa-user-check
    { path: "/admin/telecaller", icon: "fa-headset", label: "Telecallers" }, // fa-clipboard-list -> fa-headset
    { path: "/admin/marketing", icon: "fa-megaphone", label: "Marketing Users" }, // fa-clipboard-list -> fa-megaphone
    { path: "/admin/agent", icon: "fa-users-cog", label: "Agents" }, // fa-clipboard-list -> fa-users-cog
    { path: "/admin/referral-management", icon: "fa-hands-helping", label: "Referral Management" }, // fa-user-friends -> fa-hands-helping
  ],
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole") || "user";
  const items = menuItems[role] || [];
  const displayRole = role.charAt(0).toUpperCase() + role.slice(1);
const handleLogout = async () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL || "http://localhost:5000/api/auth/logout"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      const loginTime = new Date(data.loginTime).toLocaleTimeString();
      const logoutTime = new Date(data.logoutTime).toLocaleTimeString();
      alert(
        `You logged in at ${loginTime} and logged out at ${logoutTime}. Total Time: ${data.duration}`
      );
    } else {
      alert(data.message || "Logout failed!");
    }
  } catch (error) {
    console.error("Logout tracking failed:", error);
  }

  // Clear local storage and redirect
  localStorage.clear();
  navigate("/login", { replace: true });
};

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-text">Loan CRM</div>
      </div>

      <div className="role-badge" title={displayRole}>
        {displayRole}
      </div>

      <nav className="sidebar-menu">
        <ul>
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className={isActive ? "active" : ""}>
                <Link to={item.path} title={item.label}>
                  <i className={`fas ${item.icon} menu-icon`}></i>
                  <span className="menu-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout}>
          <i className="fas fa-sign-out-alt menu-icon"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
