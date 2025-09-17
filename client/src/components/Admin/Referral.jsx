import React, { useState, useEffect } from "react";

const ReferralManagement = () => {
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newReferral, setNewReferral] = useState({
    name: "",
    phone: "",
    cases: 0,
    successRate: "0%",
    commission: "₹0"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://crm-backend-k8of.onrender.com/api/referrals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch referrals");
      setReferrals(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const filteredReferrals = referrals.filter(
    r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search)
  );

  const handleAddReferral = async () => {
    try {
      const res = await fetch("https://crm-backend-k8of.onrender.com/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReferral)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add referral");

      setReferrals(prev => [data.referral, ...prev]);
      setShowModal(false);
      setNewReferral({
        name: "",
        phone: "",
        cases: 0,
        successRate: "0%",
        commission: "₹0"
      });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Referral Management</h2>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search referrals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-72 focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Add Referral Partner
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-left text-gray-700">
          <thead className="bg-gray-100 uppercase text-sm text-gray-600">
            <tr>
              {["Name", "Phone", "Cases", "Success Rate", "Commission", "Action"].map(h => (
                <th key={h} className="py-3 px-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredReferrals.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No referral data found
                </td>
              </tr>
            )}
            {filteredReferrals.map(r => (
              <tr key={r._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6">{r.name}</td>
                <td className="py-3 px-6">{r.phone}</td>
                <td className="py-3 px-6">{r.cases}</td>
                <td className="py-3 px-6">{r.successRate}</td>
                <td className="py-3 px-6">{r.commission}</td>
                <td className="py-3 px-6">
                  <a
                    href={`https://wa.me/${r.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 mr-4"
                  >
                    <i className="fab fa-whatsapp"></i> Message
                  </a>
                  <button className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add Referral Partner</h3>
            <input
              type="text"
              placeholder="Name"
              value={newReferral.name}
              onChange={e => setNewReferral({ ...newReferral, name: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 w-full mb-3"
            />
            <input
              type="text"
              placeholder="Phone"
              value={newReferral.phone}
              onChange={e => setNewReferral({ ...newReferral, phone: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 w-full mb-3"
            />
            <input
              type="number"
              placeholder="Cases"
              value={newReferral.cases}
              onChange={e => setNewReferral({ ...newReferral, cases: parseInt(e.target.value) })}
              className="border border-gray-300 rounded px-3 py-2 w-full mb-3"
            />
            <input
              type="text"
              placeholder="Success Rate"
              value={newReferral.successRate}
              onChange={e => setNewReferral({ ...newReferral, successRate: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 w-full mb-3"
            />
            <input
              type="text"
              placeholder="Commission"
              value={newReferral.commission}
              onChange={e => setNewReferral({ ...newReferral, commission: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 w-full mb-3"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReferral}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralManagement;
