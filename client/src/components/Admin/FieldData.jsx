import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaPlus, 
  FaEye, 
  FaEyeSlash, 
  FaPhone, 
  FaWhatsapp, 
  FaBuilding, 
  FaUserTie, 
  FaMapMarkerAlt,
  FaIdCard,
  FaDatabase,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCalendar,
  FaTrash,
  FaEdit
} from "react-icons/fa";
import { FiMail, FiPhone } from "react-icons/fi";

const FieldData = () => {
  const [formData, setFormData] = useState({
    bankName: "",
    bankArea: "",
    managerName: "",
    managerPhone: "",
    managerType: "",
    executiveCode: "",
    collectionData: "",
  });

  const [dataList, setDataList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      const response = await axios.get("http://localhost:5000/api/field-data");
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
    setSuccess(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/field-data",
        formData
      );
      setSuccess(response.data.message || "Data saved successfully");
      setFormData({
        bankName: "",
        bankArea: "",
        managerName: "",
        managerPhone: "",
        managerType: "",
        executiveCode: "",
        collectionData: "",
      });
      setShowForm(false);
      fetchDataList();
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error("Error saving data:", error);
      setError(
        error.response?.data?.message || "An error occurred while saving data"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const getManagerTypeColor = (type) => {
    const colors = {
      "Bank Manager": "bg-blue-100 text-blue-800 border-blue-200",
      "Showroom Manager": "bg-purple-100 text-purple-800 border-purple-200",
      "Bike Showroom": "bg-green-100 text-green-800 border-green-200",
      "NDFC Manager": "bg-orange-100 text-orange-800 border-orange-200",
      "Other Manager": "bg-gray-100 text-gray-800 border-gray-200",
      "Other Customers": "bg-indigo-100 text-indigo-800 border-indigo-200"
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Field Data Collection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Collect and manage field data for bank managers and business contacts
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex justify-between items-center animate-fade-in">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
            <button onClick={clearMessages} className="text-red-500 hover:text-red-700">
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex justify-between items-center animate-fade-in">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-green-700">{success}</span>
            </div>
            <button onClick={clearMessages} className="text-green-500 hover:text-green-700">
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            aria-expanded={showForm}
            aria-controls="field-data-form"
          >
            {showForm ? <FaEyeSlash className="w-5 h-5" /> : <FaPlus className="w-5 h-5" />}
            {showForm ? "Hide Form" : "Add New Entry"}
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
              {dataList.length} {dataList.length === 1 ? 'entry' : 'entries'}
            </span>
            <button
              onClick={fetchDataList}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              <FaSyncAlt className={`${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div
            id="field-data-form"
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8 animate-fade-in"
            aria-live="polite"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaDatabase className="mr-3 text-blue-500" />
              New Field Entry
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bank Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <FaBuilding className="mr-2 text-blue-500" />
                    Bank Information
                  </h3>
                  
                  <div>
                    <label className="block mb-2 font-medium text-gray-700" htmlFor="bankName">
                      Bank Name *
                    </label>
                    <input
                      name="bankName"
                      type="text"
                      id="bankName"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.bankName}
                      onChange={handleChange}
                      required
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700" htmlFor="bankArea">
                      Bank Area *
                    </label>
                    <input
                      name="bankArea"
                      type="text"
                      id="bankArea"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.bankArea}
                      onChange={handleChange}
                      required
                      placeholder="Enter bank area/location"
                    />
                  </div>
                </div>

                {/* Manager Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <FaUserTie className="mr-2 text-green-500" />
                    Manager Information
                  </h3>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700" htmlFor="managerName">
                      Manager Name *
                    </label>
                    <input
                      id="managerName"
                      name="managerName"
                      type="text"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.managerName}
                      onChange={handleChange}
                      required
                      placeholder="Enter manager name"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700" htmlFor="managerPhone">
                      Manager Phone *
                    </label>
                    <input
                      id="managerPhone"
                      name="managerPhone"
                      type="tel"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.managerPhone}
                      onChange={handleChange}
                      required
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <FaIdCard className="mr-2 text-purple-500" />
                    Additional Information
                  </h3>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700" htmlFor="managerType">
                      Manager Type *
                    </label>
                    <select
                      id="managerType"
                      name="managerType"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.managerType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Manager Type</option>
                      {managerTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700" htmlFor="executiveCode">
                      Executive Code *
                    </label>
                    <input
                      id="executiveCode"
                      name="executiveCode"
                      type="text"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.executiveCode}
                      onChange={handleChange}
                      required
                      placeholder="Enter executive code"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <FaDatabase className="mr-2 text-orange-500" />
                    Collection Data
                  </h3>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700" htmlFor="collectionData">
                      Additional Data
                    </label>
                    <input
                      id="collectionData"
                      name="collectionData"
                      type="text"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.collectionData}
                      onChange={handleChange}
                      placeholder="Enter any additional collection data"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <FaSyncAlt className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Submit Data
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data Table Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <FaDatabase className="mr-3 text-blue-500" />
              Submitted Entries ({dataList.length})
            </h3>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading data...</p>
              </div>
            ) : dataList.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaDatabase className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Entries Found</h3>
                <p className="text-gray-500 mb-6">Start by adding your first field data entry</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Entry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bank Details</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Manager</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Executive</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dataList.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{item.bankName}</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                              {item.bankArea}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.managerName}</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <FiPhone className="w-3 h-3 mr-1" />
                              {item.managerPhone}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getManagerTypeColor(item.managerType)}`}>
                            {item.managerType}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {item.executiveCode}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <FaCalendar className="w-3 h-3 mr-1" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <a
                              href={`tel:${item.managerPhone}`}
                              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                              title="Call Manager"
                            >
                              <FaPhone className="w-3 h-3" />
                              Call
                            </a>
                            <a
                              href={`https://wa.me/${item.managerPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors text-sm"
                              title="WhatsApp Manager"
                            >
                              <FaWhatsapp className="w-3 h-3" />
                              WhatsApp
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FieldData;