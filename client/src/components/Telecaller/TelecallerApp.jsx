import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.js";
import Sidebar from "../../Sidebar.jsx";
import Header from "../../Header.jsx";
import "./TelecallerApp.css"; // Optional for layout styling

function TelecallerApp() {
  const { currentRole, logout } = useAuth();

  // Shared call logs state for TodaysFollowups and CallLogs pages
  const [callLogs, setCallLogs] = useState([]);

  // Callback to add a call log entry from TodaysFollowups when a call is made
  const addCallLog = (callData) => {
    setCallLogs((prev) => [callData, ...prev]);
  };

  return (
    <div className="telecaller-app">
      <Sidebar role={currentRole} onLogout={logout} />

      <div className="content-area">
        <Header />
        <main className="main-content">
          <div className="container">
            <Outlet context={{ callLogs, setCallLogs, addCallLog }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default TelecallerApp;
