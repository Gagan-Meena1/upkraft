import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register required components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const RevenueTrend = ({ transactions = [] }) => {
  // Calculate monthly revenue from transactions (last 12 months)
  const monthlyRevenue = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleDateString("en-US", { month: "short" }));
      }
      return { labels: months, data: new Array(12).fill(0) };
    }

    const now = new Date();
    const months = [];
    const revenueByMonth = new Array(12).fill(0);

    // Generate labels for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleDateString("en-US", { month: "short" }));
    }

    // Calculate revenue for each of the last 12 months
    transactions.forEach((transaction) => {
      if (!transaction.paymentDate || transaction.status !== "Paid") return;
      
      const paymentDate = new Date(transaction.paymentDate);
      const monthsDiff = (now.getFullYear() - paymentDate.getFullYear()) * 12 + (now.getMonth() - paymentDate.getMonth());

      // Include transactions from the last 12 months
      if (monthsDiff >= 0 && monthsDiff < 12) {
        const index = 11 - monthsDiff; // Reverse index (most recent month is last)
        revenueByMonth[index] += Number(transaction.amount) || 0;
      }
    });

    // Convert to lakhs for display
    const revenueInLakhs = revenueByMonth.map(amount => amount / 100000);

    return { labels: months, data: revenueInLakhs };
  }, [transactions]);

  const data = {
    labels: monthlyRevenue.labels,
    datasets: [
      {
        label: "Revenue",
        data: monthlyRevenue.data,
        backgroundColor: "rgba(98, 0, 234, 0.7)", // Purple color matching the theme
        borderColor: "#6200EA",
        borderWidth: 1,
        borderRadius: 8, // Rounded bars
        barThickness: "flex", // Auto thickness
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Helps with flexible resizing
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#333" },
      },
      title: {
        display: true,
        text: "Revenue Trend (Month by Month)",
        font: { size: 18 },
        color: "#111",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function(context) {
            return `₹${context.parsed.y}L`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#555" },
      },
      y: {
        beginAtZero: true,
        ticks: { 
          color: "#555",
          callback: function(value) {
            return '₹' + value + 'L';
          }
        },
      },
    },
  };

  return (
    <div style={{
        width: "100%",
        height: "400px", 
        margin: "auto",
        }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default RevenueTrend;

