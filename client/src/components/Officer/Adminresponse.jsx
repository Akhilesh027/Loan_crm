import React, { useState, useEffect } from 'react';
import { 
  FaWhatsapp, 
  FaEye, 
  FaTimes, 
  FaSearch, 
  FaFilter,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaIdCard,
  FaComment,
  FaCalendar,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';
import { FiMessageSquare, FiUser } from 'react-icons/fi';

const RequestTableWithAdminResponse = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'Pending', label: 'Pending', color: 'yellow' },
    { value: 'Resolved', label: 'Resolved', color: 'green' },
    { value: 'In Progress', label: 'In Progress', color: 'blue' }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      if (!data.success) throw new Error('API returned unsuccessful response');
      setRequests(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createWhatsAppLink = (request) => {
    if (!request) return '#';
    const msg = `📋 *Request Details*\n\n` +
                `*Message:* ${request.message}\n` +
                `*Case ID:* ${request.caseDetails?.caseId || 'N/A'}\n` +
                `*Agent:* ${request.agentDetails?.firstName || ''} ${request.agentDetails?.lastName || ''}\n` +
                `*Status:* ${request.status}\n` +
                `*Admin Response:* ${request.adminResponse || 'Pending'}\n` +
                `*Date:* ${new Date(request.timestamp).toLocaleDateString()}`;

    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Resolved': 'bg-green-100 text-green-800 border-green-200',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.default;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': <FaClock className="w-3 h-3" />,
      'Resolved': <FaCheckCircle className="w-3 h-3" />,
      'In Progress': <FaSyncAlt className="w-3 h-3" />,
      'default': <FaExclamationTriangle className="w-3 h-3" />
    };
    return icons[status] || icons.default;
  };

  // Filter requests based on search term and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.caseDetails?.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${request.agentDetails?.firstName} ${request.agentDetails?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request._id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-red-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-red-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Requests</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => fetchRequests(true)}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Agent Requests & Responses
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage and respond to agent requests with detailed case information
          </p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="flex-1 sm:flex-none">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-48 pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
            </span>
            <button
              onClick={() => fetchRequests(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              <FaSyncAlt className={`${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Requests Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? "No requests match your current filters." 
                : "No requests have been submitted yet."}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Requests Table */}
        {filteredRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Agent</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin Response</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((req) => (
                    <React.Fragment key={req._id}>
                      <tr className="hover:bg-gray-50 transition-colors duration-150 group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-mono text-sm text-gray-500 mb-1">#{req._id.slice(-8)}</p>
                            <p className="font-semibold text-gray-900 mb-1">
                              Case: {req.caseDetails?.caseId || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2" title={req.message}>
                              {req.message}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {req.agentDetails ? (
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiUser className="text-blue-600 text-sm" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {req.agentDetails.firstName} {req.agentDetails.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{req.agentDetails.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Unknown Agent</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                            {getStatusIcon(req.status)}
                            <span className="ml-1.5">{req.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {req.adminResponse ? (
                              <p className="text-sm text-gray-700 line-clamp-2 bg-green-50 p-2 rounded-lg border border-green-200">
                                {req.adminResponse}
                              </p>
                            ) : (
                              <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
                                Awaiting Response
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <FaCalendar className="w-3 h-3 mr-2" />
                            {formatDate(req.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <a
                              href={createWhatsAppLink(req)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                              title="Share via WhatsApp"
                            >
                              <FaWhatsapp className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {selectedRequest && selectedRequest._id === req._id && (
                        <tr className="bg-blue-50">
                          <td colSpan="6" className="px-6 py-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
                              <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                  <FaComment className="mr-3 text-blue-500" />
                                  Request Details
                                </h3>
                                <button
                                  onClick={() => setSelectedRequest(null)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                                >
                                  <FaTimes className="w-5 h-5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Request Information */}
                                <div className="space-y-6">
                                  <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                      <FaIdCard className="mr-2 text-purple-500" />
                                      Request Information
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Request ID:</span>
                                        <span className="font-mono text-sm">{req._id}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                                          {req.status}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="text-gray-900">{formatDate(req.timestamp)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-blue-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                      <FiMessageSquare className="mr-2 text-blue-500" />
                                      Request Message
                                    </h4>
                                    <p className="text-gray-700 bg-white p-3 rounded-lg border border-blue-200">
                                      {req.message}
                                    </p>
                                  </div>

                                  {req.adminResponse && (
                                    <div className="bg-green-50 rounded-xl p-4">
                                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                        <FaEnvelope className="mr-2 text-green-500" />
                                        Admin Response
                                      </h4>
                                      <p className="text-gray-700 bg-white p-3 rounded-lg border border-green-200">
                                        {req.adminResponse}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Agent & Case Details */}
                                <div className="space-y-6">
                                  {req.agentDetails && (
                                    <div className="bg-purple-50 rounded-xl p-4">
                                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                        <FaUser className="mr-2 text-purple-500" />
                                        Agent Details
                                      </h4>
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Name:</span>
                                          <span className="font-medium">{req.agentDetails.firstName} {req.agentDetails.lastName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Email:</span>
                                          <span className="text-blue-600">{req.agentDetails.email}</span>
                                        </div>
                                        {req.agentDetails.phone && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Phone:</span>
                                            <span className="text-gray-900">{req.agentDetails.phone}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {req.caseDetails && (
                                    <div className="bg-orange-50 rounded-xl p-4">
                                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                        <FaIdCard className="mr-2 text-orange-500" />
                                        Case Details
                                      </h4>
                                      <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {Object.entries(req.caseDetails).map(([key, val]) => (
                                          <div key={key} className="flex justify-between text-sm">
                                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                            <span className="font-medium text-gray-900 text-right max-w-xs">
                                              {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
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
    </div>
  );
};

export default RequestTableWithAdminResponse;