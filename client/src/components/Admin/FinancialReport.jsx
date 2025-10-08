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
  const [salaries, setSalaries] = useState([]); // Hold salaries separately
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dataTypeFilter, setDataTypeFilter] = useState("all");

  // Payment proof modal
  const [proofModal, setProofModal] = useState({ visible: false, url: "" });

  // Salary modal and form
  const [salaryModal, setSalaryModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    user: "",
    amount: "",
    date: "",
    method: "",
    description: "",
    isSalary: true,
  });
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState("");
  const [salarySuccess, setSalarySuccess] = useState("");

  const [userOptions, setUserOptions] = useState([]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users");
        const data = await res.json();
        if (data.success) setUserOptions(data.users || []);
      } catch {}
    };
    fetchUsers();
  }, []);

  const handleSalaryInput = (e) => {
    const { name, value } = e.target;
    setSalaryForm((f) => ({ ...f, [name]: value }));
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    setSalaryError("");
    setSalarySuccess("");

    if (!salaryForm.user || !salaryForm.amount || !salaryForm.date || !salaryForm.method) {
      setSalaryError("Please fill all required fields.");
      return;
    }

    setSalaryLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salaryForm),
      });

      const data = await response.json();

      if (data.success && data.salary) {
        const user = userOptions.find((u) => u._id === data.salary.user);

        setSalaries((prev) => [
          ...prev,
          {
            ...data.salary,
            user: {
              _id: data.salary.user,
              name: user ? (user.username || user.name) : `User ID: ${data.salary.user}`,
            },
          },
        ]);

        setSalarySuccess("Salary recorded successfully.");
        setSalaryForm({
          user: "",
          amount: "",
          date: "",
          method: "",
          description: "",
          isSalary: true,
        });
        setTimeout(() => setSalaryModal(false), 1000);
      } else {
        setSalaryError(data.message || "Failed to record salary.");
      }
    } catch (err) {
      setSalaryError(err.message || "Network/server error.");
    } finally {
      setSalaryLoading(false);
    }
  };

  // Fetch offers, expenses, and salaries
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [offersRes, expensesRes, salariesRes] = await Promise.all([
          fetch("http://localhost:5000/api/offers"),
          fetch("http://localhost:5000/api/expenses"),
          fetch("http://localhost:5000/api/salary"),
        ]);

        const offersData = await offersRes.json();
        const expensesData = await expensesRes.json();
        const salariesData = await salariesRes.json();

        if (offersData.success && expensesData.success && salariesData.success) {
          setOffers(offersData.offers || []);
          setExpenses(expensesData.expenses || []);
          setSalaries(salariesData.salaries || []);
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

  // Helper to get user name from ID or object
  const getUserName = (userIdOrObject) => {
    if (!userIdOrObject) return "-";
    if (typeof userIdOrObject === "object" && userIdOrObject.name) {
      return userIdOrObject.username || userIdOrObject.name;
    }
    const userId = typeof userIdOrObject === "string" ? userIdOrObject : userIdOrObject._id;
    const user = userOptions.find((u) => u._id === userId);
    return user ? (user.username || user.name) : `User ID: ${userId}`;
  };

  // Combine offers and expenses (excluding salaries from expenses as they are separate)
  const combinedData = [
    ...offers.map((offer) => ({
      id: offer._id,
      type: "Revenue",
      name: offer.caseId?.name || offer.caseId?._id || "-",
      description: offer.caseId?.problem || `Case ID: ${offer.caseId?._id}`,
      amount: offer.dealAmount || 0,
      date: offer.createdAt,
      status: offer.paymentStatus || "Pending",
      caseId: offer.caseId?._id || "-",
      method: "-",
      isRevenue: true,
      paymentProofUrl: offer.paymentProofUrl || "",
    })),
    ...expenses
      .filter((e) => !e.isSalary) // exclude salary expenses here
      .map((expense) => ({
        id: expense._id,
        type: "Expense",
        name: expense.description || "-",
        description: expense.description || "-",
        amount: expense.amount || 0,
        date: expense.date || expense.createdAt,
        status: expense.status || "Completed",
        caseId: "-",
        method: expense.method || "-",
        isRevenue: false,
      })),
  ];

  // Totals
  const totalRevenue = offers.reduce((acc, o) => acc + (o.dealAmount || 0), 0);
  const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalProfit = totalRevenue - totalExpense;

  const filteredData = combinedData.filter((item) => {
    if (dataTypeFilter !== "all") {
      if (dataTypeFilter === "revenue" && !item.isRevenue) return false;
      if (dataTypeFilter === "expense" && item.isRevenue) return false;
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const text = `${item.name} ${item.description} ${item.id} ${item.type}`.toLowerCase();
      if (!text.includes(lower)) return false;
    }

    if (statusFilter && item.status !== statusFilter) return false;
    if (startDate && new Date(item.date) < new Date(startDate)) return false;
    if (endDate && new Date(item.date) > new Date(endDate)) return false;

    return true;
  });

  const filteredRevenue = filteredData.filter((i) => i.isRevenue).reduce((acc, i) => acc + i.amount, 0);
  const filteredExpense = filteredData.filter((i) => !i.isRevenue).reduce((acc, i) => acc + i.amount, 0);
  const filteredProfit = filteredRevenue - filteredExpense;

  // Filter salaries independently for salary table
  const filteredSalaries = salaries.filter((salary) => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const text = `${getUserName(salary.user)} ${salary.description || ""} ${salary._id}`.toLowerCase();
      if (!text.includes(lower)) return false;
    }
    if (statusFilter && salary.status !== statusFilter) return false;
    if (startDate && new Date(salary.date) < new Date(startDate)) return false;
    if (endDate && new Date(salary.date) > new Date(endDate)) return false;
    return true;
  });

  // CSV export remains the same
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
      item.description,
      item.caseId,
      item.amount,
      new Date(item.date).toLocaleDateString(),
      item.method,
      item.status,
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Data</h2>
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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Revenue", value: totalRevenue, color: "text-green-600" },
          { title: "Total Expenses", value: totalExpense, color: "text-red-600" },
          {
            title: "Net Profit/Loss",
            value: totalProfit,
            color: totalProfit >= 0 ? "text-green-700" : "text-red-700",
          },
          {
            title: "Filtered Total",
            value: filteredProfit,
            color: filteredProfit >= 0 ? "text-green-700" : "text-red-700",
            sub: "Based on current filters",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white shadow rounded p-6 text-center">
            <h2 className="text-lg font-medium text-gray-500 mb-2">{card.title}</h2>
            <p className={`text-3xl font-bold ${card.color}`}>
              ₹{card.value.toLocaleString()}
            </p>
            {card.sub && <p className="text-sm text-gray-500 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, description or ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 flex-grow md:w-80 focus:ring-2 focus:ring-indigo-500"
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
              <div className="mt-6">
        <button
          onClick={() => setSalaryModal(true)}
          className="bg-indigo-700 hover:bg-indigo-800 text-white rounded px-4 py-2"
        >
          + Add Salary Payment
        </button>
      </div>
      </div>

      {/* Main Financial Table */}
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-left text-gray-700">
          <thead className="bg-gray-100 uppercase text-sm text-gray-600">
            <tr>
              {[
                "ID",
                "Type",
                "Name/Description",
                "Details/Case ID",
                "Amount",
                "Date",
                "Method",
                "Status",
                "Action",
              ].map((h) => (
                <th key={h} className="py-3 px-6">
                  {h}
                </th>
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
            {filteredData.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6 text-xs">{item.id.substring(0, 8)}...</td>
                <td className={`py-3 px-6 font-semibold ${item.isRevenue ? "text-green-600" : "text-red-600"}`}>
                  {item.type}
                </td>
                <td className="py-3 px-6 max-w-sm truncate">{item.name}</td>
                <td className="py-3 px-6 text-sm text-gray-500 max-w-xs truncate">
                  {item.isRevenue ? item.caseId : item.description}
                </td>
                <td className="py-3 px-6 font-medium">₹{item.amount?.toLocaleString()}</td>
                <td className="py-3 px-6">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-3 px-6">{item.method || "-"}</td>
                <td className="py-3 px-6">
                  <span
                    className={`px-2 py-1 text-xs font-semibold text-white rounded ${
                      statusColors[item.status] || "bg-gray-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-6">
                  {item.isRevenue && (
                    <button
                      onClick={() => handleViewProof(item.paymentProofUrl)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm disabled:bg-indigo-300"
                      disabled={!item.paymentProofUrl}
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

      {/* Salary Details Table */}
      <div className="mt-10 bg-white rounded shadow overflow-auto">
        <h2 className="text-2xl font-semibold text-gray-700 p-4 border-b">
          Salary Payments
        </h2>
        <table className="min-w-full text-left text-gray-700">
          <thead className="bg-gray-100 uppercase text-sm text-gray-600">
            <tr>
              <th className="py-3 px-6">Employee</th>
              <th className="py-3 px-6">Amount (₹)</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Method</th>
              <th className="py-3 px-6">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalaries.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No salary records found
                </td>
              </tr>
            ) : (
              filteredSalaries.map((salary) => (
                <tr
                  key={salary._id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-6 max-w-sm truncate">
                    {getUserName(salary.user)}
                  </td>
                  <td className="py-3 px-6 font-medium">₹{salary.amount?.toLocaleString()}</td>
                  <td className="py-3 px-6">
                    {new Date(salary.date || salary.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6">{salary.method || "-"}</td>
                  <td className="py-3 px-6 max-w-md truncate">{salary.description || "Salary Payment"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Salary */}


      {/* Salary Modal */}
      {salaryModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-3"
          onClick={() => setSalaryModal(false)}
        >
          <form
            className="bg-white max-w-md w-full rounded shadow-lg p-6 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSalarySubmit}
          >
            <button
              type="button"
              className="absolute top-2 right-3 text-2xl font-bold text-gray-600 hover:text-gray-900"
              onClick={() => setSalaryModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2">Add Salary Payment</h2>

            {salaryError && (
              <div className="bg-red-100 text-red-700 rounded px-3 py-2">{salaryError}</div>
            )}
            {salarySuccess && (
              <div className="bg-green-100 text-green-700 rounded px-3 py-2">{salarySuccess}</div>
            )}

            <div>
              <label className="block mb-1 font-medium">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="user"
                value={salaryForm.user}
                onChange={handleSalaryInput}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Employee</option>
                {userOptions.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.username || user.name || user._id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                name="amount"
                value={salaryForm.amount}
                onChange={handleSalaryInput}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={salaryForm.date}
                onChange={handleSalaryInput}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="method"
                value={salaryForm.method}
                onChange={handleSalaryInput}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Method</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={salaryForm.description}
                onChange={handleSalaryInput}
                className="w-full border rounded px-3 py-2"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={salaryLoading}
              className={`w-full text-white py-2 rounded ${
                salaryLoading ? "bg-gray-500" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {salaryLoading ? "Saving..." : "Save Salary"}
            </button>
          </form>
        </div>
      )}

      {/* Proof Modal */}
      {proofModal.visible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-3"
          onClick={() => setProofModal({ visible: false, url: "" })}
        >
          <div
            className="bg-white rounded-lg p-4 max-w-3xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-2xl font-bold text-gray-600 hover:text-gray-900"
              onClick={() => setProofModal({ visible: false, url: "" })}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-3">Payment Proof</h2>
            <img
              src={proofModal.url}
              alt="Payment Proof"
              className="w-full rounded shadow max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsAnalysis;
