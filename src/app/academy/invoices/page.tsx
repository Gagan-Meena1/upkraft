"use client";

import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "@/styles/style.css";

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tutorFilter, setTutorFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Sample invoice data - replace with actual API call
  const invoices = [
    {
      id: "INV-00124",
      date: "Oct 28, 2025",
      student: "Eunice Robel",
      course: "Piano Basics",
      amount: "₹4,500",
      dueDate: "Nov 04, 2025",
      status: "paid",
    },
    {
      id: "INV-00123",
      date: "Oct 27, 2025",
      student: "James Wilson",
      course: "Guitar Advanced",
      amount: "₹5,200",
      dueDate: "Nov 03, 2025",
      status: "paid",
    },
    {
      id: "INV-00122",
      date: "Oct 27, 2025",
      student: "Sarah Kumar",
      course: "Guitar Basics",
      amount: "₹3,800",
      dueDate: "Nov 02, 2025",
      status: "sent",
    },
    {
      id: "INV-00121",
      date: "Oct 26, 2025",
      student: "Michael Patel",
      course: "Vocals Beginner",
      amount: "₹4,000",
      dueDate: "Nov 01, 2025",
      status: "overdue",
    },
    {
      id: "INV-00120",
      date: "Oct 26, 2025",
      student: "Lisa Singh",
      course: "Drums Intermediate",
      amount: "₹4,600",
      dueDate: "Nov 01, 2025",
      status: "partial",
    },
    {
      id: "INV-00119",
      date: "Oct 25, 2025",
      student: "Arnold Hayes",
      course: "Piano Advanced",
      amount: "₹5,500",
      dueDate: "Oct 31, 2025",
      status: "draft",
    },
    {
      id: "INV-00118",
      date: "Oct 25, 2025",
      student: "Emily Chen",
      course: "Keyboard Basics",
      amount: "₹3,500",
      dueDate: "Oct 30, 2025",
      status: "paid",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { class: "status-draft", text: "📝 Draft" },
      sent: { class: "status-sent", text: "📧 Sent" },
      paid: { class: "status-paid", text: "✓ Paid" },
      overdue: { class: "status-overdue", text: "⚠️ Overdue" },
      partial: { class: "status-partial", text: "⏳ Partial" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`status-badge ${config.class}`}>{config.text}</span>
    );
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.student.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: { value: "₹6.42L", detail: "124 invoices this month" },
    paid: { value: "₹4.85L", detail: "89 invoices paid" },
    pending: { value: "₹1.42L", detail: "28 invoices awaiting" },
    overdue: { value: "₹15,000", detail: "7 invoices overdue" },
  };

  return (
    <div className="invoices-page" style={{ padding: "30px", background: "#f5f5f7", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "32px", color: "#1a1a1a", margin: 0 }}>Invoices</h1>
          <p style={{ color: "#666", marginTop: "5px", margin: 0 }}>Manage and track student invoices</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowFilterModal(true)}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "2px solid #6200EA",
              color: "#6200EA",
              background: "white",
            }}
          >
            📥 Import
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)",
              border: "none",
              color: "white",
            }}
          >
            + Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        {Object.entries(stats).map(([key, stat]) => (
          <div
            key={key}
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "10px", textTransform: "capitalize" }}>
              {key}
            </div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "8px" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "12px", color: "#999" }}>{stat.detail}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "25px",
          background: "white",
          padding: "12px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          width: "fit-content",
        }}
      >
        {["all", "sent", "paid", "overdue", "draft"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: activeTab === tab ? "linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)" : "transparent",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              color: activeTab === tab ? "white" : "#666",
              textTransform: "capitalize",
            }}
          >
            {tab === "all" ? "All Invoices" : tab}
          </button>
        ))}
      </div>

      {/* Filter Section */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "25px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 150px 150px 150px 150px",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search by invoice ID, student name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 35px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
            <span style={{ position: "absolute", left: "10px", color: "#999", fontSize: "16px" }}>🔍</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={tutorFilter}
            onChange={(e) => setTutorFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="all">All Tutors</option>
            <option value="sherry">Sherry Wolf</option>
            <option value="rahul">Rahul Joshi</option>
            <option value="priya">Priya Kumar</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="all">All Courses</option>
            <option value="piano">Piano Basics</option>
            <option value="guitar">Guitar Advanced</option>
            <option value="vocals">Vocals Beginner</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="recent">Sort by: Recent</option>
            <option value="amount">Sort by: Amount</option>
            <option value="dueDate">Sort by: Due Date</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9f9f9" }}>
            <tr>
              <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #eee" }}>
                Invoice ID
              </th>
              <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #eee" }}>
                Date
              </th>
              <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #eee" }}>
                Student
              </th>
              <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #eee" }}>
                Course
              </th>
              <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #eee" }}>
                Amount
              </th>
              <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #eee" }}>
                Due Date
              </th>
              <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #eee" }}>
                Status
              </th>
              <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #eee" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                style={{
                  borderBottom: "1px solid #f5f5f5",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fafafa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <td style={{ padding: "16px", fontSize: "14px" }}>
                  <span style={{ fontFamily: "monospace", color: "#6200EA", fontWeight: 600 }}>{invoice.id}</span>
                </td>
                <td style={{ padding: "16px", fontSize: "14px" }}>{invoice.date}</td>
                <td style={{ padding: "16px", fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
                  {invoice.student}
                </td>
                <td style={{ padding: "16px", fontSize: "14px" }}>{invoice.course}</td>
                <td style={{ padding: "16px", fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
                  {invoice.amount}
                </td>
                <td style={{ padding: "16px", fontSize: "14px" }}>{invoice.dueDate}</td>
                <td style={{ padding: "16px", fontSize: "14px" }}>{getStatusBadge(invoice.status)}</td>
                <td style={{ padding: "16px", fontSize: "14px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #ddd",
                        background: "white",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: "#666",
                      }}
                      title="View"
                    >
                      👁️
                    </button>
                    <button
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #ddd",
                        background: "white",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: "#666",
                      }}
                      title="Download"
                    >
                      ⬇️
                    </button>
                    <button
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #ddd",
                        background: "white",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: "#666",
                      }}
                      title="More"
                    >
                      ⋯
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#333", fontSize: "14px" }}>
              Student
            </label>
            <select
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              <option>Select Student</option>
              <option>Eunice Robel</option>
              <option>James Wilson</option>
              <option>Sarah Kumar</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#333", fontSize: "14px" }}>
              Course/Service
            </label>
            <select
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              <option>Select Course</option>
              <option>Piano Basics - Monthly ₹4,500</option>
              <option>Guitar Advanced - Monthly ₹5,200</option>
              <option>Vocals Beginner - Monthly ₹4,000</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#333", fontSize: "14px" }}>
                Amount
              </label>
              <input
                type="text"
                placeholder="₹ 0.00"
                defaultValue="₹4,500"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#333", fontSize: "14px" }}>
                Due Date
              </label>
              <input
                type="date"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#333", fontSize: "14px" }}>
              Invoice Description
            </label>
            <textarea
              placeholder="November 2025 - Piano Basics Monthly Fee"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                minHeight: "100px",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" />
              <span>Send invoice to student email</span>
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              // Handle create invoice logic here
              setShowCreateModal(false);
            }}
            style={{
              background: "linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)",
              border: "none",
            }}
          >
            Create Invoice
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import Modal */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Import Invoices</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Import functionality will be implemented here.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          gap: 4px;
        }
        .status-draft {
          background: #f0f0f0;
          color: #666;
        }
        .status-sent {
          background: #e3f2fd;
          color: #1976d2;
        }
        .status-paid {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .status-overdue {
          background: #ffebee;
          color: #c62828;
        }
        .status-partial {
          background: #fff3e0;
          color: #e65100;
        }
      `}</style>
    </div>
  );
}




