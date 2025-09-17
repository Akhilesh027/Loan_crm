import React, { useState, useEffect } from "react";
import axios from "axios";

const FieldDataCollection = () => {
  const [formData, setFormData] = useState({
    bankName: "",
    bankArea: "",
    managerName: "",
    managerPhone: "",
    managerType: "", // New field for manager type
    executiveCode: "",
    collectionData: "",
  });

  const [dataList, setDataList] = useState([]);

  // Manager type options
  const managerTypes = [
    "Bank Manager",
    "Showroom Manager",
    "Bike Showroom",
    "NDFC Manager",
    "Other Manager",
    "Other Customers"
  ];

  // Fetch data on mount
  useEffect(() => {
    fetchDataList();
  }, []);

  const fetchDataList = async () => {
    try {
      const response = await axios.get("https://crm-backend-k8of.onrender.com/api/field-data");
      setDataList(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://crm-backend-k8of.onrender.com/api/field-data",
        formData
      );
      alert(response.data.message);
      setFormData({
        bankName: "",
        bankArea: "",
        managerName: "",
        managerPhone: "",
        managerType: "",
        executiveCode: "",
        collectionData: "",
      });
      fetchDataList(); // refresh table
    } catch (error) {
      console.error("Error saving data:", error.response || error.message);
      alert("Error saving data: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Field Data Collection</h2>

      {/* Form */}
      <div className="card bg-white rounded shadow p-6 mb-8">
        <div className="card-header mb-6">
          <div className="card-title text-xl font-semibold">
            Bank Information Collection
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">Bank Name *</label>
              <input
                name="bankName"
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.bankName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Bank Area *</label>
              <input
                name="bankArea"
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.bankArea}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">Manager Name *</label>
              <input
                name="managerName"
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.managerName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Manager Phone *</label>
              <input
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
              <label className="block mb-1 font-medium">Manager Type *</label>
              <select
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
              <label className="block mb-1 font-medium">Executive Code *</label>
              <input
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
              <label className="block mb-1 font-medium">Collection Data</label>
              <input
                name="collectionData"
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.collectionData}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Submit Data
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Submitted Entries</h3>
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
                <td className="border px-4 py-2">{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FieldDataCollection;