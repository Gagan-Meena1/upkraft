"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "@/styles/style.css";

// Searchable Dropdown Component
interface SearchableDropdownProps {
  options: Array<{ _id: string; username?: string; title?: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  displayKey: "username" | "title";
  required?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  displayKey,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt._id === value);
  const displayValue = selectedOption ? (selectedOption[displayKey] || "") : "";

  const filteredOptions = options.filter((option) => {
    const searchText = searchTerm.toLowerCase();
    const optionText = (option[displayKey] || "").toLowerCase();
    return optionText.includes(searchText);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "10px",
          border: "2px solid #e0e0e0",
          borderRadius: "8px",
          fontSize: "14px",
          background: "white",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "42px",
        }}
      >
        <span style={{ color: displayValue ? "#333" : "#999" }}>
          {displayValue || placeholder}
        </span>
        <span style={{ color: "#999", fontSize: "12px" }}>{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            marginTop: "4px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ padding: "8px", borderBottom: "1px solid #e0e0e0" }}>
            <input
              type="text"
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              autoFocus
            />
          </div>
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "12px", textAlign: "center", color: "#999", fontSize: "14px" }}>
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const optionText = option[displayKey] || "";
                const isSelected = option._id === value;
                return (
                  <div
                    key={option._id}
                    onClick={() => handleSelect(option._id)}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      background: isSelected ? "#f3e5f5" : "white",
                      color: isSelected ? "#6200EA" : "#333",
                      borderBottom: "1px solid #f0f0f0",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "#f8f9fa";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "white";
                      }
                    }}
                  >
                    {optionText}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      {required && !value && (
        <input
          type="text"
          required
          style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
          tabIndex={-1}
        />
      )}
    </div>
  );
};

interface Student {
  _id: string;
  username: string;
  email: string;
}

interface Course {
  _id: string;
  title: string;
}

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
  isManualEntry?: boolean;
}

export default function PaymentSummaryPage() {
  const [showAddRevenueModal, setShowAddRevenueModal] = useState(false);
  const [showEditRevenueModal, setShowEditRevenueModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<RevenueTransaction | null>(null);
  const [isIndividualTutor, setIsIndividualTutor] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transactionDate: "",
    validUpto: "",
    studentId: "",
    courseId: "",
    amount: "",
    commission: "",
    status: "Paid",
    paymentMethod: "Cash",
  });

  const fetchRevenueTransactions = useCallback(
    async (signal?: AbortSignal) => {
      setTableLoading(true);
      setTableError(null);
      try {
        const response = await fetch("/Api/tutor/revenue", { signal });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch revenue data");
        }

        setTransactions(data.transactions || []);
        // Check if tutor is individual (no academyId) based on response
        setIsIndividualTutor(data.isIndividualTutor || false);
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        const message = error instanceof Error ? error.message : "Unexpected error occurred";
        setTableError(message);
        toast.error(message);
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

  useEffect(() => {
    if (showAddRevenueModal || showEditRevenueModal) {
      fetchStudents();
      fetchCourses();
    }
  }, [showAddRevenueModal, showEditRevenueModal]);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/Api/myStudents");
      const data = await response.json();
      if (data.success && data.filteredUsers) {
        setStudents(data.filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/Api/tutors/courses");
      const data = await response.json();
      if (data.course) {
        setCourses(data.course);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-calculate commission (10% of amount)
    if (name === "amount" && value) {
      const amount = parseFloat(value);
      if (!isNaN(amount)) {
        const commission = (amount * 0.1).toFixed(2);
        setFormData((prev) => ({ ...prev, commission }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/Api/tutor/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          commission: parseFloat(formData.commission || "0"),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to add revenue transaction");
      }

      toast.success("Revenue transaction added successfully!");
      fetchRevenueTransactions();
      setShowAddRevenueModal(false);
      setFormData({
        transactionDate: "",
        validUpto: "",
        studentId: "",
        courseId: "",
        amount: "",
        commission: "",
        status: "Paid",
        paymentMethod: "Cash",
      });
    } catch (error) {
      console.error("Error adding revenue:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add revenue transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowAddRevenueModal(false);
    setShowEditRevenueModal(false);
    setFormData({
      transactionDate: "",
      validUpto: "",
      studentId: "",
      courseId: "",
      amount: "",
      commission: "",
      status: "Paid",
      paymentMethod: "Cash",
    });
  };

  const handleEditClick = (transaction: RevenueTransaction) => {
    setTransactionToEdit(transaction);
    // Format dates for date input (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setFormData({
      transactionDate: formatDateForInput(transaction.paymentDate),
      validUpto: formatDateForInput(transaction.validUpto),
      studentId: transaction.studentId,
      courseId: transaction.courseId,
      amount: transaction.amount.toString(),
      commission: transaction.commission.toString(),
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
    });
    setShowEditRevenueModal(true);
  };

  const handleDeleteClick = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionToEdit) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/Api/tutor/revenue?transactionId=${encodeURIComponent(transactionToEdit.transactionId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          commission: parseFloat(formData.commission || "0"),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update revenue transaction");
      }

      toast.success("Revenue transaction updated successfully!");
      fetchRevenueTransactions();
      setShowEditRevenueModal(false);
      setTransactionToEdit(null);
      setFormData({
        transactionDate: "",
        validUpto: "",
        studentId: "",
        courseId: "",
        amount: "",
        commission: "",
        status: "Paid",
        paymentMethod: "Cash",
      });
    } catch (error) {
      console.error("Error updating revenue:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update revenue transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete") {
      toast.error("Please type 'delete' to confirm");
      return;
    }

    if (!transactionToDelete) return;

    setLoading(true);

    try {
      const response = await fetch(`/Api/tutor/revenue?transactionId=${encodeURIComponent(transactionToDelete)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete revenue transaction");
      }

      toast.success("Revenue transaction deleted successfully!");
      fetchRevenueTransactions();
      setShowDeleteModal(false);
      setTransactionToDelete(null);
      setDeleteConfirmText("");
    } catch (error) {
      console.error("Error deleting revenue:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete revenue transaction");
    } finally {
      setLoading(false);
    }
  };

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
          {/* <p style={{ color: "#666", marginTop: "5px", margin: 0 }}>
            {isIndividualTutor 
              ? "Manage and track your revenue transactions" 
              : "View all revenue transactions where you are involved"}
          </p> */}
        </div>
        {isIndividualTutor && (
          <Button
            variant="primary"
            onClick={() => setShowAddRevenueModal(true)}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)",
              border: "none",
              color: "white",
            }}
          >
            + Create Revenue
          </Button>
        )}
      </div>

      {/* Revenue Table */}
      <RevenueTable
        transactions={transactions}
        tableLoading={tableLoading}
        tableError={tableError}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        getStatusBadgeStyle={getStatusBadgeStyle}
        isIndividualTutor={isIndividualTutor}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Edit Revenue Modal */}
      <Modal show={showEditRevenueModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Revenue Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdateSubmit}>
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
                <SearchableDropdown
                  options={students}
                  value={formData.studentId}
                  onChange={(value) => setFormData((prev) => ({ ...prev, studentId: value }))}
                  placeholder="Select Student"
                  displayKey="username"
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Course <span style={{ color: "red" }}>*</span>
                </label>
                <SearchableDropdown
                  options={courses}
                  value={formData.courseId}
                  onChange={(value) => setFormData((prev) => ({ ...prev, courseId: value }))}
                  placeholder="Select Course"
                  displayKey="title"
                  required
                />
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
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Payment Method <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
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
                {loading ? "Updating..." : "Update Revenue"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Revenue Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ marginBottom: "20px", color: "#666" }}>
            Are you sure you want to delete this revenue transaction? This action cannot be undone.
          </p>
          <p style={{ marginBottom: "15px", fontWeight: "600", color: "#333" }}>
            Type <span style={{ color: "#c62828", fontFamily: "monospace" }}>"delete"</span> to confirm:
          </p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type 'delete' to confirm"
            style={{
              width: "100%",
              padding: "10px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={loading || deleteConfirmText.toLowerCase() !== "delete"}
            style={{
              background: deleteConfirmText.toLowerCase() === "delete" ? "#c62828" : "#ccc",
              border: "none",
            }}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Revenue Modal */}
      <Modal show={showAddRevenueModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Revenue Transaction</Modal.Title>
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
                <SearchableDropdown
                  options={students}
                  value={formData.studentId}
                  onChange={(value) => setFormData((prev) => ({ ...prev, studentId: value }))}
                  placeholder="Select Student"
                  displayKey="username"
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Course <span style={{ color: "red" }}>*</span>
                </label>
                <SearchableDropdown
                  options={courses}
                  value={formData.courseId}
                  onChange={(value) => setFormData((prev) => ({ ...prev, courseId: value }))}
                  placeholder="Select Course"
                  displayKey="title"
                  required
                />
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
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  Payment Method <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
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
                {loading ? "Creating..." : "Create Revenue"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
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
  isIndividualTutor: boolean;
  onEditClick: (transaction: RevenueTransaction) => void;
  onDeleteClick: (transactionId: string) => void;
}

const RevenueTable: React.FC<RevenueTableProps> = ({
  transactions,
  tableLoading,
  tableError,
  formatDate,
  formatCurrency,
  getStatusBadgeStyle,
  isIndividualTutor,
  onEditClick,
  onDeleteClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Search filter
    const matchesSearch =
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || transaction.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case "amount":
        return b.amount - a.amount; // Highest to lowest
      case "student":
        return a.studentName.localeCompare(b.studentName);
      case "recent":
      default:
        return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(); // Most recent first
    }
  });

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
              placeholder="Search transactions by student, tutor, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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
            <option value="recent">Sort by: Recent</option>
            <option value="amount">Sort by: Amount</option>
            <option value="student">Sort by: Student</option>
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
                Student
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
              {isIndividualTutor && (
                <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {tableLoading && (
              <tr>
                <td colSpan={isIndividualTutor ? 10 : 9} style={{ padding: "24px", textAlign: "center", color: "#666", fontWeight: 500 }}>
                  Loading transactions...
                </td>
              </tr>
            )}

            {!tableLoading && tableError && (
              <tr>
                <td colSpan={isIndividualTutor ? 10 : 9} style={{ padding: "24px", textAlign: "center", color: "#c62828", fontWeight: 600 }}>
                  {tableError}
                </td>
              </tr>
            )}

            {!tableLoading && !tableError && sortedTransactions.length === 0 && (
              <tr>
                <td colSpan={isIndividualTutor ? 10 : 9} style={{ padding: "24px", textAlign: "center", color: "#666", fontWeight: 500 }}>
                  No transactions found.
                </td>
              </tr>
            )}

            {!tableLoading &&
              !tableError &&
              sortedTransactions.map((transaction) => {
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
                    <td style={{ padding: "16px", color: "#333", fontWeight: "600" }}>{transaction.studentName || "N/A"}</td>
                    <td style={{ padding: "16px", color: "#333" }}>{transaction.courseTitle || "N/A"}</td>
                    <td style={{ padding: "16px", color: "#2e7d32", fontWeight: "600" }}>{formatCurrency(transaction.amount)}</td>
                    <td style={{ padding: "16px", color: "#333" }}>{formatCurrency(transaction.commission)}</td>
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
                    {isIndividualTutor && (
                      <td style={{ padding: "16px", minWidth: "120px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "flex-start" }}>
                          <button
                            onClick={() => onEditClick(transaction)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "8px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#6200EA",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f3e5f5";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                            title="Edit transaction"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => onDeleteClick(transaction.transactionId)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "8px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#c62828",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#ffebee";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                            title="Delete transaction"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

