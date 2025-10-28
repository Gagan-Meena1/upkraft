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

const StudentGrowthTrend = () => {
  const data = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Student Growth",
        data: [5, 10, 8, 15, 18, 22, 28, 30, 35, 40, 45, 50], // Example data
        backgroundColor: "rgba(79, 70, 229, 0.7)", // Indigo color
        borderColor: "#4F46E5",
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
        text: "Student Growth Trend (Month by Month)",
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
        ticks: { color: "#555" },
      },
    },
  };

  return (
    <div style={{
        width: "100%",
        height: "420px", 
        margin: "auto",
        }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default StudentGrowthTrend;
