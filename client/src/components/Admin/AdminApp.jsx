import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.js";
import Sidebar from "../../Sidebar.jsx";
import Header from "../../Header.jsx";
import "./AdminApp.css"; // Optional CSS for layout styling

function AdminApp() {
  const { currentRole, logout } = useAuth();

  return (
    <div className="admin-app">
      <Sidebar role={currentRole} onLogout={logout} />

      <div className="content-area">
        <Header
          role={currentRole}
          userName="Admin User"
          lastLogin="Today, 09:15 AM"
        />
        <main className="main-content">
          <div className="container">
            <Outlet /> {/* Renders admin child routes */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminApp;
