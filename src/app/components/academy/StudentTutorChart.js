import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Title,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip, Title);

const StudentTutorChart = () => {
  const data = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Student",
        data: [12, 15, 10, 18, 20, 25, 30, 28, 26, 35, 40, 38],
        backgroundColor: "#4201EB",
        borderColor: "#f2f2f2",
        borderWidth: 1,
      },
      {
        label: "Tutor",
        data: [10, 12, 8, 16, 22, 27, 25, 30, 32, 38, 42, 45],
        backgroundColor: "#7109B9",
        borderColor: "#f2f2f2",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 👈 allows chart to resize freely
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 12 },
          color: "#333",
        },
      },
      title: {
        display: true,
        text: "Student vs Tutor (12-Month Performance)",
        font: { size: 18 },
        color: "#222",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 5, color: "#444" },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: { color: "#444" },
        grid: { display: false },
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        height: "400px", 
        margin: "auto",
      }}
    >
      <Bar data={data} options={options} />
    </div>
  );
};

export default StudentTutorChart;
