import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const statusColors = {
  Completed: "bg-green-600",
  "In Progress": "bg-yellow-500",
  Pending: "bg-red-500",
};

const AdminDashboard = () => {
  const [callStats, setCallStats] = useState([]);
  const [statsTop, setStatsTop] = useState([]);
  const [statsBottom, setStatsBottom] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [caseStatusData, setCaseStatusData] = useState({});
  const [revenueExpenseData, setRevenueExpenseData] = useState({});
  const [monthBarData, setMonthBarData] = useState({});

  // Function to generate sample monthly data
  const generateMonthlyData = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    // Generate realistic sample data with some variation
    const sampleData = months.map((month, index) => {
      // Base amount with some seasonal variation
      const baseAmount = 50000;
      const seasonalVariation = Math.sin(index * 0.5) * 15000;
      const randomVariation = (Math.random() - 0.5) * 10000;
      return Math.max(30000, baseAmount + seasonalVariation + randomVariation);
    });

    return {
      labels: months,
      datasets: [
        {
          label: "Monthly Revenue (₹)",
          data: sampleData,
          backgroundColor: "rgba(79, 70, 229, 0.8)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  // Chart options for better appearance
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Revenue Overview'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/stats")
      .then((res) => {
        const { callStats, dashboardStatsTop, dashboardStatsBottom, recentTransactions } = res.data;
        setCallStats(callStats || []);
        setStatsTop(dashboardStatsTop || []);
        setStatsBottom(dashboardStatsBottom || []);
        setRecentTransactions(recentTransactions || []);

        // Pie chart for Case Status
        const caseCounts = { Completed: 0, "In Progress": 0, Pending: 0 };
        (recentTransactions || []).forEach((txn) => {
          if (txn.status in caseCounts) caseCounts[txn.status]++;
        });

        setCaseStatusData({
          labels: Object.keys(caseCounts),
          datasets: [
            {
              data: Object.values(caseCounts),
              backgroundColor: ["#16a34a", "#f59e0b", "#ef4444"],
              hoverOffset: 4,
            },
          ],
        });

        // Pie chart for Revenue vs Expense
        const revenueStat =
          dashboardStatsTop.find((stat) => stat.label === "Total Revenue")?.value.replace(/₹|,/g, "") || 0;
        const expenseStat =
          dashboardStatsTop.find((stat) => stat.label === "Total Expense")?.value.replace(/₹|,/g, "") || 0;

        setRevenueExpenseData({
          labels: ["Revenue", "Expense"],
          datasets: [
            {
              data: [parseFloat(revenueStat) || 450000, parseFloat(expenseStat) || 120000],
              backgroundColor: ["#2563eb", "#dc2626"],
              hoverOffset: 4,
            },
          ],
        });

        // Use generated monthly data for Bar chart
        setMonthBarData(generateMonthlyData());
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        // Fallback data in case API fails
        setMonthBarData(generateMonthlyData());
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-gray-500">{new Date().toLocaleDateString()}</div>
      </div>

      {/* Call Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {callStats.map(({ icon, value, label, color }) => (
          <div key={label} className="bg-white p-6 rounded shadow flex items-center gap-4">
            <i className={`fas ${icon} text-4xl ${color}`} />
            <div>
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-gray-600 uppercase">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statsTop.map(({ icon, label, value }) => (
          <div key={label} className="bg-white p-6 rounded shadow flex items-center gap-4">
            <i className={`fas ${icon} text-indigo-600 text-4xl`} />
            <div>
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-gray-600 uppercase">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {statsBottom.map(({ icon, label, value }) => (
          <div key={label} className="bg-white p-4 rounded shadow text-center">
            <i className={`fas ${icon} text-indigo-600 text-3xl mb-2`} />
            <p className="text-xl font-semibold">{value}</p>
            <p className="text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Case Status Distribution</h2>
          <Pie data={caseStatusData} />
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Revenue vs Expenses</h2>
          <Pie data={revenueExpenseData} />
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
          <Bar data={monthBarData} options={barChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;