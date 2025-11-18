"use client";

import React, { useState, useEffect } from "react";
import RevenueTrend from "../../components/academy/RevenueTrend";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-hot-toast";

interface Student {
  _id: string;
  username: string;
  email: string;
}

interface Tutor {
  _id: string;
  username: string;
  email: string;
}

interface Course {
  _id: string;
  title: string;
}

export default function RevenueManagement() {
  const [activePeriod, setActivePeriod] = useState("This Month");
  const [showAddRevenueModal, setShowAddRevenueModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transactionDate: "",
    validUpto: "",
    studentId: "",
    tutorId: "",
    courseId: "",
    amount: "",
    commission: "",
    status: "Paid",
    paymentMethod: "Cash",
  });

  const periods = ["Today", "This Week", "This Month", "This Quarter", "This Year", "Custom"];

  // Fetch students, tutors, and courses when modal opens
  useEffect(() => {
    if (showAddRevenueModal) {
      fetchStudents();
      fetchTutors();
      fetchCourses();
    }
  }, [showAddRevenueModal]);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/Api/academy/students?page=1&limit=1000");
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await fetch("/Api/academy/tutors");
      const data = await response.json();
      if (data.success) {
        setTutors(data.tutors || []);
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      toast.error("Failed to load tutors");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/Api/tutors/courses");
      const data = await response.json();
      if (data.course) {
        setCourses(data.course || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-calculate commission (15% of amount)
    if (name === "amount" && value) {
      const amount = parseFloat(value);
      if (!isNaN(amount)) {
        const commission = (amount * 0.15).toFixed(2);
        setFormData((prev) => ({ ...prev, commission }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would make an API call to save the transaction
      // For now, we'll just show a success message
      console.log("Form data:", formData);
      
      // TODO: Replace with actual API call
      // const response = await fetch("/Api/academy/revenue", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      toast.success("Revenue transaction added successfully!");
      setShowAddRevenueModal(false);
      setFormData({
        transactionDate: "",
        validUpto: "",
        studentId: "",
        tutorId: "",
        courseId: "",
        amount: "",
        commission: "",
        status: "Paid",
        paymentMethod: "Cash",
      });
    } catch (error) {
      console.error("Error adding revenue:", error);
      toast.error("Failed to add revenue transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowAddRevenueModal(false);
    setFormData({
      transactionDate: "",
      validUpto: "",
      studentId: "",
      tutorId: "",
      courseId: "",
      amount: "",
      commission: "",
      status: "Paid",
      paymentMethod: "Cash",
    });
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif", background: "#f5f5f7", minHeight: "100vh", padding: "30px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", color: "#1a1a1a", margin: 0 }}>Revenue Management</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            style={{
              padding: "12px 24px",
              border: "2px solid #6200EA",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              background: "white",
              color: "#6200EA",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3e5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
            }}
          >
            Export Report
          </button>
          <button
            onClick={() => setShowAddRevenueModal(true)}
            style={{
              padding: "12px 24px",
              border: "2px solid #6200EA",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              background: "white",
              color: "#6200EA",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3e5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
            }}
          >
            Add Revenue
          </button>
          <button
            style={{
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              background: "linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)",
              color: "white",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Revenue Settings
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "25px",
          background: "white",
          padding: "8px",
          borderRadius: "12px",
          width: "fit-content",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: activePeriod === period ? "linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)" : "transparent",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              color: activePeriod === period ? "white" : "#666",
              transition: "all 0.3s",
            }}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                background: "#e8f5e9",
                color: "#2e7d32",
              }}
            >
              ₹
            </div>
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "5px" }}>₹8.42L</div>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>Total Revenue (Oct)</div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600",
              background: "#e8f5e9",
              color: "#2e7d32",
            }}
          >
            ↑ 18.2% vs last month
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                background: "#e3f2fd",
                color: "#1976d2",
              }}
            >
              💳
            </div>
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "5px" }}>₹7.98L</div>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>Collected Revenue</div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600",
              background: "#e8f5e9",
              color: "#2e7d32",
            }}
          >
            95% collection rate
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                background: "#fff3e0",
                color: "#f57c00",
              }}
            >
              ⏳
            </div>
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "5px" }}>₹44K</div>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>Pending Collections</div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600",
              background: "#e8f5e9",
              color: "#2e7d32",
            }}
          >
            ↓ 12% vs last month
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                background: "#f3e5f5",
                color: "#7b1fa2",
              }}
            >
              📈
            </div>
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "5px" }}>₹1.26L</div>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>Academy Commission (15%)</div>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                background: "#e8f5e9",
                color: "#2e7d32",
              }}
            >
              👥
            </div>
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "5px" }}>452</div>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>Active Subscriptions</div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600",
              background: "#e8f5e9",
              color: "#2e7d32",
            }}
          >
            ↑ 8.5%
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "20px" }}>
            Revenue Trend
          </div>
          <RevenueTrend />
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "20px" }}>
            Revenue Breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#666" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#6200EA" }}></div>
                  Tuition Fees
                </div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1a1a1a" }}>₹7.2L</div>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "#e0e0e0",
                  borderRadius: "3px",
                  marginTop: "8px",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "85%", height: "100%", borderRadius: "3px", background: "#6200EA" }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#666" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f093fb" }}></div>
                  Subscriptions
                </div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1a1a1a" }}>₹96K</div>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "#e0e0e0",
                  borderRadius: "3px",
                  marginTop: "8px",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "11%", height: "100%", borderRadius: "3px", background: "#f093fb" }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#666" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#43e97b" }}></div>
                  Other Income
                </div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1a1a1a" }}>₹26K</div>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "#e0e0e0",
                  borderRadius: "3px",
                  marginTop: "8px",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "4%", height: "100%", borderRadius: "3px", background: "#43e97b" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Category */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "20px" }}>
            Top Revenue by Tutor
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "10px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                }}
              >
                SW
              </div>
              <div>
                <div style={{ fontWeight: "600" }}>Sherry Wolf</div>
                <div style={{ fontSize: "12px", color: "#666" }}>30 students</div>
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a" }}>₹1.37L</div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "10px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                }}
              >
                RJ
              </div>
              <div>
                <div style={{ fontWeight: "600" }}>Rahul Joshi</div>
                <div style={{ fontSize: "12px", color: "#666" }}>28 students</div>
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a" }}>₹1.27L</div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "10px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                }}
              >
                PK
              </div>
              <div>
                <div style={{ fontWeight: "600" }}>Priya Kumar</div>
                <div style={{ fontSize: "12px", color: "#666" }}>25 students</div>
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a" }}>₹1.17L</div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "20px" }}>
            Top Revenue by Course
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "10px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                }}
              >
                🎹
              </div>
              <div>
                <div style={{ fontWeight: "600" }}>Piano Basics</div>
                <div style={{ fontSize: "12px", color: "#666" }}>92 enrollments</div>
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a" }}>₹2.76L</div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "10px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                }}
              >
                🎸
              </div>
              <div>
                <div style={{ fontWeight: "600" }}>Guitar Advanced</div>
                <div style={{ fontSize: "12px", color: "#666" }}>68 enrollments</div>
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a" }}>₹2.04L</div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "10px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                }}
              >
                🎤
              </div>
              <div>
                <div style={{ fontWeight: "600" }}>Vocals Beginner</div>
                <div style={{ fontSize: "12px", color: "#666" }}>54 enrollments</div>
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a" }}>₹1.62L</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1", minWidth: "300px", position: "relative" }}>
            <input
              type="text"
              placeholder="Search transactions by student, tutor, or transaction ID..."
              style={{
                width: "100%",
                padding: "12px 40px 12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
            <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }}>
              🔍
            </span>
          </div>

          <select
            style={{
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              cursor: "pointer",
              minWidth: "150px",
            }}
          >
            <option>All Status</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>

          <select
            style={{
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              cursor: "pointer",
              minWidth: "150px",
            }}
          >
            <option>All Tutors</option>
            <option>Sherry Wolf</option>
            <option>Rahul Joshi</option>
            <option>Priya Kumar</option>
          </select>

          <select
            style={{
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              cursor: "pointer",
              minWidth: "150px",
            }}
          >
            <option>Sort by: Recent</option>
            <option>Sort by: Amount</option>
            <option>Sort by: Student</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Transaction ID
              </th>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Date
              </th>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Valid Upto
              </th>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Student
              </th>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tutor
              </th>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Course
              </th>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Amount
              </th>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Commission
              </th>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Status
              </th>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Payment Method
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #f0f0f0" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f9fa"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <td style={{ padding: "16px", fontFamily: "monospace", color: "#666" }}>#TXN-8472</td>
              <td style={{ padding: "16px", color: "#333" }}>Oct 28, 2025</td>
              <td style={{ padding: "16px", color: "#333" }}>Nov 28, 2025</td>
              <td style={{ padding: "16px", color: "#333", fontWeight: "600" }}>Eunice Robel</td>
              <td style={{ padding: "16px", color: "#333" }}>Sherry Wolf</td>
              <td style={{ padding: "16px", color: "#333" }}>Piano Basics</td>
              <td style={{ padding: "16px", color: "#2e7d32", fontWeight: "600" }}>₹4,500</td>
              <td style={{ padding: "16px", color: "#333" }}>₹675</td>
              <td style={{ padding: "16px" }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    fontSize: "12px",
                    background: "#e8f5e9",
                    color: "#2e7d32",
                  }}
                >
                  Paid
                </span>
              </td>
              <td style={{ padding: "16px", color: "#333" }}>UPI</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #f0f0f0" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f9fa"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <td style={{ padding: "16px", fontFamily: "monospace", color: "#666" }}>#TXN-8471</td>
              <td style={{ padding: "16px", color: "#333" }}>Oct 28, 2025</td>
              <td style={{ padding: "16px", color: "#333" }}>Nov 28, 2025</td>
              <td style={{ padding: "16px", color: "#333", fontWeight: "600" }}>James Wilson</td>
              <td style={{ padding: "16px", color: "#333" }}>Rahul Joshi</td>
              <td style={{ padding: "16px", color: "#333" }}>Guitar Advanced</td>
              <td style={{ padding: "16px", color: "#2e7d32", fontWeight: "600" }}>₹5,200</td>
              <td style={{ padding: "16px", color: "#333" }}>₹780</td>
              <td style={{ padding: "16px" }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    fontSize: "12px",
                    background: "#e8f5e9",
                    color: "#2e7d32",
                  }}
                >
                  Paid
                </span>
              </td>
              <td style={{ padding: "16px", color: "#333" }}>Credit Card</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #f0f0f0" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f9fa"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <td style={{ padding: "16px", fontFamily: "monospace", color: "#666" }}>#TXN-8470</td>
              <td style={{ padding: "16px", color: "#333" }}>Oct 27, 2025</td>
              <td style={{ padding: "16px", color: "#333" }}>Nov 27, 2025</td>
              <td style={{ padding: "16px", color: "#333", fontWeight: "600" }}>Sarah Kumar</td>
              <td style={{ padding: "16px", color: "#333" }}>Rahul Joshi</td>
              <td style={{ padding: "16px", color: "#333" }}>Guitar Basics</td>
              <td style={{ padding: "16px", color: "#2e7d32", fontWeight: "600" }}>₹3,800</td>
              <td style={{ padding: "16px", color: "#333" }}>₹570</td>
              <td style={{ padding: "16px" }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    fontSize: "12px",
                    background: "#fff3e0",
                    color: "#f57c00",
                  }}
                >
                  Pending
                </span>
              </td>
              <td style={{ padding: "16px", color: "#333" }}>Net Banking</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #f0f0f0" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f9fa"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <td style={{ padding: "16px", fontFamily: "monospace", color: "#666" }}>#TXN-8469</td>
              <td style={{ padding: "16px", color: "#333" }}>Oct 27, 2025</td>
              <td style={{ padding: "16px", color: "#333" }}>Nov 27, 2025</td>
              <td style={{ padding: "16px", color: "#333", fontWeight: "600" }}>Michael Patel</td>
              <td style={{ padding: "16px", color: "#333" }}>Priya Kumar</td>
              <td style={{ padding: "16px", color: "#333" }}>Vocals Beginner</td>
              <td style={{ padding: "16px", color: "#2e7d32", fontWeight: "600" }}>₹4,000</td>
              <td style={{ padding: "16px", color: "#333" }}>₹600</td>
              <td style={{ padding: "16px" }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    fontSize: "12px",
                    background: "#e8f5e9",
                    color: "#2e7d32",
                  }}
                >
                  Paid
                </span>
              </td>
              <td style={{ padding: "16px", color: "#333" }}>UPI</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #f0f0f0" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f9fa"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <td style={{ padding: "16px", fontFamily: "monospace", color: "#666" }}>#TXN-8468</td>
              <td style={{ padding: "16px", color: "#333" }}>Oct 26, 2025</td>
              <td style={{ padding: "16px", color: "#333" }}>Nov 26, 2025</td>
              <td style={{ padding: "16px", color: "#333", fontWeight: "600" }}>Lisa Singh</td>
              <td style={{ padding: "16px", color: "#333" }}>Aditya Mehta</td>
              <td style={{ padding: "16px", color: "#333" }}>Drums Intermediate</td>
              <td style={{ padding: "16px", color: "#c62828", fontWeight: "600" }}>₹4,600</td>
              <td style={{ padding: "16px", color: "#333" }}>₹690</td>
              <td style={{ padding: "16px" }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    fontSize: "12px",
                    background: "#ffebee",
                    color: "#c62828",
                  }}
                >
                  Failed
                </span>
              </td>
              <td style={{ padding: "16px", color: "#333" }}>Credit Card</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Revenue Modal */}
      <Modal show={showAddRevenueModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Revenue Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Transaction Date <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Valid Upto <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="date"
                  name="validUpto"
                  value={formData.validUpto}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Student Name <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.username}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Tutor <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="tutorId"
                  value={formData.tutorId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Select Tutor</option>
                  {tutors.map((tutor) => (
                    <option key={tutor._id} value={tutor._id}>
                      {tutor.username}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Course <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Amount <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Commission
                </label>
                <input
                  type="number"
                  name="commission"
                  value={formData.commission}
                  onChange={handleInputChange}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: "#f5f5f5",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Status <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Payment Method
                </label>
                <input
                  type="text"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: "#f5f5f5",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <Button variant="secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)",
                  border: "none",
                }}
              >
                {loading ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

