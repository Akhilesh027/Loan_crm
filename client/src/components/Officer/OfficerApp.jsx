import React from "react";
import { Outlet } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext.js";
import Sidebar from "../../Sidebar.jsx";
import Header from "../../Header.jsx";
import "./OfficerApp.css"; // Optional CSS for layout

function OfficerApp() {
  const { currentRole, logout } = useAuth();

  return (
    <div className="officer-app">
      <Sidebar role={currentRole} onLogout={logout} />

      <div className="content-area">
        <Header
          role={currentRole}
          userName="Officer User"
          lastLogin="Today, 09:45 AM"
        />
        <main className="main-content">
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default OfficerApp;
