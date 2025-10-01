import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

const RequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminReply, setAdminReply] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
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
      }
    };
    fetchRequests();
  }, []);

  const createWhatsAppLink = (request) => {
    if (!request) return '#';
    const msg = `Request Message:
${request.message}

Case ID: ${request.caseId}
Agent: ${request.agentDetails?.firstName || ''} ${request.agentDetails?.lastName || ''}
Status: ${request.status}`;

    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const handleAdminReplySubmit = async () => {
    if (!adminReply.trim()) {
      alert("Reply cannot be empty");
      return;
    }
    try {
      setSubmittingReply(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/requests/${selectedRequest._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminResponse: adminReply.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit reply");

      setRequests((prev) =>
        prev.map((req) =>
          req._id === selectedRequest._id ? { ...req, adminResponse: data.adminResponse } : req
        )
      );

      setSelectedRequest((prev) => ({ ...prev, adminResponse: data.adminResponse }));
      setAdminReply("");
      alert("Reply submitted successfully");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading)
    return <p className="text-center text-gray-500 mt-8">Loading requests...</p>;
  if (error)
    return <p className="text-center text-red-500 mt-8">Error: {error}</p>;
  if (requests.length === 0)
    return <p className="text-center text-gray-500 mt-8">No requests found.</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-900 text-center">Requests</h1>

      <table className="min-w-full table-auto border-collapse border border-gray-300 rounded-md shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Request ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Case Id</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Agent</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Message</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((req) => (
            <tr key={req._id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{req._id}</td>
              <td className="border border-gray-300 px-4 py-2">{req.caseDetails?.caseId || '-'}</td>
              <td className="border border-gray-300 px-4 py-2">
                {req.agentDetails ? `${req.agentDetails.firstName} ${req.agentDetails.lastName}` : '-'}
              </td>
              <td className="border border-gray-300 px-4 py-2">{req.status}</td>
              <td className="border border-gray-300 px-4 py-2 truncate max-w-xs" title={req.message}>
                {req.message}
              </td>
              <td className="border border-gray-300 px-4 py-2 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setSelectedRequest(req);
                    setAdminReply(req.adminResponse || "");
                  }}
                  className="px-3 py-1 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  title="View Details"
                >
                  View
                </button>
                <a
                  href={createWhatsAppLink(req)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Send WhatsApp Message"
                  className="text-green-600 hover:text-green-800"
                >
                  <FaWhatsapp size={17} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for viewing full details */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg max-w-3xl p-6 max-h-[80vh] overflow-y-auto shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4">Request Full Details</h2>

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Main Request Info</h3>
              <p><strong>ID:</strong> {selectedRequest._id}</p>
              <p><strong>Message:</strong> {selectedRequest.message}</p>
              <p><strong>Status:</strong> {selectedRequest.status}</p>
              <p><strong>Admin Response:</strong></p>
              {selectedRequest.adminResponse ? (
                <div className="p-3 bg-green-50 border border-green-300 rounded text-green-700 mb-4">
                  {selectedRequest.adminResponse}
                </div>
              ) : (
                <p className="text-gray-500 italic mb-4">No admin response yet.</p>
              )}
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Case Details</h3>
              {selectedRequest.caseDetails ? (
                <table className="w-full table-auto border border-gray-300 rounded-md">
                  <tbody>
                    {Object.entries(selectedRequest.caseDetails).map(([key, val]) => (
                      <tr key={key} className="border-b border-gray-200 odd:bg-gray-50">
                        <td className="font-medium px-3 py-1 capitalize text-gray-700 border-r border-gray-300 w-1/3">{key.replace(/_/g, ' ')}</td>
                        <td className="px-3 py-1">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No case details available</p>
              )}
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Agent Details</h3>
              {selectedRequest.agentDetails ? (
                <table className="w-full table-auto border border-gray-300 rounded-md">
                  <tbody>
                    {Object.entries(selectedRequest.agentDetails).map(([key, val]) => (
                      <tr key={key} className="border-b border-gray-200 odd:bg-gray-50">
                        <td className="font-medium px-3 py-1 capitalize text-gray-700 border-r border-gray-300 w-1/3">{key.replace(/_/g, ' ')}</td>
                        <td className="px-3 py-1">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No agent details available</p>
              )}
            </section>

            {/* Reply textarea */}
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Reply to Request</h3>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-md p-2 mb-4"
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                placeholder="Write your response here..."
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAdminReplySubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={submittingReply}
                >
                  {submittingReply ? "Submitting..." : "Submit Reply"}
                </button>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestTable;
