import React, { useEffect, useState } from "react";
import { Phone, MessageCircle, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AttendancePage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("all");
  const [roles, setRoles] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
          setFilteredLogs(data.logs);
          
          // Extract unique roles from logs
          const uniqueRoles = [...new Set(data.logs.map(log => log.role))];
          setRoles(uniqueRoles);
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

  // Filter logs based on selected role
  useEffect(() => {
    if (selectedRole === "all") {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(log => log.role === selectedRole);
      setFilteredLogs(filtered);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  }, [selectedRole, logs]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
  };

  const handleCall = (phoneNumber, employeeName) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    } else {
      alert(`Phone number not available for ${employeeName}`);
    }
  };

  const handleWhatsApp = (phoneNumber, employeeName) => {
    if (phoneNumber) {
      const message = `Hello ${employeeName},`;
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      alert(`Phone number not available for ${employeeName}`);
    }
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Loading attendance logs...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Employee Attendance Logs</h2>
        
        {/* Role Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <select 
            value={selectedRole}
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role} className="capitalize">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          
          {/* Filter Badge */}
          {selectedRole !== "all" && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
              {selectedRole}
            </span>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-2xl font-semibold">{logs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">Currently Active</p>
          <p className="text-2xl font-semibold text-green-600">
            {logs.filter(log => !log.logoutTime).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-semibold">{filteredLogs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">Selected Role</p>
          <p className="text-lg font-semibold text-blue-600 capitalize">
            {selectedRole === "all" ? "All" : selectedRole}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Login Time</th>
              <th className="px-4 py-3 text-left">Logout Time</th>
              <th className="px-4 py-3 text-left">Total Time</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 text-sm">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  No attendance logs found for the selected role.
                </td>
              </tr>
            ) : (
              currentItems.map((log, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-4 py-3 font-medium">{log.employee}</td>
                  <td className="px-4 py-3">{log.email}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {log.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {log.phone ? (
                      <span className="text-blue-600">{log.phone}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(log.loginTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {log.logoutTime ? (
                      new Date(log.logoutTime).toLocaleString()
                    ) : (
                      <span className="text-green-600 font-medium">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={!log.logoutTime ? "text-green-600 font-medium" : ""}>
                      {log.duration}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {/* Call Action */}
                      <button
                        onClick={() => handleCall(log.phone, log.employee)}
                        className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm flex items-center gap-1 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!log.phone}
                        title={log.phone ? `Call ${log.employee}` : 'Phone number not available'}
                      >
                        <Phone className="w-4 h-4" /> Call
                      </button>

                      {/* WhatsApp Action */}
                      <button
                        onClick={() => handleWhatsApp(log.phone, log.employee)}
                        className="px-3 py-1 border border-green-600 text-green-600 rounded text-sm flex items-center gap-1 hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!log.phone}
                        title={log.phone ? `Message ${log.employee} on WhatsApp` : 'Phone number not available'}
                      >
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredLogs.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          {/* Page Info */}
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} entries
            {selectedRole !== "all" && (
              <span className="ml-2">
                • Filtered by: <span className="font-medium capitalize">{selectedRole}</span>
              </span>
            )}
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {getPageNumbers().map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`px-3 py-1 border rounded-md text-sm transition ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Items Per Page Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Showing {itemsPerPage} entries per page
      </div>
    </div>
  );
};

export default AttendancePage;