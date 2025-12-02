"use client";

import React, { useState, useEffect, useCallback } from "react";
import "@/styles/style.css";

interface RevenueTransaction {
  transactionId: string;
  studentId: string;
  studentName: string;
  tutorId?: string;
  tutorName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  commission: number;
  status: string;
  paymentMethod: string;
  paymentDate: string;
  validUpto: string;
}

export default function PaymentSummaryPage() {
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  const fetchRevenueTransactions = useCallback(
    async (signal?: AbortSignal) => {
      setTableLoading(true);
      setTableError(null);
      try {
        const response = await fetch("/Api/student/revenue", { signal });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch revenue data");
        }

        setTransactions(data.transactions || []);
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        const message = error instanceof Error ? error.message : "Unexpected error occurred";
        setTableError(message);
      } finally {
        setTableLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchRevenueTransactions(controller.signal);
    return () => controller.abort();
  }, [fetchRevenueTransactions]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadgeStyle = (status: string) => {
    const styles: Record<string, { background: string; color: string }> = {
      Paid: { background: "#e8f5e9", color: "#2e7d32" },
      Pending: { background: "#fff3e0", color: "#e65100" },
      Failed: { background: "#ffebee", color: "#c62828" },
    };
    return styles[status] || { background: "#f0f0f0", color: "#666" };
  };

  return (
    <div style={{ padding: "30px", background: "#f5f5f7", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "32px", color: "#1a1a1a", margin: 0 }}>Payment Summary</h1>
          <p style={{ color: "#666", marginTop: "5px", margin: 0 }}>View your payment transactions</p>
        </div>
      </div>

      {/* Revenue Table */}
      <RevenueTable
        transactions={transactions}
        tableLoading={tableLoading}
        tableError={tableError}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        getStatusBadgeStyle={getStatusBadgeStyle}
      />
    </div>
  );
}

// Revenue Table Component
interface RevenueTableProps {
  transactions: RevenueTransaction[];
  tableLoading: boolean;
  tableError: string | null;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusBadgeStyle: (status: string) => { background: string; color: string };
}

const RevenueTable: React.FC<RevenueTableProps> = ({
  transactions,
  tableLoading,
  tableError,
  formatDate,
  formatCurrency,
  getStatusBadgeStyle,
}) => {
  return (
    <div>
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
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1", minWidth: "300px", position: "relative" }}>
            <input
              type="text"
              placeholder="Search transactions by tutor, course, or transaction ID..."
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
            <option>Sort by: Recent</option>
            <option>Sort by: Amount</option>
            <option>Sort by: Course</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
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
                Tutor
              </th>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Course
              </th>
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Amount
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
            {tableLoading && (
              <tr>
                <td colSpan={8} style={{ padding: "24px", textAlign: "center", color: "#666", fontWeight: 500 }}>
                  Loading transactions...
                </td>
              </tr>
            )}

            {!tableLoading && tableError && (
              <tr>
                <td colSpan={8} style={{ padding: "24px", textAlign: "center", color: "#c62828", fontWeight: 600 }}>
                  {tableError}
                </td>
              </tr>
            )}

            {!tableLoading && !tableError && transactions.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "24px", textAlign: "center", color: "#666", fontWeight: 500 }}>
                  No transactions found.
                </td>
              </tr>
            )}

            {!tableLoading &&
              !tableError &&
              transactions.map((transaction) => {
                const statusStyle = getStatusBadgeStyle(transaction.status);
                return (
                  <tr
                    key={transaction.transactionId}
                    style={{ borderBottom: "1px solid #f0f0f0" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={{ padding: "16px", fontFamily: "monospace", color: "#666" }}>{transaction.transactionId}</td>
                    <td style={{ padding: "16px", color: "#333" }}>{formatDate(transaction.paymentDate)}</td>
                    <td style={{ padding: "16px", color: "#333" }}>{formatDate(transaction.validUpto)}</td>
                    <td style={{ padding: "16px", color: "#333", fontWeight: "600" }}>{transaction.tutorName || "N/A"}</td>
                    <td style={{ padding: "16px", color: "#333" }}>{transaction.courseTitle || "N/A"}</td>
                    <td style={{ padding: "16px", color: "#2e7d32", fontWeight: "600" }}>{formatCurrency(transaction.amount)}</td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontWeight: "600",
                          fontSize: "12px",
                          background: statusStyle.background,
                          color: statusStyle.color,
                        }}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px", color: "#333" }}>{transaction.paymentMethod}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

