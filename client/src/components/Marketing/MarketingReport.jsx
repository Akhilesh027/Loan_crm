import React from "react";

const reportsData = [
  {
    month: "January 2024",
    banksVisited: 12,
    managersMet: 8,
    leadsGenerated: 5,
    totalExpenses: "₹5,200",
    advanceAmount: "₹7,000",
  },
  {
    month: "December 2023",
    banksVisited: 18,
    managersMet: 12,
    leadsGenerated: 9,
    totalExpenses: "₹8,500",
    advanceAmount: "₹10,000",
  },
  {
    month: "November 2023",
    banksVisited: 15,
    managersMet: 10,
    leadsGenerated: 7,
    totalExpenses: "₹6,800",
    advanceAmount: "₹8,000",
  },
];

const MarketingReports = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Marketing Reports</h2>
      <div className="card bg-white rounded shadow p-6">
        <div className="card-header flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Performance Overview</h3>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 transition">
            Export Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-gray-700">
            <thead className="bg-gray-100 uppercase text-sm text-gray-600">
              <tr>
                <th className="py-3 px-6">Month</th>
                <th className="py-3 px-6">Banks Visited</th>
                <th className="py-3 px-6">Managers Met</th>
                <th className="py-3 px-6">Leads Generated</th>
                <th className="py-3 px-6">Total Expenses</th>
                <th className="py-3 px-6">Advance Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportsData.map(
                (
                  {
                    month,
                    banksVisited,
                    managersMet,
                    leadsGenerated,
                    totalExpenses,
                    advanceAmount,
                  },
                  idx
                ) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-6">{month}</td>
                    <td className="py-3 px-6">{banksVisited}</td>
                    <td className="py-3 px-6">{managersMet}</td>
                    <td className="py-3 px-6">{leadsGenerated}</td>
                    <td className="py-3 px-6">{totalExpenses}</td>
                    <td className="py-3 px-6">{advanceAmount}</td>
                  </tr>
                )
              )}
              {reportsData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No report data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketingReports;
