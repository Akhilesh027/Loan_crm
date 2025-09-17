import React from "react";

// Example static customer responses data with callbackTime field
const customerResponsesData = [
  {
    customer: "Rahul Sharma",
    phone: "+91 9876543210",
    responseType: "Positive",
    message: "Interested in personal loan options",
    dateTime: "Today, 10:05 AM",
    callbackTime: "", // no callback
  },
  {
    customer: "Neha Singh",
    phone: "+91 9876543214",
    responseType: "Call Back",
    message: "Please call after 5 PM",
    dateTime: "Today, 11:45 AM",
    callbackTime: "17:00",
  },
  {
    customer: "Rajesh Kumar",
    phone: "+91 9876543215",
    responseType: "Call Back",
    message: "Call on Saturday afternoon",
    dateTime: "Today, 02:30 PM",
    callbackTime: "14:00",
  },
];

// Badge colors for response types
const responseBadgeColors = {
  Positive: "bg-green-200 text-green-800",
  Neutral: "bg-yellow-200 text-yellow-800",
  Negative: "bg-red-200 text-red-800",
  "Call Back": "bg-yellow-400 text-yellow-900",
};

// Aggregate best times (simple frequency count)
const getBestTimesToTalk = (responses) => {
  const timeCounts = {};

  responses.forEach(({ responseType, callbackTime }) => {
    if (responseType === "Call Back" && callbackTime) {
      const hour = callbackTime.slice(0, 2) + ":00";
      timeCounts[hour] = (timeCounts[hour] || 0) + 1;
    }
  });

  // Convert to array sorted descending by frequency
  return Object.entries(timeCounts)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => b.count - a.count);
};

const CustomerResponse = () => {
  const bestTimes = getBestTimesToTalk(customerResponsesData);

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md max-w-full overflow-x-auto">
      {/* Best Time to Talk Section */}
      <div className="mb-8 bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Best Time to Talk</h2>
        {bestTimes.length === 0 ? (
          <p className="text-gray-600 italic">No callback times recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {bestTimes.map(({ time, count }) => (
              <li key={time} className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{time}</span>
                <div className="w-2/3 bg-gray-200 rounded h-4 ml-4 relative">
                  <div
                    className="bg-indigo-600 h-4 rounded"
                    style={{ width: `${Math.min(count * 20, 100)}%` }}
                    title={`${count} callback${count > 1 ? "s" : ""}`}
                  ></div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Customer Responses Table */}
      <div className="card bg-white rounded shadow overflow-hidden">
        <div className="page-title mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Customer Responses</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Export Responses
          </button>
        </div>
        <table className="min-w-full table-auto text-gray-700">
          <thead className="bg-gray-100 uppercase text-sm text-gray-600">
            <tr>
              <th className="py-3 px-6 text-left">Customer</th>
              <th className="py-3 px-6 text-left">Phone</th>
              <th className="py-3 px-6 text-left">Response Type</th>
              <th className="py-3 px-6 text-left">Message</th>
              <th className="py-3 px-6 text-left">Date/Time</th>
              <th className="py-3 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {customerResponsesData.map(
              ({ customer, phone, responseType, message, dateTime }, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-6">{customer}</td>
                  <td className="py-3 px-6">{phone}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`badge px-2 py-1 rounded text-xs font-semibold ${
                        responseBadgeColors[responseType] || "bg-gray-300 text-gray-800"
                      }`}
                    >
                      {responseType}
                    </span>
                  </td>
                  <td className="py-3 px-6 max-w-sm truncate">{message}</td>
                  <td className="py-3 px-6">{dateTime}</td>
                  <td className="py-3 px-6 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                      Follow Up
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerResponse;
