import React, { useState, useEffect } from "react";

const ExpenseTracking = () => {
  const [expenses, setExpenses] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses"); // "expenses" or "salaries"
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    type: "",
    advance: "",
    description: "",
  });
  const [salaryFormData, setSalaryFormData] = useState({
    date: "",
    amount: "",
    paidBy: "",
    receivedBy: "",
    description: "",
    month: "",
  });
  const [loading, setLoading] = useState(true);
  const [salaryLoading, setSalaryLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [salarySubmitLoading, setSalarySubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [salaryError, setSalaryError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [salarySubmitError, setSalarySubmitError] = useState(null);

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  // Fetch expenses from backend
  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/expenses/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch expenses.");
      }

      const data = await res.json();
      setExpenses(data.expenses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch salaries from backend
  const fetchSalaries = async () => {
    setSalaryLoading(true);
    setSalaryError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/salaries/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch salaries.");
      }

      const data = await res.json();
      setSalaries(data.salaries || []);
    } catch (err) {
      setSalaryError(err.message);
    } finally {
      setSalaryLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchSalaries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError(null);
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setSalaryFormData((prev) => ({ ...prev, [name]: value }));
    if (salarySubmitError) setSalarySubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.date || !formData.amount || !formData.type) {
      setSubmitError("Please fill the mandatory fields: Date, Amount and Type.");
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch("http://localhost:5000/api/expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: formData.date,
          amount: Number(formData.amount),
          type: formData.type,
          advance: formData.advance ? Number(formData.advance) : 0,
          description: formData.description || "",
          userId: userId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit expense.");
      }

      const data = await res.json();
      if (data.success) {
        // Refresh expenses
        fetchExpenses();
        // Reset form
        setFormData({
          date: "",
          amount: "",
          type: "",
          advance: "",
          description: "",
        });
      } else {
        throw new Error(data.error || "Failed to submit expense.");
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!salaryFormData.date || !salaryFormData.amount || !salaryFormData.paidBy || !salaryFormData.receivedBy || !salaryFormData.month) {
      setSalarySubmitError("Please fill all mandatory fields: Date, Amount, Paid By, Received By, and Month.");
      return;
    }

    setSalarySubmitLoading(true);
    setSalarySubmitError(null);

    try {
      const res = await fetch("http://localhost:5000/api/salary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: salaryFormData.date,
          amount: Number(salaryFormData.amount),
          paidBy: salaryFormData.paidBy,
          receivedBy: salaryFormData.receivedBy,
          description: salaryFormData.description || "",
          month: salaryFormData.month,
          userId: userId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit salary record.");
      }

      const data = await res.json();
      if (data.success) {
        // Refresh salaries
        fetchSalaries();
        // Reset form
        setSalaryFormData({
          date: "",
          amount: "",
          paidBy: "",
          receivedBy: "",
          description: "",
          month: "",
        });
      } else {
        throw new Error(data.error || "Failed to submit salary record.");
      }
    } catch (err) {
      setSalarySubmitError(err.message);
    } finally {
      setSalarySubmitLoading(false);
    }
  };

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalSalaries = salaries.reduce((sum, salary) => sum + Number(salary.amount), 0);
  const netAmount = totalSalaries - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Financial Tracking</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold">Total Salaries</h3>
            <p className="text-2xl font-bold text-green-600">₹{totalSalaries.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
          </div>
          <div className={`border rounded-lg p-4 ${
            netAmount >= 0 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <h3 className={netAmount >= 0 ? 'text-blue-800' : 'text-orange-800 font-semibold'}>
              Net Amount
            </h3>
            <p className={`text-2xl font-bold ${
              netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              ₹{netAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("expenses")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "expenses"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Expense Tracking
            </button>
            <button
              onClick={() => setActiveTab("salaries")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "salaries"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Salary Tracking
            </button>
          </nav>
        </div>
      </div>

      {/* Expenses Tab Content */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          {/* Add Expense Form */}
          <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">Add New Expense</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block font-medium mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="amount" className="block font-medium mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="type" className="block font-medium mb-1">
                    Expense Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select expense type</option>
                    <option value="Travel">Travel</option>
                    <option value="Food">Food</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="advance" className="block font-medium mb-1">
                    Advance Amount
                  </label>
                  <input
                    type="number"
                    id="advance"
                    name="advance"
                    placeholder="Enter advance amount"
                    value={formData.advance}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Enter expense description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {submitError && (
                <p className="text-red-500 text-sm text-center">{submitError}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition disabled:opacity-50"
                  disabled={submitLoading}
                >
                  {submitLoading ? "Submitting..." : "Submit Expense"}
                </button>
              </div>
            </form>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Expenses</h3>

            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading expenses...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded text-center">
                <p>Error loading expenses: {error}</p>
                <button
                  onClick={fetchExpenses}
                  className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-gray-700">
                  <thead className="bg-gray-100 uppercase text-sm text-gray-600">
                    <tr>
                      <th className="py-3 px-6 text-left">Date</th>
                      <th className="py-3 px-6 text-left">Description</th>
                      <th className="py-3 px-6 text-left">Type</th>
                      <th className="py-3 px-6 text-left">Amount</th>
                      <th className="py-3 px-6 text-left">Advance</th>
                      <th className="py-3 px-6 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length > 0 ? (
                      expenses.map(({ _id, date, description, type, amount, advance }) => (
                        <tr
                          key={_id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3 px-6">{new Date(date).toLocaleDateString()}</td>
                          <td className="py-3 px-6">{description || "-"}</td>
                          <td className="py-3 px-6">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {type}
                            </span>
                          </td>
                          <td className="py-3 px-6 font-semibold">₹{Number(amount).toLocaleString()}</td>
                          <td className="py-3 px-6">
                            {advance ? `₹${Number(advance).toLocaleString()}` : "-"}
                          </td>
                          <td className="py-3 px-6">
                            <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-gray-500">
                          No expense records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Salaries Tab Content */}
      {activeTab === "salaries" && (
        <div className="space-y-6">
          {/* Add Salary Form */}
          <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">Add Salary Record</h3>

            <form onSubmit={handleSalarySubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="salary-date" className="block font-medium mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    id="salary-date"
                    name="date"
                    value={salaryFormData.date}
                    onChange={handleSalaryChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="salary-amount" className="block font-medium mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    id="salary-amount"
                    name="amount"
                    placeholder="Enter salary amount"
                    value={salaryFormData.amount}
                    onChange={handleSalaryChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="paidBy" className="block font-medium mb-1">
                    Paid By *
                  </label>
                  <input
                    type="text"
                    id="paidBy"
                    name="paidBy"
                    placeholder="Who paid the salary?"
                    value={salaryFormData.paidBy}
                    onChange={handleSalaryChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="receivedBy" className="block font-medium mb-1">
                    Received By *
                  </label>
                  <input
                    type="text"
                    id="receivedBy"
                    name="receivedBy"
                    placeholder="Who received the salary?"
                    value={salaryFormData.receivedBy}
                    onChange={handleSalaryChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="month" className="block font-medium mb-1">
                    Salary Month *
                  </label>
                  <input
                    type="month"
                    id="month"
                    name="month"
                    value={salaryFormData.month}
                    onChange={handleSalaryChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="salary-description" className="block font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    id="salary-description"
                    name="description"
                    rows={3}
                    placeholder="Enter salary description or notes"
                    value={salaryFormData.description}
                    onChange={handleSalaryChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {salarySubmitError && (
                <p className="text-red-500 text-sm text-center">{salarySubmitError}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition disabled:opacity-50"
                  disabled={salarySubmitLoading}
                >
                  {salarySubmitLoading ? "Submitting..." : "Submit Salary Record"}
                </button>
              </div>
            </form>
          </div>

          {/* Salaries List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Salary Records</h3>

            {salaryLoading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading salary records...</p>
              </div>
            ) : salaryError ? (
              <div className="bg-red-100 text-red-700 p-4 rounded text-center">
                <p>Error loading salaries: {salaryError}</p>
                <button
                  onClick={fetchSalaries}
                  className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-gray-700">
                  <thead className="bg-gray-100 uppercase text-sm text-gray-600">
                    <tr>
                      <th className="py-3 px-6 text-left">Payment Date</th>
                      <th className="py-3 px-6 text-left">Salary Month</th>
                      <th className="py-3 px-6 text-left">Paid By</th>
                      <th className="py-3 px-6 text-left">Received By</th>
                      <th className="py-3 px-6 text-left">Amount</th>
                      <th className="py-3 px-6 text-left">Description</th>
                      <th className="py-3 px-6 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaries.length > 0 ? (
                      salaries.map(({ _id, date, month, paidBy, receivedBy, amount, description }) => (
                        <tr
                          key={_id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3 px-6">{new Date(date).toLocaleDateString()}</td>
                          <td className="py-3 px-6">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="py-3 px-6 font-medium">{paidBy}</td>
                          <td className="py-3 px-6 font-medium">{receivedBy}</td>
                          <td className="py-3 px-6 font-semibold text-green-600">₹{Number(amount).toLocaleString()}</td>
                          <td className="py-3 px-6">{description || "-"}</td>
                          <td className="py-3 px-6">
                            <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-gray-500">
                          No salary records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracking;