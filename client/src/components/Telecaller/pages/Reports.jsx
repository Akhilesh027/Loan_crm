import React, { useState, useEffect } from "react";
import { 
  FaDownload, 
  FaFilter, 
  FaChartBar, 
  FaUsers, 
  FaPhone, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaCalendar,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaSyncAlt
} from "react-icons/fa";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const Reports = () => {
  const [reports, setReports] = useState({
    followups: [],
    callLogs: [],
    customers: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState("all");
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCalls: 0,
    successfulCalls: 0,
    convertedCustomers: 0,
    pendingFollowups: 0
  });
  const [chartData, setChartData] = useState({});
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [dateRange, reportType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const [followupsRes, callLogsRes, customersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/followups`),
        fetch(`${API_BASE_URL}/calllogs`),
        fetch(`${API_BASE_URL}/customers`)
      ]);

      if (!followupsRes.ok || !callLogsRes.ok || !customersRes.ok) {
        throw new Error("Failed to fetch reports data");
      }

      const [followups, callLogs, customers] = await Promise.all([
        followupsRes.json(),
        callLogsRes.json(),
        customersRes.json()
      ]);

      setReports({ followups, callLogs, customers });
      calculateStats(followups, callLogs, customers);
      generateChartData(followups, callLogs, customers);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (followups, callLogs, customers) => {
    const filteredFollowups = filterByDateRange(followups);
    const filteredCallLogs = filterByDateRange(callLogs);
    const filteredCustomers = filterByDateRange(customers);

    const totalLeads = filteredFollowups.length;
    const totalCalls = filteredCallLogs.length;
    const successfulCalls = filteredCallLogs.filter(log => log.status === "Success").length;
    const convertedCustomers = filteredCustomers.length;
    const pendingFollowups = filteredFollowups.filter(f => f.status === "Pending" || f.status === "Call Back").length;

    setStats({
      totalLeads,
      totalCalls,
      successfulCalls,
      convertedCustomers,
      pendingFollowups
    });
  };

  const generateChartData = (followups, callLogs, customers) => {
    const filteredData = filterByDateRange([...followups, ...callLogs, ...customers]);
    
    // Status distribution for followups
    const statusData = {
      Pending: followups.filter(f => f.status === "Pending").length,
      Success: followups.filter(f => f.status === "Success").length,
      Rejected: followups.filter(f => f.status === "Rejected").length,
      "Call Back": followups.filter(f => f.status === "Call Back").length
    };

    // Daily activity chart
    const dailyActivity = {};
    const callStatusData = {
      Success: callLogs.filter(log => log.status === "Success").length,
      "Not Connected": callLogs.filter(log => log.status === "Not Connected").length,
      "Not Responded": callLogs.filter(log => log.status === "Not Responded").length,
      "Call Back": callLogs.filter(log => log.status === "Call Back").length,
      Rejected: callLogs.filter(log => log.status === "Rejected").length
    };

    setChartData({
      statusData,
      dailyActivity,
      callStatusData
    });
  };

  const filterByDateRange = (data) => {
    return data.filter(item => {
      const itemDate = new Date(item.createdAt || item.time || new Date());
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      // Simulate Excel export
      const data = getExportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/vnd.ms-excel' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reports-${dateRange.start}-to-${dateRange.end}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const getExportData = () => {
    const filteredFollowups = filterByDateRange(reports.followups);
    const filteredCallLogs = filterByDateRange(reports.callLogs);
    const filteredCustomers = filterByDateRange(reports.customers);

    return {
      summary: stats,
      followups: filteredFollowups,
      callLogs: filteredCallLogs,
      customers: filteredCustomers,
      generatedAt: new Date().toISOString(),
      dateRange
    };
  };

  const getFilteredData = () => {
    switch (reportType) {
      case "followups":
        return filterByDateRange(reports.followups);
      case "calllogs":
        return filterByDateRange(reports.callLogs);
      case "customers":
        return filterByDateRange(reports.customers);
      default:
        return {
          followups: filterByDateRange(reports.followups),
          callLogs: filterByDateRange(reports.callLogs),
          customers: filterByDateRange(reports.customers)
        };
    }
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      Success: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Rejected: "bg-red-100 text-red-800",
      "Call Back": "bg-blue-100 text-blue-800",
      "Not Connected": "bg-gray-100 text-gray-800",
      "Not Responded": "bg-orange-100 text-orange-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSyncAlt className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics & Reports</h1>
        <p className="text-gray-600">Comprehensive overview of your lead management performance</p>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaCalendar className="inline mr-2" />
              Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaFilter className="inline mr-2" />
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Reports</option>
              <option value="followups">Follow-ups</option>
              <option value="calllogs">Call Logs</option>
              <option value="customers">Customers</option>
            </select>
          </div>

          {/* Export Buttons */}
          <div className="lg:col-span-2 flex items-end space-x-3">
            <button
              onClick={exportToExcel}
              disabled={exportLoading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm font-semibold disabled:opacity-50"
            >
              <FaFileExcel className="mr-2" />
              {exportLoading ? "Exporting..." : "Export Excel"}
            </button>
            <button
              onClick={exportToPDF}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm font-semibold"
            >
              <FaFilePdf className="mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center text-sm font-semibold"
            >
              <FaPrint className="mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <FaPhone className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <FaCheck className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Successful Calls</p>
              <p className="text-2xl font-bold text-gray-800">{stats.successfulCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg mr-4">
              <FaUsers className="text-indigo-600 text-xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Converted Customers</p>
              <p className="text-2xl font-bold text-gray-800">{stats.convertedCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Follow-ups</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pendingFollowups}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Follow-up Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(chartData.statusData || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{status}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-600"
                      style={{ 
                        width: `${(count / Math.max(1, stats.totalLeads)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Call Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(chartData.callStatusData || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{status}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-600"
                      style={{ 
                        width: `${(count / Math.max(1, stats.totalCalls)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="space-y-8">
        {/* Follow-ups Report */}
        {(reportType === "all" || reportType === "followups") && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Follow-ups Report</h3>
              <p className="text-sm text-gray-600">Detailed list of all follow-ups in selected period</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Village</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Callback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.followups?.map((followup) => (
                    <tr key={followup._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{followup.time}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{followup.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{followup.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{followup.issueType}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{followup.village}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={followup.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{followup.callbackTime || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!filteredData.followups || filteredData.followups.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No follow-up data available for selected period
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call Logs Report */}
        {(reportType === "all" || reportType === "calllogs") && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Call Logs Report</h3>
              <p className="text-sm text-gray-600">Detailed call history and performance</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Callback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.callLogs?.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{log.time}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.duration || "-"}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.response || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.callbackTime || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!filteredData.callLogs || filteredData.callLogs.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No call log data available for selected period
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customers Report */}
        {(reportType === "all" || reportType === "customers") && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Customers Report</h3>
              <p className="text-sm text-gray-600">Converted customers from leads</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Village</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.customers?.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{customer.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{customer.email || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{customer.issueType}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{customer.village}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={customer.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!filteredData.customers || filteredData.customers.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No customer data available for selected period
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="font-medium text-gray-600">Report Period</p>
            <p className="text-gray-800">
              {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600">Total Records</p>
            <p className="text-gray-800">
              {stats.totalLeads + stats.totalCalls + stats.convertedCustomers}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600">Conversion Rate</p>
            <p className="text-gray-800">
              {stats.totalLeads > 0 ? ((stats.convertedCustomers / stats.totalLeads) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600">Success Rate</p>
            <p className="text-gray-800">
              {stats.totalCalls > 0 ? ((stats.successfulCalls / stats.totalCalls) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;