import React, { useState, useEffect } from "react";

const ExpenseTracking = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    type: "",
    advance: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  // Fetch expenses from backend
  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://crm-backend-k8of.onrender.com/api/expenses/${userId}`, {
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

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError(null);
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
      const res = await fetch("https://crm-backend-k8of.onrender.com/api/expense", {
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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Expense Tracking</h2>

      <div className="mb-8 bg-white p-6 rounded shadow max-w-md mx-auto">
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

      <div className="card bg-white rounded shadow p-6 max-w-4xl mx-auto">
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
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.map(({ _id, date, description, type, amount }) => (
                    <tr
                      key={_id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-6">{new Date(date).toLocaleDateString()}</td>
                      <td className="py-3 px-6">{description}</td>
                      <td className="py-3 px-6">{type}</td>
                      <td className="py-3 px-6">₹{Number(amount).toLocaleString()}</td>
                      <td className="py-3 px-6">
                        <button className="btn btn-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
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
  );
};

export default ExpenseTracking;
