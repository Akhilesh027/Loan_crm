import React, { useState, useEffect } from "react";

const statusColors = {
  Completed: "bg-green-600",
  Pending: "bg-yellow-500",
  Failed: "bg-red-600",
  "In Progress": "bg-blue-500",
  Complete: "bg-green-600",
};

const AdminPaymentsAnalysis = () => {
  const [offers, setOffers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dataTypeFilter, setDataTypeFilter] = useState("all"); // all, revenue, expense

  // Payment proof modal
  const [proofModal, setProofModal] = useState({ visible: false, url: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const offersResponse = await fetch("https://crm-backend-k8of.onrender.com/api/offers");
        const offersData = await offersResponse.json();

        const expensesResponse = await fetch(
          "https://crm-backend-k8of.onrender.com/api/expenses"
        );
        const expensesData = await expensesResponse.json();

        if (offersData.success && expensesData.success) {
          setOffers(offersData.offers || []);
          setExpenses(expensesData.expenses || []);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Combine revenue and expenses
  const combinedData = [
    ...offers.map((offer) => ({
      id: offer._id,
      type: "Revenue",
      name: offer.caseId?.name || "-",
      description: offer.caseId?.problem || "-",
      amount: offer.dealAmount,
      date: offer.createdAt,
      status: offer.paymentStatus,
      caseId: offer.caseId?._id,
      method: "-",
      isRevenue: true,
      paymentProofUrl: offer.paymentProofUrl || "",
    })),
    ...expenses.map((expense) => ({
      id: expense._id,
      type: "Expense",
      name: "-",
      description: expense.description || "-",
      amount: expense.amount,
      date: expense.date || expense.createdAt,
      status: "Completed",
      caseId: "-",
      method: expense.method || "-",
      isRevenue: false,
    })),
  ];

  // Apply filters
  const filteredData = combinedData.filter((item) => {
    if (dataTypeFilter !== "all") {
      if (dataTypeFilter === "revenue" && !item.isRevenue) return false;
      if (dataTypeFilter === "expense" && item.isRevenue) return false;
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      if (
        !(
          item.name.toLowerCase().includes(lower) ||
          item.description.toLowerCase().includes(lower) ||
          item.id.toLowerCase().includes(lower)
        )
      )
        return false;
    }
    if (statusFilter && item.status !== statusFilter) return false;
    if (startDate && item.date < startDate) return false;
    if (endDate && item.date > endDate) return false;
    return true;
  });

  // Totals (all data)
  const totalRevenue = combinedData
    .filter((item) => item.isRevenue)
    .reduce((acc, item) => acc + (item.amount || 0), 0);

  const totalExpense = combinedData
    .filter((item) => !item.isRevenue)
    .reduce((acc, item) => acc + (item.amount || 0), 0);

  const totalProfit = totalRevenue - totalExpense;

  // Totals (filtered)
  const filteredRevenue = filteredData
    .filter((item) => item.isRevenue)
    .reduce((acc, item) => acc + (item.amount || 0), 0);

  const filteredExpense = filteredData
    .filter((item) => !item.isRevenue)
    .reduce((acc, item) => acc + (item.amount || 0), 0);

  const filteredProfit = filteredRevenue - filteredExpense;

  // Export CSV
  const handleExport = () => {
    const header = [
      "ID",
      "Type",
      "Name/Description",
      "Case ID",
      "Amount",
      "Date",
      "Method",
      "Status",
    ];
    const rows = filteredData.map((item) => [
      item.id,
      item.type,
      item.isRevenue ? item.name : item.description,
      item.caseId,
      item.amount,
      item.date,
      item.method,
      item.status,
    ]);
    const csvContent = [
      header.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    a.download = "financial_data.csv";
    a.click();
    a.remove();
  };

  // View payment proof
  const handleViewProof = (url) => {
    if (!url) return alert("No payment proof uploaded");
    setProofModal({ visible: true, url });
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Financial Analysis Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded p-6 text-center">
          <h2 className="text-lg font-medium text-gray-500 mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded p-6 text-center">
          <h2 className="text-lg font-medium text-gray-500 mb-2">Total Expenses</h2>
          <p className="text-3xl font-bold text-red-600">₹{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded p-6 text-center">
          <h2 className="text-lg font-medium text-gray-500 mb-2">Net Profit/Loss</h2>
          <p className={`text-3xl font-bold ${totalProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
            ₹{totalProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white shadow rounded p-6 text-center">
          <h2 className="text-lg font-medium text-gray-500 mb-2">Filtered Total</h2>
          <p className={`text-2xl font-bold ${filteredProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
            ₹{filteredProfit.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Based on current filters</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, description or ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 flex-grow md:flex-grow-0 md:w-80 focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={dataTypeFilter}
          onChange={(e) => setDataTypeFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          <option value="revenue">Revenue Only</option>
          <option value="expense">Expenses Only</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="Complete">Complete</option>
          <option value="Pending">Pending</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
        >
          Export Data
        </button>
      </div>

      {/* Financial Data Table */}
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-left text-gray-700">
          <thead className="bg-gray-100 uppercase text-sm text-gray-600">
            <tr>
              {["ID","Type","Name/Description","Case ID","Amount","Date","Method","Status","Action"].map(h => (
                <th key={h} className="py-3 px-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  No financial records found
                </td>
              </tr>
            )}
            {filteredData.map(item => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6">{item.id}</td>
                <td className={`py-3 px-6 ${item.isRevenue ? "text-green-600" : "text-red-600"}`}>{item.type}</td>
                <td className="py-3 px-6">{item.isRevenue ? item.name : item.description}</td>
                <td className="py-3 px-6">{item.caseId}</td>
                <td className="py-3 px-6 font-medium">₹{item.amount?.toLocaleString()}</td>
                <td className="py-3 px-6">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-3 px-6">{item.method}</td>
                <td className="py-3 px-6">
                  <span className={`px-2 py-1 text-white rounded ${statusColors[item.status] || "bg-gray-400"}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-6">
                  {item.isRevenue && (
                    <button
                      onClick={() => handleViewProof(item.paymentProofUrl)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
                    >
                      View Proof
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Proof Modal */}
      {proofModal.visible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={() => setProofModal({ visible: false, url: "" })}
        >
          <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-3 text-2xl font-bold text-gray-600 hover:text-gray-900"
              onClick={() => setProofModal({ visible: false, url: "" })}
            >
              &times;
            </button>
            <img 
              src={proofModal.url.startsWith("http") ? proofModal.url : `https://crm-backend-k8of.onrender.com/uploads/${proofModal.url}`} 
              alt="Payment Proof" 
              className="w-full h-auto rounded" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsAnalysis;
