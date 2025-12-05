"use client";
import React, { useState, useEffect } from "react";
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
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Students",
        data: [],
        backgroundColor: "#4201EB",
        borderColor: "#f2f2f2",
        borderWidth: 1,
      },
      {
        label: "Tutors",
        data: [],
        backgroundColor: "#7109B9",
        borderColor: "#f2f2f2",
        borderWidth: 1,
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [yAxisMax, setYAxisMax] = useState(50);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all students
        const studentsResponse = await fetch("/Api/academy/students?page=1&limit=10000", {
          method: "GET",
          credentials: "include",
        });

        // Fetch all tutors
        const tutorsResponse = await fetch("/Api/academy/tutors", {
          method: "GET",
          credentials: "include",
        });

        if (!studentsResponse.ok || !tutorsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const studentsData = await studentsResponse.json();
        const tutorsData = await tutorsResponse.json();

        const students = studentsData?.success ? studentsData.students || [] : [];
        const tutors = tutorsData?.success ? tutorsData.tutors || [] : [];

        // Get last 12 months
        const now = new Date();
        const months = [];
        const monthLabels = [];
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
          
          months.push({ start: monthStart, end: monthEnd });
          
          // Format month label (e.g., "Jan", "Feb")
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          monthLabels.push(monthNames[date.getMonth()]);
        }

        // Count students joined per month
        const studentsCount = months.map((month) => {
          return students.filter((student) => {
            if (!student.createdAt) return false;
            const createdAt = new Date(student.createdAt);
            return createdAt >= month.start && createdAt <= month.end;
          }).length;
        });

        // Count tutors joined per month
        const tutorsCount = months.map((month) => {
          return tutors.filter((tutor) => {
            if (!tutor.createdAt) return false;
            const createdAt = new Date(tutor.createdAt);
            return createdAt >= month.start && createdAt <= month.end;
          }).length;
        });

        // Calculate max value for y-axis (at least 50 to show up to 45+)
        const maxDataValue = Math.max(...studentsCount, ...tutorsCount, 0);
        const calculatedMax = Math.max(50, Math.ceil((maxDataValue + 5) / 5) * 5);
        setYAxisMax(calculatedMax);

        setChartData({
          labels: monthLabels,
          datasets: [
            {
              label: "Students",
              data: studentsCount,
              backgroundColor: "#4201EB",
              borderColor: "#f2f2f2",
              borderWidth: 1,
            },
            {
              label: "Tutors",
              data: tutorsCount,
              backgroundColor: "#7109B9",
              borderColor: "#f2f2f2",
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
        // Set empty data on error
        setYAxisMax(50);
        setChartData({
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Students",
              data: Array(12).fill(0),
              backgroundColor: "#4201EB",
              borderColor: "#f2f2f2",
              borderWidth: 1,
            },
            {
              label: "Tutors",
              data: Array(12).fill(0),
              backgroundColor: "#7109B9",
              borderColor: "#f2f2f2",
              borderWidth: 1,
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        text: "Monthly Joining Trends (Last 12 Months)",
        font: { size: 18 },
        color: "#222",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: yAxisMax,
        ticks: { 
          stepSize: 5, 
          color: "#444",
          precision: 0,
          callback: function(value) {
            return value;
          }
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: { color: "#444" },
        grid: { display: false },
      },
    },
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "400px",
          margin: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading chart data...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "400px", 
        margin: "auto",
      }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default StudentTutorChart;
