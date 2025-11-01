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

// Register necessary chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const AssignmentCompletionTrends = () => {
  const data = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "✅ Completed",
        data: [20, 25, 28, 30, 40, 45, 48, 52, 55, 58, 60, 62],
        backgroundColor: "rgba(34, 197, 94, 0.8)", // Green
        borderColor: "#16a34a",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "⏳ Pending",
        data: [10, 14, 12, 15, 18, 20, 25, 22, 26, 30, 28, 25],
        backgroundColor: "rgba(234, 179, 8, 0.8)", // Yellow
        borderColor: "#ca8a04",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "⚠️ Overdue",
        data: [5, 6, 7, 5, 8, 9, 10, 12, 11, 10, 9, 8],
        backgroundColor: "rgba(239, 68, 68, 0.8)", // Red
        borderColor: "#dc2626",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#333" },
      },
      title: {
        display: true,
        text: "Assignment Completion Trends (Month by Month)",
        font: { size: 18 },
        color: "#111",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#555" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#555", stepSize: 10 },
        grid: { color: "#eee" },
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        height: "450px",
      }}
    >
      <Bar data={data} options={options} />
    </div>
  );
};

export default AssignmentCompletionTrends;
