import React from "react";
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

const RevenueTrend = () => {
  const data = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Revenue",
        data: [5.2, 6.1, 5.8, 7.2, 7.5, 8.0, 7.8, 8.2, 8.5, 8.42, 8.8, 9.2], // Example revenue data in lakhs
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
        height: "300px", 
        margin: "auto",
        }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default RevenueTrend;

