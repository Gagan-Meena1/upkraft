"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import RevenueTrend from "../../components/academy/RevenueTrend";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";

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

interface Tutor {
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

export default function RevenueManagement() {
  const [activePeriod, setActivePeriod] = useState("This Month");
  const [showAddRevenueModal, setShowAddRevenueModal] = useState(false);
  const [showEditRevenueModal, setShowEditRevenueModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<RevenueTransaction | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
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

  const fetchRevenueTransactions = useCallback(
    async (signal?: AbortSignal) => {
      setTableLoading(true);
      setTableError(null);
      try {
        const response = await fetch("/Api/academy/revenue", { signal });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch revenue data");
        }

        setTransactions(data.transactions || []);
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

  // Fetch students, tutors, and courses when modal opens
  useEffect(() => {
    if (showAddRevenueModal || showEditRevenueModal) {
      fetchStudents();
      fetchTutors();
      fetchCourses();
    }
  }, [showAddRevenueModal, showEditRevenueModal]);

  useEffect(() => {
    const controller = new AbortController();
    fetchRevenueTransactions(controller.signal);
    return () => controller.abort();
  }, [fetchRevenueTransactions]);

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

  const fetchTutorForCourse = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      const response = await fetch(`/Api/tutors/courses/${courseId}`);
      const data = await response.json();
      
      if (data.courseDetails) {
        const course = data.courseDetails;
        // Try to get tutor from course.instructorId first, then academyInstructorId
        let tutorId = course.instructorId;
        
        // If no instructorId, try to get from academyInstructorId array (get first one)
        if (!tutorId && course.academyInstructorId && course.academyInstructorId.length > 0) {
          tutorId = course.academyInstructorId[0];
        }
        
        if (tutorId) {
          const tutorIdString = tutorId.toString();
          // Check if tutor exists in the tutors list
          let tutor = tutors.find((t) => t._id === tutorIdString);
          
          if (tutor) {
            // Tutor is already in the list, just set it
            setFormData((prev) => ({ ...prev, tutorId: tutorIdString }));
          } else {
            // Tutor not in list, fetch it and add to the list
            try {
              const tutorResponse = await fetch(`/Api/users/user?id=${tutorIdString}`);
              const tutorData = await tutorResponse.json();
              
              if (tutorData.success && tutorData.user) {
                const fetchedTutor = {
                  _id: tutorData.user._id,
                  username: tutorData.user.username,
                  email: tutorData.user.email || "",
                };
                // Add tutor to the tutors list
                setTutors((prev) => {
                  // Check if tutor already exists to avoid duplicates
                  if (prev.find((t) => t._id === fetchedTutor._id)) {
                    return prev;
                  }
                  return [...prev, fetchedTutor];
                });
                // Set the tutor in form data
                setFormData((prev) => ({ ...prev, tutorId: tutorIdString }));
              }
            } catch (error) {
              console.error("Error fetching tutor details:", error);
              // Still set the tutorId even if fetch fails (backend will validate)
              setFormData((prev) => ({ ...prev, tutorId: tutorIdString }));
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    
    // Auto-fill tutor when course is selected
    if (name === "courseId" && value) {
      await fetchTutorForCourse(value);
    }
  };

  const formatDate = (value: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const statusBadgeStyles: Record<string, { background: string; color: string }> = {
    Paid: { background: "#e8f5e9", color: "#2e7d32" },
    Pending: { background: "#fff3e0", color: "#f57c00" },
    Failed: { background: "#ffebee", color: "#c62828" },
  };

  const getStatusBadgeStyle = (status: string) => statusBadgeStyles[status] || { background: "#e0e0e0", color: "#424242" };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        commission: Number(formData.commission || 0),
      };

      const response = await fetch("/Api/academy/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        tutorId: "",
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
      tutorId: "",
      courseId: "",
      amount: "",
      commission: "",
      status: "Paid",
      paymentMethod: "Cash",
    });
  };

  const handleEditClick = (transaction: RevenueTransaction) => {
    if (!transaction.isManualEntry) {
      toast.error("Only academy-created transactions can be edited");
      return;
    }
    setTransactionToEdit(transaction);
    // Format dates for input fields (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    };
    setFormData({
      transactionDate: formatDateForInput(transaction.paymentDate),
      validUpto: formatDateForInput(transaction.validUpto),
      studentId: transaction.studentId,
      tutorId: transaction.tutorId || "",
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

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete") {
      toast.error('Please type "delete" to confirm');
      return;
    }

    if (!transactionToDelete) {
      toast.error("Transaction ID is missing");
      return;
    }

    setLoading(true);
    try {
      const encodedTransactionId = encodeURIComponent(transactionToDelete);
      const response = await fetch(`/Api/academy/revenue?transactionId=${encodedTransactionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete transaction");
      }

      toast.success("Transaction deleted successfully!");
      fetchRevenueTransactions();
      setShowDeleteModal(false);
      setTransactionToDelete(null);
      setDeleteConfirmText("");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionToEdit) return;

    setLoading(true);

    try {
      const payload = {
        transactionId: transactionToEdit.transactionId,
        ...formData,
        amount: Number(formData.amount),
        commission: Number(formData.commission || 0),
      };

      const response = await fetch("/Api/academy/revenue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        tutorId: "",
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
              <th style={{ textAlign: "left", padding: "16px", background: "#f8f9fa", color: "#666", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: "120px", whiteSpace: "nowrap" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {tableLoading && (
              <tr>
                <td colSpan={11} style={{ padding: "24px", textAlign: "center", color: "#666", fontWeight: 500 }}>
                  Loading transactions...
                </td>
              </tr>
            )}

            {!tableLoading && tableError && (
              <tr>
                <td colSpan={11} style={{ padding: "24px", textAlign: "center", color: "#c62828", fontWeight: 600 }}>
                  {tableError}
                </td>
              </tr>
            )}

            {!tableLoading && !tableError && transactions.length === 0 && (
              <tr>
                <td colSpan={11} style={{ padding: "24px", textAlign: "center", color: "#666", fontWeight: 500 }}>
                  No transactions found for the selected filters.
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
                    <td style={{ padding: "16px", color: "#333", fontWeight: "600" }}>{transaction.studentName || "N/A"}</td>
                    <td style={{ padding: "16px", color: "#333" }}>{transaction.tutorName || "N/A"}</td>
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
                    <td style={{ padding: "16px", minWidth: "120px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "flex-start" }}>
                        <button
                          onClick={() => handleEditClick(transaction)}
                          disabled={!transaction.isManualEntry}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: transaction.isManualEntry ? "pointer" : "not-allowed",
                            padding: "8px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: transaction.isManualEntry ? "#6200EA" : "#ccc",
                            transition: "all 0.2s",
                            opacity: transaction.isManualEntry ? 1 : 0.5,
                          }}
                          onMouseEnter={(e) => {
                            if (transaction.isManualEntry) {
                              e.currentTarget.style.background = "#f3e5f5";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (transaction.isManualEntry) {
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                          title={transaction.isManualEntry ? "Edit transaction" : "Only academy-created transactions can be edited"}
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(transaction.transactionId)}
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
                  </tr>
                );
              })}
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
                  Tutor <span style={{ color: "red" }}>*</span>
                </label>
                <SearchableDropdown
                  options={tutors}
                  value={formData.tutorId}
                  onChange={(value) => setFormData((prev) => ({ ...prev, tutorId: value }))}
                  placeholder="Select Tutor"
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
                  onChange={async (value) => {
                    setFormData((prev) => ({ ...prev, courseId: value }));
                    // Auto-fill tutor when course is selected
                    if (value) {
                      await fetchTutorForCourse(value);
                    }
                  }}
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
                  <option value="Pending">Pending</option>
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
                {loading ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

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
                  Tutor <span style={{ color: "red" }}>*</span>
                </label>
                <SearchableDropdown
                  options={tutors}
                  value={formData.tutorId}
                  onChange={(value) => setFormData((prev) => ({ ...prev, tutorId: value }))}
                  placeholder="Select Tutor"
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
                  onChange={async (value) => {
                    setFormData((prev) => ({ ...prev, courseId: value }));
                    // Auto-fill tutor when course is selected
                    if (value) {
                      await fetchTutorForCourse(value);
                    }
                  }}
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
                {loading ? "Updating..." : "Update Transaction"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#333", marginBottom: "16px" }}>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
              Type <strong style={{ color: "#c62828" }}>"delete"</strong> to confirm:
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
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading}>
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
    </div>
  );
}

