import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.js";
import Sidebar from "../../Sidebar.jsx";
import Header from "../../Header.jsx";
import "./MarketingApp.css"; // Optional CSS file

function MarketingApp() {
  const { currentRole, logout } = useAuth();

  return (
    <div className="marketing-app">
      <Sidebar role={currentRole} onLogout={logout} />

      <div className="content-area">
        <Header role={currentRole} userName="Marketing User" lastLogin="Today, 10:00 AM" />
        <main className="main-content">
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MarketingApp;
