"use client";
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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const AssignmentCompletionTrends = ({ assignments = [] }) => {
  // Calculate monthly data from assignments
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Initialize arrays for each status
    const completed = new Array(12).fill(0);
    const pending = new Array(12).fill(0);
    const overdue = new Array(12).fill(0);

    assignments.forEach(assignment => {
      const createdAt = new Date(assignment.createdAt);
      const deadline = new Date(assignment.deadline);
      
      // Only include assignments from the current year
      if (createdAt.getFullYear() === currentYear) {
        const monthIndex = createdAt.getMonth(); // 0-11
        
        const isOverdue = deadline < now && !assignment.status;

        if (assignment.status) {
          completed[monthIndex]++;
        } else if (isOverdue) {
          overdue[monthIndex]++;
        } else {
          pending[monthIndex]++;
        }
      }
    });

    return {
      labels: months,
      completed,
      pending,
      overdue,
    };
  }, [assignments]);

  const data = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: "✅ Completed",
        data: monthlyData.completed,
        backgroundColor: "rgba(34, 197, 94, 0.8)", // Green
        borderColor: "#16a34a",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "⏳ Pending",
        data: monthlyData.pending,
        backgroundColor: "rgba(234, 179, 8, 0.8)", // Yellow
        borderColor: "#ca8a04",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "⚠️ Overdue",
        data: monthlyData.overdue,
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
        ticks: { 
          color: "#555", 
          stepSize: assignments.length > 0 ? Math.max(1, Math.ceil(Math.max(...monthlyData.completed, ...monthlyData.pending, ...monthlyData.overdue) / 10)) : 1 
        },
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
      {assignments.length === 0 ? (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          height: "100%",
          color: "#666"
        }}>
          <p>No assignment data available</p>
        </div>
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
};

export default AssignmentCompletionTrends;
