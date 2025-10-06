import React, { useState, useEffect } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const statusColors = {
  Completed: "bg-green-200 text-green-800",
  "Call Back": "bg-yellow-200 text-yellow-800",
  Rejected: "bg-red-200 text-red-800",
  "In Progress": "bg-blue-200 text-blue-800",
  Connected: "bg-green-200 text-green-800",
  "Not Connected": "bg-red-200 text-red-800",
  "Not Responded": "bg-yellow-200 text-yellow-800",
};

const statusOptions = [
  "All Statuses",
  "Completed",
  "Call Back",
  "Rejected",
  "In Progress",
  "Connected",
  "Not Connected",
  "Not Responded"
];

const CallLogs = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [dateFilter, setDateFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/calllogs`);
        if (!response.ok) throw new Error("Failed to fetch call logs");

        const data = await response.json();
        setCallLogs(data);
        setFilteredLogs(data);
      } catch (error) {
        console.error("Error fetching call logs:", error);
        setError("Error loading call logs");
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, []);

  useEffect(() => {
    let results = callLogs;

    // Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter(
        (log) =>
          (log.customer && log.customer.toLowerCase().includes(lower)) ||
          (log.phone && log.phone.toLowerCase().includes(lower)) ||
          (log.status && log.status.toLowerCase().includes(lower)) ||
          (log.response && log.response.toLowerCase().includes(lower)) ||
          (log.callbackTime && log.callbackTime.toLowerCase().includes(lower))
      );
    }

    // Status filter
    if (statusFilter !== "All Statuses") {
      results = results.filter(log => log.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      results = results.filter(log => {
        if (!log.createdAt) return false;
        const logDate = new Date(log.createdAt).toLocaleDateString();
        const filterDate = new Date(dateFilter).toLocaleDateString();
        return logDate === filterDate;
      });
    }

    // Duration filter
    if (durationFilter) {
      results = results.filter(log => {
        if (!log.duration) return false;
        
        const duration = parseInt(log.duration);
        switch (durationFilter) {
          case "short":
            return duration <= 60; // 1 minute or less
          case "medium":
            return duration > 60 && duration <= 300; // 1-5 minutes
          case "long":
            return duration > 300; // More than 5 minutes
          default:
            return true;
        }
      });
    }

    setFilteredLogs(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, dateFilter, durationFilter, callLogs]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

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

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Statuses");
    setDateFilter("");
    setDurationFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== "All Statuses" || dateFilter || durationFilter;

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Call Logs</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading call logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Call Logs</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md max-w-full overflow-x-auto relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Call Logs</h2>
        <div className="flex items-center space-x-4">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              Clear Filters
            </button>
          )}
          <input
            type="text"
            placeholder="Search calls..."
            className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search call logs"
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Duration Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Duration
            </label>
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Durations</option>
              <option value="short">Short (≤ 1 min)</option>
              <option value="medium">Medium (1-5 min)</option>
              <option value="long">Long ( 5 min)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count and Pagination Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} call logs
          {hasActiveFilters && " (filtered)"}
        </div>
        
        {/* Pagination Info */}
        {totalPages > 1 && (
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {currentItems.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-2">
            {callLogs.length === 0 ? "No call logs found." : "No call logs match your filters."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded shadow overflow-hidden mb-4">
            <table className="min-w-full table-auto text-gray-700">
              <thead className="bg-gray-100 uppercase text-sm text-gray-600">
                <tr>
                  <th className="py-3 px-6 text-left">Time</th>
                  <th className="py-3 px-6 text-left">Customer</th>
                  <th className="py-3 px-6 text-left">Phone</th>
                  <th className="py-3 px-6 text-left">Duration</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Response</th>
                  <th className="py-3 px-6 text-left">Callback Time</th>
                  <th className="py-3 px-6 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((log) => (
                  <tr key={log._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6">{log.time}</td>
                    <td className="py-3 px-6 font-medium">{log.customer}</td>
                    <td className="py-3 px-6 font-mono">{log.phone}</td>
                    <td className="py-3 px-6">
                      {log.duration ? `${log.duration}s` : "-"}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          statusColors[log.status] || "bg-gray-300 text-gray-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 max-w-xs truncate">{log.response || "-"}</td>
                    <td className="py-3 px-6">{log.callbackTime || "-"}</td>
                    <td className="py-3 px-6">
                      {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <div className="text-sm text-gray-600">
                Showing {itemsPerPage} records per page
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  ←
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {getPageNumbers().map(pageNumber => (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`px-3 py-2 border rounded text-sm transition-colors ${
                        currentPage === pageNumber
                          ? 'bg-blue-500 text-white border-blue-500'
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
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CallLogs;