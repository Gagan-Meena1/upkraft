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
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [tempDateRange, setTempDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: "", endDate: "" });
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
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [lastPeriodRevenue, setLastPeriodRevenue] = useState<number>(0);
  const [revenuePercentageChange, setRevenuePercentageChange] = useState<number | null>(null);
  const [collectedRevenue, setCollectedRevenue] = useState<number>(0);
  const [collectionRate, setCollectionRate] = useState<number>(0);
  const [pendingRevenue, setPendingRevenue] = useState<number>(0);
  const [lastPeriodPendingRevenue, setLastPeriodPendingRevenue] = useState<number>(0);
  const [pendingPercentageChange, setPendingPercentageChange] = useState<number | null>(null);
  const [academyCommission, setAcademyCommission] = useState<number>(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState<number>(0);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState<boolean>(false);
  const [topTutorsByRevenue, setTopTutorsByRevenue] = useState<Array<{
    tutorId: string;
    tutorName: string;
    revenue: number;
    studentCount: number;
  }>>([]);
  const [topCoursesByRevenue, setTopCoursesByRevenue] = useState<Array<{
    courseId: string;
    courseTitle: string;
    revenue: number;
    enrollmentCount: number;
  }>>([]);
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
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>([]);
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<string>("");

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

  // Fetch payment methods settings
  const fetchPaymentMethods = useCallback(async (setPreferredAsDefault: boolean = false) => {
    try {
      const response = await fetch("/Api/academy/paymentMethods", {
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        console.error("Failed to fetch payment methods:", response.status, response.statusText);
        // Set default methods if API fails
        setAvailablePaymentMethods(['Cash', 'UPI', 'Net Banking', 'Credit Card']);
        return;
      }

      const data = await response.json();
      console.log("Payment methods API response:", data);
      
      if (data.success && data.paymentMethods?.selectedMethods) {
        // Map payment methods: "Card" -> "Credit Card" for display
        const mappedMethods = data.paymentMethods.selectedMethods.map((method: string) => 
          method === 'Card' ? 'Credit Card' : method
        );
        console.log("Mapped payment methods:", mappedMethods);
        setAvailablePaymentMethods(mappedMethods);
        
        // Map preferredMethod: "Card" -> "Credit Card" for display
        const mappedPreferredMethod = data.paymentMethods.preferredMethod === 'Card' 
          ? 'Credit Card' 
          : data.paymentMethods.preferredMethod || '';
        setPreferredPaymentMethod(mappedPreferredMethod);
        console.log("Preferred payment method (mapped):", mappedPreferredMethod);
        
        // Set default payment method
        setFormData(prev => {
          let defaultMethod;
          
          if (setPreferredAsDefault && mappedPreferredMethod && mappedMethods.includes(mappedPreferredMethod)) {
            // Use preferred method when opening Add Revenue modal
            defaultMethod = mappedPreferredMethod;
            console.log("Setting preferred method as default:", defaultMethod);
          } else if (!mappedMethods.includes(prev.paymentMethod)) {
            // Use preferred method if available, otherwise first method
            defaultMethod = mappedPreferredMethod && mappedMethods.includes(mappedPreferredMethod)
              ? mappedPreferredMethod
              : (mappedMethods.length > 0 ? mappedMethods[0] : prev.paymentMethod);
          } else {
            // Keep current method if it's still available
            return prev;
          }
          
          return { ...prev, paymentMethod: defaultMethod };
        });
      } else {
        console.warn("Payment methods data structure unexpected:", data);
        // Set default methods if data structure is unexpected
        setAvailablePaymentMethods(['Cash', 'UPI', 'Net Banking', 'Credit Card']);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      // Set default methods on error
      setAvailablePaymentMethods(['Cash', 'UPI', 'Net Banking', 'Credit Card']);
    }
  }, []);

  // Fetch payment methods on mount and when modal opens
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Refetch payment methods when modal opens and set preferred method
  useEffect(() => {
    if (showAddRevenueModal) {
      // When opening Add Revenue modal, fetch and set preferred method as default
      fetchPaymentMethods(true);
    }
    if (showEditRevenueModal) {
      // When opening Edit Revenue modal, just fetch methods (don't change the existing payment method)
      fetchPaymentMethods(false);
    }
  }, [showAddRevenueModal, showEditRevenueModal, fetchPaymentMethods]);

  // Fetch active subscriptions (active tutors + total students)
  const fetchActiveSubscriptions = useCallback(async () => {
    setIsLoadingSubscriptions(true);
    try {
      // Fetch tutors
      const tutorsResponse = await fetch("/Api/academy/tutors", {
        method: "GET",
        credentials: "include",
      });

      // Fetch students count
      const studentsResponse = await fetch("/Api/academy/students?page=1&limit=1", {
        method: "GET",
        credentials: "include",
      });

      let activeTutorsCount = 0;
      let totalStudentsCount = 0;

      if (tutorsResponse.ok) {
        const tutorsData = await tutorsResponse.json();
        if (tutorsData.success && Array.isArray(tutorsData.tutors)) {
          // Count active tutors (verified tutors)
          activeTutorsCount = tutorsData.tutors.filter((tutor: any) => tutor.isVerified).length;
        }
      }

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        if (studentsData.success && studentsData.pagination) {
          totalStudentsCount = studentsData.pagination.totalStudents || 0;
        }
      }

      // Total active subscriptions = active tutors + total students
      setActiveSubscriptions(activeTutorsCount + totalStudentsCount);
    } catch (error) {
      console.error("Error fetching active subscriptions:", error);
      setActiveSubscriptions(0);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveSubscriptions();
  }, [fetchActiveSubscriptions]);

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

  // Get initials from name
  const getInitials = (name: string): string => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get course icon emoji based on course title
  const getCourseIcon = (courseTitle: string): string => {
    if (!courseTitle) return "📖";
    const title = courseTitle.toLowerCase();
    if (title.includes("piano") || title.includes("keyboard")) return "🎹";
    if (title.includes("guitar")) return "🎸";
    if (title.includes("vocals") || title.includes("singing") || title.includes("voice")) return "🎤";
    if (title.includes("violin")) return "🎻";
    if (title.includes("drums") || title.includes("drum")) return "🥁";
    if (title.includes("dance")) return "💃";
    if (title.includes("art") || title.includes("drawing") || title.includes("painting")) return "🎨";
    if (title.includes("math") || title.includes("mathematics")) return "📐";
    if (title.includes("science")) return "🔬";
    if (title.includes("english") || title.includes("language")) return "📚";
    return "📖"; // Default icon
  };

  // Gradient colors for tutor avatars
  const avatarGradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  ];

  // Format revenue amount (convert to lakhs if >= 100000, otherwise show in thousands)
  const formatRevenue = (amount: number | null): string => {
    if (amount === null || amount === 0) return "₹0";
    if (amount >= 100000) {
      const lakhs = amount / 100000;
      return `₹${lakhs.toFixed(2)}L`;
    } else if (amount >= 1000) {
      const thousands = amount / 1000;
      return `₹${thousands.toFixed(1)}K`;
    } else {
      return `₹${amount.toFixed(0)}`;
    }
  };

  // Calculate revenue based on active period
  const calculateRevenue = useCallback(() => {
    if (!transactions || transactions.length === 0) {
      setTotalRevenue(0);
      setLastPeriodRevenue(0);
      setRevenuePercentageChange(null);
      setCollectedRevenue(0);
      setCollectionRate(0);
      setPendingRevenue(0);
      setLastPeriodPendingRevenue(0);
      setPendingPercentageChange(null);
      setAcademyCommission(0);
      return;
    }

    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;
    let lastPeriodStart: Date;
    let lastPeriodEnd: Date;
    let periodLabel: string;

    switch (activePeriod) {
      case "Today":
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        lastPeriodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        lastPeriodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodLabel = "Today";
        break;
      case "This Week":
        const dayOfWeek = now.getDay();
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
        lastPeriodStart = new Date(periodStart);
        lastPeriodStart.setDate(lastPeriodStart.getDate() - 7);
        lastPeriodEnd = new Date(periodStart);
        periodLabel = "This Week";
        break;
      case "This Month":
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        lastPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        lastPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        periodLabel = now.toLocaleDateString("en-US", { month: "short" });
        break;
      case "This Quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        periodStart = new Date(now.getFullYear(), quarter * 3, 1);
        periodEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
        lastPeriodStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
        lastPeriodEnd = new Date(now.getFullYear(), quarter * 3, 1);
        periodLabel = `Q${quarter + 1}`;
        break;
      case "This Year":
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(now.getFullYear() + 1, 0, 1);
        lastPeriodStart = new Date(now.getFullYear() - 1, 0, 1);
        lastPeriodEnd = new Date(now.getFullYear(), 0, 1);
        periodLabel = now.getFullYear().toString();
        break;
      case "Custom":
        if (customDateRange && customDateRange.startDate && customDateRange.endDate) {
          periodStart = new Date(customDateRange.startDate);
          periodEnd = new Date(customDateRange.endDate);
          periodEnd.setHours(23, 59, 59, 999); // Include the entire end date
          
          // Calculate previous period (same duration before start date)
          const periodDuration = periodEnd.getTime() - periodStart.getTime();
          lastPeriodEnd = new Date(periodStart);
          lastPeriodEnd.setDate(lastPeriodEnd.getDate() - 1);
          lastPeriodEnd.setHours(23, 59, 59, 999);
          lastPeriodStart = new Date(lastPeriodEnd.getTime() - periodDuration);
          
          periodLabel = `${periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${periodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        } else {
          // Default to This Month if custom range not set
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          lastPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          lastPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 1);
          periodLabel = now.toLocaleDateString("en-US", { month: "short" });
        }
        break;
      default:
        // Default to This Month
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        lastPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        lastPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        periodLabel = now.toLocaleDateString("en-US", { month: "short" });
    }

    // Calculate total revenue for current period (all statuses)
    const totalPeriodRevenue = transactions
      .filter((transaction) => {
        if (!transaction.paymentDate) return false;
        const paymentDate = new Date(transaction.paymentDate);
        return paymentDate >= periodStart && paymentDate < periodEnd;
      })
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

    // Calculate collected revenue for current period (only "Paid" status)
    const currentPeriodRevenue = transactions
      .filter((transaction) => {
        if (!transaction.paymentDate || transaction.status !== "Paid") return false;
        const paymentDate = new Date(transaction.paymentDate);
        return paymentDate >= periodStart && paymentDate < periodEnd;
      })
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

    // Calculate revenue for last period
    const previousPeriodRevenue = transactions
      .filter((transaction) => {
        if (!transaction.paymentDate || transaction.status !== "Paid") return false;
        const paymentDate = new Date(transaction.paymentDate);
        return paymentDate >= lastPeriodStart && paymentDate < lastPeriodEnd;
      })
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

    setTotalRevenue(currentPeriodRevenue);
    setLastPeriodRevenue(previousPeriodRevenue);
    setCollectedRevenue(currentPeriodRevenue);

    // Calculate collection rate
    let rate = 0;
    if (totalPeriodRevenue > 0) {
      rate = (currentPeriodRevenue / totalPeriodRevenue) * 100;
    }
    setCollectionRate(rate);

    // Calculate pending revenue for current period (Pending or Failed status)
    const currentPeriodPendingRevenue = transactions
      .filter((transaction) => {
        if (!transaction.paymentDate) return false;
        const paymentDate = new Date(transaction.paymentDate);
        const isInPeriod = paymentDate >= periodStart && paymentDate < periodEnd;
        const isPending = transaction.status === "Pending" || transaction.status === "Failed";
        return isInPeriod && isPending;
      })
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

    // Calculate pending revenue for last period
    const previousPeriodPendingRevenue = transactions
      .filter((transaction) => {
        if (!transaction.paymentDate) return false;
        const paymentDate = new Date(transaction.paymentDate);
        const isInPeriod = paymentDate >= lastPeriodStart && paymentDate < lastPeriodEnd;
        const isPending = transaction.status === "Pending" || transaction.status === "Failed";
        return isInPeriod && isPending;
      })
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

    setPendingRevenue(currentPeriodPendingRevenue);
    setLastPeriodPendingRevenue(previousPeriodPendingRevenue);

    // Calculate pending percentage change
    let pendingPercentageChange: number | null = null;
    if (previousPeriodPendingRevenue > 0) {
      pendingPercentageChange = ((currentPeriodPendingRevenue - previousPeriodPendingRevenue) / previousPeriodPendingRevenue) * 100;
    } else if (currentPeriodPendingRevenue > 0) {
      pendingPercentageChange = 100;
    } else if (previousPeriodPendingRevenue > 0 && currentPeriodPendingRevenue === 0) {
      pendingPercentageChange = -100;
    }
    setPendingPercentageChange(pendingPercentageChange);

    // Calculate academy commission for current period (sum of commission from Paid transactions)
    const currentPeriodCommission = transactions
      .filter((transaction) => {
        if (!transaction.paymentDate || transaction.status !== "Paid") return false;
        const paymentDate = new Date(transaction.paymentDate);
        return paymentDate >= periodStart && paymentDate < periodEnd;
      })
      .reduce((sum, transaction) => sum + (Number(transaction.commission) || 0), 0);

    setAcademyCommission(currentPeriodCommission);

    // Calculate percentage change
    let percentageChange: number | null = null;
    if (previousPeriodRevenue > 0) {
      percentageChange = ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;
    } else if (currentPeriodRevenue > 0) {
      percentageChange = 100;
    }

    setRevenuePercentageChange(percentageChange);
  }, [transactions, activePeriod, customDateRange]);

  // Calculate revenue whenever transactions or activePeriod changes
  useEffect(() => {
    calculateRevenue();
  }, [calculateRevenue]);

  // Calculate top tutors by revenue
  const calculateTopTutorsByRevenue = useCallback(async () => {
    if (!transactions || transactions.length === 0) {
      setTopTutorsByRevenue([]);
      return;
    }

    // Get period dates based on activePeriod
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (activePeriod) {
      case "Today":
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "This Week":
        const dayOfWeek = now.getDay();
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;
      case "This Month":
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "This Quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        periodStart = new Date(now.getFullYear(), quarter * 3, 1);
        periodEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
        break;
      case "This Year":
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case "Custom":
        if (customDateRange && customDateRange.startDate && customDateRange.endDate) {
          periodStart = new Date(customDateRange.startDate);
          periodEnd = new Date(customDateRange.endDate);
          periodEnd.setHours(23, 59, 59, 999);
        } else {
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }
        break;
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Group transactions by tutor and calculate revenue for the selected period
    const tutorRevenueMap = new Map<string, { tutorName: string; revenue: number }>();

    transactions.forEach((transaction) => {
      if (!transaction.tutorId || transaction.status !== "Paid" || !transaction.paymentDate) return;

      const paymentDate = new Date(transaction.paymentDate);
      if (paymentDate < periodStart || paymentDate >= periodEnd) return;

      const tutorId = transaction.tutorId.toString();
      const current = tutorRevenueMap.get(tutorId) || { tutorName: transaction.tutorName || "Unknown", revenue: 0 };
      current.revenue += Number(transaction.amount) || 0;
      tutorRevenueMap.set(tutorId, current);
    });

    // Convert to array and sort by revenue
    const tutorsWithRevenue = Array.from(tutorRevenueMap.entries())
      .map(([tutorId, data]) => ({
        tutorId,
        tutorName: data.tutorName,
        revenue: data.revenue,
        studentCount: 0, // Will be fetched
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3); // Top 3

    // Fetch student counts for each tutor
    try {
      const tutorsResponse = await fetch("/Api/academy/tutors", {
        method: "GET",
        credentials: "include",
      });

      if (tutorsResponse.ok) {
        const tutorsData = await tutorsResponse.json();
        if (tutorsData.success && Array.isArray(tutorsData.tutors)) {
          const tutorsMap = new Map(tutorsData.tutors.map((tutor: any) => [tutor._id, tutor]));

          // Update student counts
          const tutorsWithStudentCounts = tutorsWithRevenue.map((tutor) => {
            const tutorData = tutorsMap.get(tutor.tutorId);
            return {
              ...tutor,
              studentCount: tutorData?.studentCount || 0,
            };
          });

          setTopTutorsByRevenue(tutorsWithStudentCounts);
        } else {
          setTopTutorsByRevenue(tutorsWithRevenue);
        }
      } else {
        setTopTutorsByRevenue(tutorsWithRevenue);
      }
    } catch (error) {
      console.error("Error fetching tutor student counts:", error);
      setTopTutorsByRevenue(tutorsWithRevenue);
    }
  }, [transactions, activePeriod, customDateRange]);

  useEffect(() => {
    calculateTopTutorsByRevenue();
  }, [calculateTopTutorsByRevenue]);

  // Calculate top courses by revenue
  const calculateTopCoursesByRevenue = useCallback(() => {
    if (!transactions || transactions.length === 0) {
      setTopCoursesByRevenue([]);
      return;
    }

    // Get period dates based on activePeriod
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (activePeriod) {
      case "Today":
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "This Week":
        const dayOfWeek = now.getDay();
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;
      case "This Month":
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "This Quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        periodStart = new Date(now.getFullYear(), quarter * 3, 1);
        periodEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
        break;
      case "This Year":
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case "Custom":
        if (customDateRange && customDateRange.startDate && customDateRange.endDate) {
          periodStart = new Date(customDateRange.startDate);
          periodEnd = new Date(customDateRange.endDate);
          periodEnd.setHours(23, 59, 59, 999);
        } else {
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }
        break;
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Group transactions by course and calculate revenue and enrollment count
    const courseRevenueMap = new Map<string, { courseTitle: string; revenue: number; enrollmentCount: number }>();

    transactions.forEach((transaction) => {
      if (!transaction.courseId || transaction.status !== "Paid" || !transaction.paymentDate) return;

      const paymentDate = new Date(transaction.paymentDate);
      if (paymentDate < periodStart || paymentDate >= periodEnd) return;

      const courseId = transaction.courseId.toString();
      const current = courseRevenueMap.get(courseId) || {
        courseTitle: transaction.courseTitle || "Unknown Course",
        revenue: 0,
        enrollmentCount: 0,
      };
      current.revenue += Number(transaction.amount) || 0;
      current.enrollmentCount += 1; // Count each transaction as an enrollment
      courseRevenueMap.set(courseId, current);
    });

    // Convert to array and sort by revenue
    const coursesWithRevenue = Array.from(courseRevenueMap.entries())
      .map(([courseId, data]) => ({
        courseId,
        courseTitle: data.courseTitle,
        revenue: data.revenue,
        enrollmentCount: data.enrollmentCount,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3); // Top 3

    setTopCoursesByRevenue(coursesWithRevenue);
  }, [transactions, activePeriod, customDateRange]);

  useEffect(() => {
    calculateTopCoursesByRevenue();
  }, [calculateTopCoursesByRevenue]);

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
    // Map "Card" to "Credit Card" for display
    const displayPaymentMethod = transaction.paymentMethod === "Card" ? "Credit Card" : transaction.paymentMethod;
    
    setFormData({
      transactionDate: formatDateForInput(transaction.paymentDate),
      validUpto: formatDateForInput(transaction.validUpto),
      studentId: transaction.studentId,
      tutorId: transaction.tutorId || "",
      courseId: transaction.courseId,
      amount: transaction.amount.toString(),
      commission: transaction.commission.toString(),
      status: transaction.status,
      paymentMethod: displayPaymentMethod,
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
            onClick={() => {
              if (period === "Custom") {
                // Initialize temp date range with current custom range or default to current month
                if (customDateRange) {
                  setTempDateRange(customDateRange);
                } else {
                  const now = new Date();
                  const start = new Date(now.getFullYear(), now.getMonth(), 1);
                  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                  setTempDateRange({
                    startDate: start.toISOString().split("T")[0],
                    endDate: end.toISOString().split("T")[0],
                  });
                }
                setShowCustomDateModal(true);
              } else {
                setActivePeriod(period);
                setCustomDateRange(null);
              }
            }}
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
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "5px" }}>
            {formatRevenue(totalRevenue)}
          </div>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>
            Total Revenue{" "}
            {activePeriod === "This Month"
              ? `(${new Date().toLocaleDateString("en-US", { month: "short" })})`
              : activePeriod === "This Year"
              ? `(${new Date().getFullYear()})`
              : activePeriod === "Custom" && customDateRange
              ? `(${new Date(customDateRange.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(customDateRange.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
              : `(${activePeriod})`}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600",
              background: revenuePercentageChange !== null && revenuePercentageChange >= 0 ? "#e8f5e9" : "#ffebee",
              color: revenuePercentageChange !== null && revenuePercentageChange >= 0 ? "#2e7d32" : "#c62828",
            }}
          >
            {revenuePercentageChange !== null ? (
              <>
                {revenuePercentageChange >= 0 ? "↑" : "↓"} {Math.abs(revenuePercentageChange).toFixed(1)}% vs last {activePeriod === "This Month" ? "month" : activePeriod === "This Week" ? "week" : activePeriod === "This Year" ? "year" : "period"}
              </>
            ) : (
              "No comparison data"
            )}
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
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "5px" }}>
            {formatRevenue(collectedRevenue)}
          </div>
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
              background: collectionRate >= 90 ? "#e8f5e9" : collectionRate >= 70 ? "#fff3e0" : "#ffebee",
              color: collectionRate >= 90 ? "#2e7d32" : collectionRate >= 70 ? "#f57c00" : "#c62828",
            }}
          >
            {collectionRate > 0 ? `${collectionRate.toFixed(1)}% collection rate` : "No data"}
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
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "5px" }}>
            {formatRevenue(pendingRevenue)}
          </div>
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
              background: pendingPercentageChange !== null && pendingPercentageChange <= 0 ? "#e8f5e9" : "#ffebee",
              color: pendingPercentageChange !== null && pendingPercentageChange <= 0 ? "#2e7d32" : "#c62828",
            }}
          >
            {pendingPercentageChange !== null ? (
              <>
                {pendingPercentageChange <= 0 ? "↓" : "↑"} {Math.abs(pendingPercentageChange).toFixed(1)}% vs last {activePeriod === "This Month" ? "month" : activePeriod === "This Week" ? "week" : activePeriod === "This Year" ? "year" : "period"}
              </>
            ) : (
              "No comparison data"
            )}
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
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "5px" }}>
            {formatRevenue(academyCommission)}
          </div>
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
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "5px" }}>
            {isLoadingSubscriptions ? "..." : activeSubscriptions}
          </div>
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
            Active tutors & students
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
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
          <RevenueTrend transactions={transactions} />
        </div>

        {/* <div
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
        </div> */}
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
          {topTutorsByRevenue.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No revenue data available
            </div>
          ) : (
            topTutorsByRevenue.map((tutor, index) => (
              <div
                key={tutor.tutorId}
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
                      background: avatarGradients[index % avatarGradients.length],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "600",
                    }}
                  >
                    {getInitials(tutor.tutorName)}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600" }}>{tutor.tutorName}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {tutor.studentCount} {tutor.studentCount === 1 ? "student" : "students"}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a" }}>
                  {formatRevenue(tutor.revenue)}
                </div>
              </div>
            ))
          )}
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
          {topCoursesByRevenue.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No revenue data available
            </div>
          ) : (
            topCoursesByRevenue.map((course, index) => (
              <div
                key={course.courseId}
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
                      background: avatarGradients[index % avatarGradients.length],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "20px",
                    }}
                  >
                    {getCourseIcon(course.courseTitle)}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600" }}>{course.courseTitle}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {course.enrollmentCount} {course.enrollmentCount === 1 ? "enrollment" : "enrollments"}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a" }}>
                  {formatRevenue(course.revenue)}
                </div>
              </div>
            ))
          )}
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
                  {availablePaymentMethods.length > 0 ? (
                    availablePaymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Credit Card">Credit Card</option>
                    </>
                  )}
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

      {/* Custom Date Range Modal */}
      <Modal show={showCustomDateModal} onHide={() => setShowCustomDateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Custom Date Range</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                Start Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                value={tempDateRange.startDate}
                onChange={(e) => setTempDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                max={tempDateRange.endDate || undefined}
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
                End Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                value={tempDateRange.endDate}
                onChange={(e) => setTempDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                min={tempDateRange.startDate || undefined}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomDateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (tempDateRange.startDate && tempDateRange.endDate) {
                if (new Date(tempDateRange.startDate) > new Date(tempDateRange.endDate)) {
                  toast.error("Start date must be before end date");
                  return;
                }
                setCustomDateRange(tempDateRange);
                setActivePeriod("Custom");
                setShowCustomDateModal(false);
              } else {
                toast.error("Please select both start and end dates");
              }
            }}
            style={{
              background: "linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)",
              border: "none",
            }}
          >
            Apply Date Range
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

