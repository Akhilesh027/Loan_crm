import React, { useState, useEffect } from "react";
import { FaEye, FaSpinner, FaTimes, FaSyncAlt, FaDownload, FaUser, FaCalendar, FaFilePdf, FaChartLine } from "react-icons/fa";

// ====================================================================
// --- Reusable Component Definitions ---
// ====================================================================

const DocumentPreview = ({ label, url }) => {
  if (!url) return <p className="italic text-gray-500 mb-3">No {label} uploaded</p>;

  const fullUrl = `http://localhost:5000/uploads/${url}`;
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);

  return (
    <div className="mb-4">
      <p className="font-semibold mb-2 text-gray-700">{label}</p>
      {isImage ? (
        <div className="relative group">
          <img 
            src={fullUrl} 
            alt={label} 
            className="w-full max-w-sm border-2 border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl" />
        </div>
      ) : isPdf ? (
        <div className="relative group">
          <iframe 
            src={fullUrl} 
            title={label} 
            className="w-full h-48 border-2 border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl" />
        </div>
      ) : (
        <a 
          href={fullUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <FaDownload className="mr-2" /> 
          Download {label}
        </a>
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "solved":
      case "resolved":
      case "completed":
        return {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: "✅"
        };
      case "in progress":
      case "processing":
        return {
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: "🔄"
        };
      case "admin pending":
      case "pending":
        return {
          color: "bg-rose-100 text-rose-800 border-rose-200",
          icon: "⏳"
        };
      case "call back":
      case "follow up":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "📞"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "📋"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color} transition-all duration-200 hover:scale-105`}>
      <span className="mr-1.5">{config.icon}</span>
      {status}
    </span>
  );
};

// CIBIL Score Display Component
const CibilScoreDisplay = ({ before, after }) => {
  const getScoreColor = (score) => {
    if (!score) return "text-gray-500";
    const numScore = parseInt(score);
    if (numScore >= 800) return "text-emerald-600";
    if (numScore >= 700) return "text-green-600";
    if (numScore >= 600) return "text-amber-600";
    return "text-rose-600";
  };

  const getImprovement = (before, after) => {
    if (!before || !after) return null;
    const improvement = parseInt(after) - parseInt(before);
    return {
      value: improvement,
      isPositive: improvement > 0
    };
  };

  const improvement = getImprovement(before, after);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center mb-3">
        <FaChartLine className="text-indigo-500 mr-2" />
        <h4 className="font-bold text-gray-800">CIBIL Score Progress</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Initial Score</p>
          <p className={`text-2xl font-bold ${getScoreColor(before)}`}>
            {before || "N/A"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Current Score</p>
          <p className={`text-2xl font-bold ${getScoreColor(after)}`}>
            {after || "N/A"}
          </p>
        </div>
      </div>

      {improvement && (
        <div className={`text-center p-2 rounded-lg ${
          improvement.isPositive 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          <p className="text-sm font-semibold">
            {improvement.isPositive ? '↑' : '↓'} {Math.abs(improvement.value)} points
            {improvement.isPositive ? ' improvement' : ' decrease'}
          </p>
        </div>
      )}
    </div>
  );
};

// ====================================================================
// --- Main Component ---
// ====================================================================

const CibilReportsPage = () => {
  const [cases, setCases] = useState([]);
  const [expandedCaseIds, setExpandedCaseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchCibilCases();
  }, []);

  const fetchCibilCases = async () => {
    if (!token) {
      setError("Authentication token missing. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:5000/api/cibil-reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch CIBIL reports.");
      }

      setCases(data.cases || []);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCaseIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  // Filter cases based on search term
  const filteredCases = cases.filter(caseItem =>
    caseItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.assignedTo?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative">
            <FaSpinner className="animate-spin text-indigo-500 text-5xl mb-4 mx-auto" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 blur-lg opacity-20 animate-pulse"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading CIBIL Reports</h3>
          <p className="text-gray-500">Fetching your financial cases...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-rose-200 transform hover:scale-105 transition-transform duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimes className="text-rose-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchCibilCases} 
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <FaSyncAlt className="mr-2" /> Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CIBIL Reports
              </h1>
              <p className="text-gray-600 mt-2">Monitor and manage credit score improvement cases</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
              <button 
                onClick={fetchCibilCases} 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center transform hover:-translate-y-0.5"
              >
                <FaSyncAlt className="mr-2" /> Refresh
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-blue-600 font-semibold">Total Cases</p>
              <p className="text-2xl font-bold text-gray-800">{cases.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <p className="text-sm text-green-600 font-semibold">Resolved Cases</p>
              <p className="text-2xl font-bold text-gray-800">
                {cases.filter(c => c.status?.toLowerCase() === 'solved' || c.status?.toLowerCase() === 'resolved').length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <p className="text-sm text-amber-600 font-semibold">In Progress</p>
              <p className="text-2xl font-bold text-gray-800">
                {cases.filter(c => c.status?.toLowerCase() === 'in progress').length}
              </p>
            </div>
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFilePdf className="text-indigo-500 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No CIBIL Reports Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "No cases match your search criteria." : "No CIBIL reports or relevant cases found."}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">
                  Cases ({filteredCases.length})
                </h2>
                <p className="text-sm text-gray-500">
                  Click on any case to view detailed CIBIL information
                </p>
              </div>
            </div>

            {/* Cases Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Case Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Agent</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCases.map((c) => (
                    <React.Fragment key={c._id}>
                      <tr className="hover:bg-gray-50 transition-colors duration-150 group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-mono font-semibold text-gray-900 text-sm">
                              {c.caseId || `CASE-${c._id.slice(-4).toUpperCase()}`}
                            </p>
                            <p className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                              {c.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{c.problem}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <FaUser className="text-indigo-500 text-sm" />
                            </div>
                            <span className="text-gray-700 font-medium">
                              {c.assignedTo?.username || "Unassigned"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleExpand(c._id)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 group"
                          >
                            <FaEye className="mr-2" />
                            {expandedCaseIds.includes(c._id) ? "Hide Details" : "View Details"}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Details */}
                      {expandedCaseIds.includes(c._id) && (
                        <tr className="bg-gradient-to-br from-blue-50 to-indigo-50">
                          <td colSpan="4" className="px-6 py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Case Information */}
                              <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 text-lg border-b pb-2 flex items-center">
                                  <span className="mr-2">📋</span>
                                  Case Information
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Problem Type</p>
                                    <p className="font-semibold text-gray-800">{c.problem}</p>
                                  </div>
                                  
                                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Priority</p>
                                    <p className="font-semibold text-gray-800 capitalize">{c.priority || 'Normal'}</p>
                                  </div>
                                  
                                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Case Type</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                      {c.caseType || 'Normal'}
                                    </span>
                                  </div>
                                  
                                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Assigned Date</p>
                                    <div className="flex items-center text-gray-800">
                                      <FaCalendar className="mr-2 text-gray-400" />
                                      {c.assignedDate ? new Date(c.assignedDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                  </div>
                                </div>

                                {/* CIBIL Score Display */}
                                <CibilScoreDisplay before={c.cibilBefore} after={c.cibilAfter} />
                              </div>

                              {/* CIBIL Report Document */}
                              <div>
                                <h3 className="font-bold text-gray-800 text-lg border-b pb-2 flex items-center mb-4">
                                  <FaFilePdf className="mr-2 text-rose-500" />
                                  CIBIL Report Document
                                </h3>
                                {c.documents && c.documents.cibilReport ? (
                                  <DocumentPreview label="CIBIL Report" url={c.documents.cibilReport} />
                                ) : (
                                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <span className="text-amber-600 text-xl">📄</span>
                                    </div>
                                    <p className="text-amber-800 font-medium">No CIBIL report uploaded yet</p>
                                    <p className="text-amber-600 text-sm mt-1">Upload a CIBIL report to track credit progress</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CibilReportsPage;