import React, { useEffect, useState } from "react";
import { Phone, MessageCircle } from "lucide-react"; // icons

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AttendancePage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_URL}/attendance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setLogs(data.logs);
        } else {
          alert(data.message || "Failed to fetch logs");
        }
      } catch (err) {
        console.error("Error fetching attendance logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Loading attendance logs...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Employee Attendance Logs</h2>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Login Time</th>
              <th className="px-4 py-3 text-left">Logout Time</th>
              <th className="px-4 py-3 text-left">Total Time</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 text-sm">
            {logs.map((log, index) => (
              <tr
                key={index}
                className="border-t hover:bg-gray-50 transition duration-150"
              >
                <td className="px-4 py-3">{log.employee}</td>
                <td className="px-4 py-3">{log.email}</td>
                <td className="px-4 py-3 capitalize">{log.role}</td>
                <td className="px-4 py-3">
                  {new Date(log.loginTime).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {log.logoutTime
                    ? new Date(log.logoutTime).toLocaleString()
                    : "Active"}
                </td>
                <td className="px-4 py-3">{log.duration}</td>
                <td className="px-4 py-3 flex justify-center gap-2">
                  {/* Call Action */}
                 <button
  className="px-3 py-1 border rounded text-sm flex items-center gap-1 hover:bg-gray-100 transition"

>
  <Phone className="w-4 h-4" /> Call
</button>


                  {/* WhatsApp Action */}
                  <button
  className="px-3 py-1 border border-green-600 text-green-600 rounded text-sm flex items-center gap-1 hover:bg-green-50 transition"
 
>
  <MessageCircle className="w-4 h-4" /> WhatsApp
</button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;
