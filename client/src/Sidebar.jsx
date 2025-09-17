import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css"; // Import the CSS file

const menuItems = {
  telecaller: [
    { path: "/telecaller/dashboard", icon: "fa-home", label: "Dashboard" },
    { path: "/telecaller/add-customer", icon: "fa-user-plus", label: "Add Customer" },
    { path: "/telecaller/today-followup", icon: "fa-list", label: "Today's Follow-ups" },
    { path: "/telecaller/followups", icon: "fa-list", label: "Follow-ups" },
    { path: "/telecaller/call-logs", icon: "fa-phone", label: "Call Logs" },
        { path: "/telecaller/field-data", icon: "fa-clipboard-list", label: "Field Data Collection" },
    { path: "/telecaller/reports", icon: "fa-chart-bar", label: "Reports" },
  ],
  marketing: [
    { path: "/marketing/dashboard", icon: "fa-home", label: "Dashboard" },
    { path: "/marketing/field-data", icon: "fa-clipboard-list", label: "Field Data Collection" },
    { path: "/marketing/Leads", icon: "fa-clipboard-list", label: "Leads" },
    { path: "/marketing/expenses", icon: "fa-money-bill-wave", label: "Expense Tracking" },
    { path: "/marketing/marketing-reports", icon: "fa-chart-bar", label: "Reports" },
  ],
  agent: [
    { path: "/agent/dashboard", icon: "fa-home", label: "Dashboard" },
    { path: "/agent/assigned-cases", icon: "fa-briefcase", label: "Assigned Cases" },
    { path: "/agent/case-offers", icon: "fa-handshake", label: "Case Offers" },
    { path: "/agent/payments", icon: "fa-money-bill-wave", label: "Payments" },
  ],
  admin: [
    { path: "/admin/dashboard", icon: "fa-home", label: "Dashboard" },
    { path: "/admin/all-cases", icon: "fa-briefcase", label: "All Cases" },
    { path: "/admin/field-data", icon: "fa-clipboard-list", label: "Field Data Collection" },
    { path: "/admin/Leadss", icon: "fa-clipboard-list", label: "Leads" },
    { path: "/admin/Customers", icon: "fa-briefcase", label: "All Customers" },
    { path: "/admin/financial-reports", icon: "fa-chart-line", label: "Financial Reports" },
    { path: "/admin/telecaller", icon: "fa-clipboard-list", label: "Telecaller" },
    { path: "/admin/marketing", icon: "fa-clipboard-list", label: "Marketing" },
    { path: "/admin/agent", icon: "fa-clipboard-list", label: "agent" },
    { path: "/admin/referral-management", icon: "fa-user-friends", label: "Referral Management" },
  ],
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole") || "user";
  const items = menuItems[role] || [];
  const displayRole = role.charAt(0).toUpperCase() + role.slice(1);

  const handleLogout = async () => {
  const logoutTime = new Date().toISOString();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  try {
    await fetch(`${process.env.REACT_APP_API_URL || "https://crm-backend-k8of.onrender.com/api/auth/logout"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, logoutTime }),
    });
  } catch (error) {
    console.error("Logout tracking failed:", error);
    // You may choose to still proceed with logout or show an error
  }

  // Clear local storage and redirect
  localStorage.removeItem("authToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userData");
  localStorage.removeItem("userId");
  localStorage.removeItem("loginTime");
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
