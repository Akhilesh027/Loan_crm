import React, { useState, useEffect } from "react";
import axios from "axios";

const FieldData = () => {
  const [formData, setFormData] = useState({
    bankName: "",
    bankArea: "",
    managerName: "",
    managerPhone: "",
    managerType: "", // Added manager type field
    executiveCode: "",
    collectionData: "",
  });

  const [dataList, setDataList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manager type options
  const managerTypes = [
    "Bank Manager",
    "Showroom Manager",
    "Bike Showroom",
    "NDFC Manager",
    "Other Manager",
    "Other Customers"
  ];

  useEffect(() => {
    fetchDataList();
  }, []);

  const fetchDataList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://crm-backend-k8of.onrender.com/api/field-data");
      // Assuming backend returns array of objects with addedBy populated { addedBy: { name: "" }, ... }
      setDataList(response.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "https://crm-backend-k8of.onrender.com/api/field-data",
        formData
      );
      alert(response.data.message || "Data saved successfully");
      setFormData({
        bankName: "",
        bankArea: "",
        managerName: "",
        managerPhone: "",
        managerType: "", // Reset manager type
        executiveCode: "",
        collectionData: "",
      });
      setShowForm(false);
      fetchDataList(); // Refresh table
    } catch (error) {
      console.error("Error saving data:", error);
      setError(
        error.response?.data?.message || "An error occurred while saving data"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Field Data Collection</h2>

      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
          aria-expanded={showForm}
          aria-controls="field-data-form"
        >
          {showForm ? "Hide Form" : "Add New Entry"}
        </button>
      </div>

      {showForm && (
        <div
          id="field-data-form"
          className="bg-white rounded shadow p-6 mb-8"
          aria-live="polite"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium" htmlFor="bankName">
                  Bank Name *
                </label>
                <input
                  name="bankName"
                  type="text"
                  id="bankName"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium" htmlFor="bankArea">
                  Bank Area *
                </label>
                <input
                  name="bankArea"
                  type="text"
                  id="bankArea"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.bankArea}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium" htmlFor="managerName">
                  Manager Name *
                </label>
                <input
                  id="managerName"
                  name="managerName"
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.managerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium" htmlFor="managerPhone">
                  Manager Phone *
                </label>
                <input
                  id="managerPhone"
                  name="managerPhone"
                  type="tel"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.managerPhone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium" htmlFor="managerType">
                  Manager Type *
                </label>
                <select
                  id="managerType"
                  name="managerType"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.managerType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  {managerTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium" htmlFor="executiveCode">
                  Executive Code *
                </label>
                <input
                  id="executiveCode"
                  name="executiveCode"
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.executiveCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium" htmlFor="collectionData">
                  Collection Data
                </label>
                <input
                  id="collectionData"
                  name="collectionData"
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.collectionData}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-center mb-4" role="alert">
                {error}
              </p>
            )}

            <div className="text-center">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
                disabled={submitLoading}
              >
                {submitLoading ? "Submitting..." : "Submit Data"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Submitted Entries</h3>
        {loading ? (
          <p className="text-center text-gray-600">Loading data...</p>
        ) : dataList.length === 0 ? (
          <p className="text-center text-gray-500">No entries found.</p>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Bank Name</th>
                <th className="border px-4 py-2 text-left">Bank Area</th>
                <th className="border px-4 py-2 text-left">Manager Name</th>
                <th className="border px-4 py-2 text-left">Manager Phone</th>
                <th className="border px-4 py-2 text-left">Manager Type</th>
                <th className="border px-4 py-2 text-left">Executive Code</th>
                <th className="border px-4 py-2 text-left">Collection Data</th>
                <th className="border px-4 py-2 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{item._id}</td>
                  <td className="border px-4 py-2">{item.bankName}</td>
                  <td className="border px-4 py-2">{item.bankArea}</td>
                  <td className="border px-4 py-2">{item.managerName}</td>
                  <td className="border px-4 py-2">{item.managerPhone}</td>
                  <td className="border px-4 py-2">{item.managerType}</td>
                  <td className="border px-4 py-2">{item.executiveCode}</td>
                  <td className="border px-4 py-2">{item.collectionData || "-"}</td>
                  <td className="border px-4 py-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FieldData;