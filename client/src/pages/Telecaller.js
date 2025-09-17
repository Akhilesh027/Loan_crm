import React from "react";
import Sidebar from "../components/Sidebar.js";

export default function Telecaller() {
  return (
    <div className="app-layout">
      <Sidebar role="telecaller" />
      <div className="content">
        <h1>📞 Telecaller Dashboard</h1>
        <p>Manage Leads, Follow-ups, and Reports</p>
      </div>
    </div>
  );
}
