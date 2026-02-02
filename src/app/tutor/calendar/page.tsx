"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Users,
  PlusCircle,
  User,
  BookMarkedIcon,
  BookCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Menu,
  X,
  Home,
} from "lucide-react";
import Image from "next/image";
import { PiNutBold } from "react-icons/pi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
// import { Modal} from "react-bootstrap"; // Rename to avoid conflict
import { Modal, Button } from "react-bootstrap";
import {
  formatInTz,
  formatTimeRangeInTz,
  getUserTimeZone,
} from "@/helper/time";
import EditClassModal from "@/app/components/EditClassModal"; // add near other imports

interface UserData {
  _id: string;
  username?: string;
  name?: string;
  email?: string;
  category: string;
  timezone?: string;
}

interface Class {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  feedbackId?: string;
  course: string;
  status?: string;
  reasonForReschedule?: string;
  reasonForCancelation?: string;
  cancellationReason?: string;
  rescheduleReason?: string;
  studentId?: string;
}

const STATUS_COLORS = {
  present: {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Present",
  },
  absent: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Absent",
  },
  cancelled: {
    bg: "bg-gray-100",
    border: "border-gray-400",
    text: "text-gray-500",
    dot: "bg-gray-400",
    strikethrough: "line-through",
    label: "Cancelled",
  },
  rescheduled: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Rescheduled/Edited",
  },
  pending: {
    bg: "bg-purple-50",
    border: "border-purple-400",
    text: "text-purple-700",
    dot: "bg-purple-500",
    label: "Pending",
  },
};

const StudentCalendarView = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, any[]>>({});
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // view state: 'day' | 'week' | 'month'
  const [activeView, setActiveView] = useState<"day" | "week" | "month">(
    "week"
  );
  const handleSetView = (v: "day" | "week" | "month") => {
    setActiveView(v);
  };

  // Generate month days for Month view
  const generateMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    // start from Sunday (0) — keep consistent with UI elsewhere
    const startPad = first.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++)
      days.push(new Date(year, month, d));
    return days;
  };

  // Modal handlers
  const handleOpenCourseModal = () => {
    setShowCourseModal(true);
    // Preselect first course if none selected
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0]?._id || "");
    }
  };

  const handleCloseCourseModal = () => setShowCourseModal(false);

  const handleConfirmCreateClass = () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }
    setShowCourseModal(false);
    router.push(`/tutor/classes?page=add-session&courseId=${selectedCourseId}`);
  };

  // --- ADDED: class/modal handlers ---
  const handleClassClick = (classItem: any) => {
    setSelectedClass(classItem);
    setShowClassModal(true);
  };

  const handleCloseClassModal = () => {
    setShowClassModal(false);
    setSelectedClass(null);
  };

  const handleEditClass = () => {
    if (!selectedClass) {
      toast.error("No class selected");
      return;
    }
    setEditingClassId(selectedClass._id || null);
    setShowEditModal(true);
    setShowClassModal(false);
    setRescheduleReason(""); // Reset reason
  };

  const handleCancelClass = async (
    reasonOrEvent: any,
    cancelType: "single" | "all" | "following" = "single"
  ) => {
    if (!selectedClass || isCancelling) return;

    // Support both new modal (passes string) and old onClick (event)
    const finalReason =
      typeof reasonOrEvent === "string"
        ? reasonOrEvent.trim()
        : rescheduleReason.trim();

    if (!finalReason) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    const classId = selectedClass._id;
    const selectedStart = selectedClass.startTime
      ? new Date(selectedClass.startTime).getTime()
      : 0;
    const recurrenceId = selectedClass.recurrenceId ?? null;
    let prevAllClasses: any[] | null = null;

    // Optimistic UI for single-event cancel
    if (cancelType === "single") {
      prevAllClasses = allClasses;

      setAllClasses((prev: any[]) =>
        prev.map((block: any) => ({
          ...block,
          classes: (block.classes || []).map((cls: any) =>
            cls._id === classId
              ? {
                  ...cls,
                  status: "cancelled",
                  cancellationReason: finalReason,
                }
              : cls
          ),
        }))
      );

      setSelectedClass((prev: any) =>
        prev && prev._id === classId
          ? { ...prev, status: "cancelled", cancellationReason: finalReason }
          : prev
      );
    }

    // Optimistic UI for "following": mark all in series from selected date through end
    if (cancelType === "following" && recurrenceId) {
      prevAllClasses = allClasses;
      setAllClasses((prev: any[]) =>
        prev.map((block: any) => ({
          ...block,
          classes: (block.classes || []).map((cls: any) => {
            if (cls.recurrenceId !== recurrenceId) return cls;
            const clsStart = cls.startTime
              ? new Date(cls.startTime).getTime()
              : 0;
            if (clsStart < selectedStart) return cls;
            return {
              ...cls,
              status: "cancelled",
              cancellationReason: finalReason,
            };
          }),
        }))
      );
      setSelectedClass((prev: any) =>
        prev && prev._id === classId
          ? { ...prev, status: "cancelled", cancellationReason: finalReason }
          : prev
      );
    }

    setShowCancelModal(false);
    setShowClassModal(false);
    setIsCancelling(true);

    try {
      const timezone =
        userData?.timezone ||
        getUserTimeZone() ||
        Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await fetch(
        `/Api/classes?classId=${encodeURIComponent(
          classId
        )}&deleteType=${encodeURIComponent(cancelType)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reasonForCancellation: finalReason,
            timezone,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error || data.message || "Failed to cancel class"
        );
      }

      toast.success(
        cancelType === "all"
          ? "All events in this series have been cancelled"
          : cancelType === "following"
            ? "Events from this date onward have been cancelled"
            : "Class cancelled"
      );

      // Background refresh to sync with server
      (async () => {
        const studentList = await fetchStudents();
        if (studentList.length > 0) {
          await fetchAllClasses(studentList);
        }
      })();
    } catch (err: any) {
      console.error("Cancel error:", err);
      toast.error(err.message || "Failed to cancel class");

      // Roll back optimistic change if API failed (single or following)
      if ((cancelType === "single" || cancelType === "following") && prevAllClasses) {
        setAllClasses(prevAllClasses);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteClass = async (type: "single" | "all") => {
    if (!selectedClass) return;

    try {
      const classId = selectedClass._id;
      const res = await fetch(
        `/Api/calendar/classes?classId=${encodeURIComponent(
          classId
        )}&deleteType=${encodeURIComponent(type)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || data.message || "Failed to delete class");

      toast.success(
        type === "single" ? "Deleted this event" : "Deleted all events"
      );
      setShowDeleteModal(false);
      setShowClassModal(false);
      setSelectedClass(null);

      const studentList = await fetchStudents();
      if (studentList.length > 0) {
        await fetchAllClasses(studentList);
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete class");
    }
  };

  const handleEditSuccess = async (updatedData?: any) => {
    const classId = editingClassId;
    const reason = rescheduleReason.trim();

    if (classId) {
      setAllClasses((prev: any[]) =>
        prev.map((block: any) => ({
          ...block,
          classes: (block.classes || []).map((cls: any) =>
            cls._id === classId
              ? {
                  ...cls,
                  ...(updatedData || {}),
                  ...(reason
                    ? {
                        status: "rescheduled",
                        rescheduleReason: reason,
                        reasonForReschedule: reason,
                      }
                    : {}),
                }
              : cls
          ),
        }))
      );

      setSelectedClass((prev: any) =>
        prev && prev._id === classId
          ? {
              ...prev,
              ...(updatedData || {}),
              ...(reason
                ? {
                    status: "rescheduled",
                    rescheduleReason: reason,
                    reasonForReschedule: reason,
                  }
                : {}),
            }
          : prev
      );
    }

    // Close modal immediately so it feels fast
    setShowEditModal(false);
    setEditingClassId(null);
    setRescheduleReason("");
    toast.success("Class updated");

    // 2) Network calls in background
    (async () => {
      try {
        if (reason && classId) {
          await fetch(`/Api/calendar/classes/${classId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reasonForReschedule: reason,
              status: "rescheduled",
            }),
          });
        }

        const studentList = await fetchStudents();
        if (studentList.length > 0) {
          await fetchAllClasses(studentList);
        }
      } catch (err) {
        console.error("Refresh after edit failed:", err);
        toast.error("Server sync failed, please refresh");
      }
    })();
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/Api/myStudents");
      const data = await response.json();
      if (data.success) {
        setStudents(data.filteredUsers || []);
        return data.filteredUsers || [];
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  };

  const fetchAllClasses = async (studentList) => {
    try {
      const classPromises = studentList.map(async (student) => {
        const response = await fetch(
          `/Api/calendar/classes?userid=${student._id}`
        );
        const data = await response.json();
        return {
          studentId: student._id,
          classes: data.classData || [],
        };
      });

      const results = await Promise.all(classPromises);
      setAllClasses(results);

      // Fetch attendance for all students
      await fetchAttendanceForStudents(studentList);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchAttendanceForStudents = async (studentList: any[]) => {
    try {
      const attendancePromises = studentList.map(async (student) => {
        try {
          const response = await fetch(
            `/Api/student/attendanceData?studentId=${student._id}`
          );
          const data = await response.json();
          return { studentId: student._id, attendance: data.attendance || [] };
        } catch (err) {
          console.error(
            `Failed to fetch attendance for student ${student._id}`,
            err
          );
          return { studentId: student._id, attendance: [] };
        }
      });

      const results = await Promise.all(attendancePromises);
      const map: Record<string, any[]> = {};
      results.forEach(({ studentId, attendance }) => {
        map[studentId] = attendance;
      });
      setAttendanceMap(map);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const getClassAttendanceStatus = (classItem: any) => {
    // Use explicit class status only for cancel / reschedule,
    // otherwise derive from attendance data (present/absent/etc.)
    const rawStatus = (classItem?.status || "").toString().toLowerCase();

    if (rawStatus === "canceled" || rawStatus === "cancelled") {
      return "cancelled";
    }
    if (rawStatus === "reschedule" || rawStatus === "rescheduled") {
      return "rescheduled";
    }

    const studentId = classItem.studentId || classItem.student?._id;
    if (!studentId || !attendanceMap[studentId]) return "pending";

    const attendance = attendanceMap[studentId];
    const classRecord = attendance.find(
      (record) =>
        record.classId === classItem._id || record.sessionId === classItem._id
    );

    if (!classRecord) return "pending";
    return (classRecord.status || "pending").toString().toLowerCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return STATUS_COLORS.present;
      case "absent":
        return STATUS_COLORS.absent;
      case "cancelled":
      case "canceled":
        return STATUS_COLORS.cancelled;
      case "rescheduled":
        return STATUS_COLORS.rescheduled;
      case "pending":
      default:
        return STATUS_COLORS.pending;
    }
  };

  useEffect(() => {
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
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/Api/users/user");
        const data = await response.json();
        if (data.user) {
          setUserData(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const studentList = await fetchStudents();
      if (studentList.length > 0) {
        await fetchAllClasses(studentList);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const cloneDate = (d) => new Date(d.getTime());

  const getWeekDays = () => {
    const ref = cloneDate(currentDate);
    const day = ref.getDay();
    const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = cloneDate(ref);
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = cloneDate(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const userTz = userData?.timezone || getUserTimeZone();

  // Helper to get date components in user's timezone
  const getDateComponentsInTz = (date: Date | string, tz: string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(d);
    const year = parseInt(parts.find((p) => p.type === "year")?.value || "0");
    const month = parseInt(parts.find((p) => p.type === "month")?.value || "0");
    const day = parseInt(parts.find((p) => p.type === "day")?.value || "0");
    return { year, month, day };
  };

  // Filter helpers for week/day - compare in user's timezone
  const isSameDayInTz = (date1: Date | string, date2: Date, tz: string) => {
    const d1 = getDateComponentsInTz(date1, tz);
    const d2 = getDateComponentsInTz(date2, tz);
    return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day;
  };

  const getClassesForDate = (studentId, date) => {
    const studentClasses = allClasses.find(
      (item) => item.studentId === studentId
    );
    if (!studentClasses) return [];

    return studentClasses.classes
      .filter((classItem) => {
        if (!classItem.startTime) return false;
        // Compare dates in user's timezone to ensure correct date matching
        return isSameDayInTz(classItem.startTime, date, userTz);
      })
      .map((classItem) => ({
        ...classItem,
        studentId: studentId, // Add studentId to each class item
      }));
  };

  const handleJoinMeeting = async (classId: string) => {
    try {
      if (!userData) {
        toast.error("User data not available. Please refresh the page.");
        return;
      }

      console.log("[Meeting] Creating meeting for class:", classId);
      const response = await fetch("/Api/meeting/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: classId,
          userId: userData._id,
          userRole: userData.category,
        }),
      });

      const data = await response.json();
      console.log("[Meeting] Server response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create meeting");
      }

      window.open(
        `/tutor/video-call?url=${encodeURIComponent(data.url)}&userRole=${
          userData.category
        }&token=${encodeURIComponent(data.token || "")}`,
        "_blank"
      );
    } catch (error: any) {
      console.error("[Meeting] Error details:", error);
      toast.error(
        error.message || "Failed to create meeting. Please try again."
      );
    }
  };

  const changeDay = (deltaDays) => {
    const d = cloneDate(currentDate);
    d.setDate(d.getDate() + deltaDays);
    setCurrentDate(d);
  };

  // Unified navigation: prev / today / next that respect activeView ('day'|'week'|'month')
  const handlePrev = () => {
    if (activeView === "month") {
      // go to previous month (keep to first day of that month for consistent month view)
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    } else if (activeView === "week") {
      // shift one week back
      const d = cloneDate(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      changeDay(-1);
    }
  };

  const handleNext = () => {
    if (activeView === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    } else if (activeView === "week") {
      const d = cloneDate(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      changeDay(1);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime) return "";
    // Use user's timezone for display
    return formatTimeRangeInTz(startTime, endTime, userTz);
  };

  const getInitials = (name) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // compute displayed day headers depending on active view
  const weekDays = activeView === "day" ? [currentDate] : getWeekDays();

  const filteredStudents = students.filter(
    (student) =>
      (student.username || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Grid template: first column fixed 263px, then 7 equal columns
  const gridTemplate = {
    gridTemplateColumns: "263px repeat(7, minmax(0, 1fr))",
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">
      {/* Global cancelling overlay */}
      {isCancelling && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg px-6 py-4 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm text-gray-700">
              Cancelling classes in this series…
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10 flex items-center gap-5px">
          <Link
            href={`/tutor`}
            className="!p-2 !rounded-full !bg-gray-200 !hover:bg-gray-300 !transition-colors !shadow-md !flex-shrink-0"
          >
            <ChevronLeft className="!text-gray-700 !w-5 !h-5 !sm:w-6 !sm:h-6" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Tutor Calendar
          </h1>

          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <Menu size={24} />
            </button>
          )}
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-6">
          {/* Calendar Container */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4 text-[20px] text-[#212121]">
                <button
                  onClick={handlePrev}
                  className="cursor-pointer select-none hover:bg-gray-100 p-2 rounded"
                >
                  {"<"}
                </button>
                <span className="font-medium text-[20px] text-[#212121]">
                  {currentDate.toLocaleDateString("en-US", {
                    day: "2-digit",
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                  })}
                </span>
                <button
                  onClick={handleNext}
                  className="cursor-pointer select-none hover:bg-gray-100 p-2 rounded"
                >
                  {">"}
                </button>
                <button
                  onClick={handleToday}
                  className="ml-3 px-3 py-1 rounded bg-gray-100 text-sm"
                >
                  Today
                </button>
              </div>

              {/* View toggle buttons */}
              <div className="inline-flex items-center gap-2">
                <button
                  onClick={() => handleSetView("day")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeView === "day"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => handleSetView("week")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeView === "week"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => handleSetView("month")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeView === "month"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Month
                </button>
              </div>
            </div>

            {/* Course Dropdown and Create Class Button */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleOpenCourseModal}
                className="!bg-purple-600 hover:!bg-purple-700 !text-white !px-4 !py-2 !rounded-lg !flex !items-center !gap-2 !text-sm !font-medium"
              >
                <PlusCircle size={18} />
                Create Class
              </button>

              {/* Course Select Modal */}
              <Modal
                show={showCourseModal}
                onHide={handleCloseCourseModal}
                centered
                className="modal-common-sec"
                animation
                backdrop // click outside to dismiss
                keyboard // press ESC to dismiss
              >
                <Modal.Header closeButton />
                <Modal.Body>
                  <div className="head-modal text-center">
                    <h2>Select Course</h2>
                    <p>Choose a course to create a new class session.</p>
                  </div>
                  <div className="form-box-modal label-strong-box">
                    <div className="row">
                      <div className="col-md-12">
                        <label className="w-100 d-block mb-2">Course</label>
                        <select
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="form-select"
                        >
                          {courses.length === 0 && (
                            <option value="">No courses found</option>
                          )}
                          {courses.map((course) => (
                            <option key={course._id} value={course._id}>
                              {course.title || course.name || "Untitled Course"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <button
                    variant="outline-secondary"
                    onClick={handleCloseCourseModal}
                  >
                    Cancel
                  </button>
                  <button
                    variant="primary"
                    disabled={!selectedCourseId}
                    onClick={handleConfirmCreateClass}
                  >
                    Continue
                  </button>
                </Modal.Footer>
              </Modal>
            </div>

            {/* Calendar Grid */}
            <div className="mt-2 rounded overflow-hidden">
              {activeView === "month" ? (
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {currentDate.toLocaleString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    {/* <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                        className="px-3 py-1 rounded bg-gray-100"
                      >
                        Prev
                      </button>
                      <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 rounded bg-gray-100">
                        Today
                      </button>
                      <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                        className="px-3 py-1 rounded bg-gray-100"
                      >
                        Next
                      </button>
                    </div> */}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (d) => (
                        <div key={d} className="py-2">
                          {d}
                        </div>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {generateMonthDays(currentDate).map((d, idx) => {
                      const classCount = d
                        ? filteredStudents.reduce(
                            (acc, s) =>
                              acc + getClassesForDate(s._id, d).length,
                            0
                          )
                        : 0;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (!d) return;
                            setCurrentDate(d);
                            setActiveView("day");
                          }}
                          className={`min-h-[88px] p-2 border rounded ${
                            d
                              ? "bg-white cursor-pointer hover:bg-gray-50"
                              : "bg-transparent"
                          }`}
                        >
                          {d ? (
                            <>
                              <div className="text-sm font-medium">
                                {d.getDate()}
                              </div>

                              <div className="mt-2 text-xs text-gray-600">
                                {classCount > 0 ? (
                                  <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                    {classCount} class
                                    {classCount !== 1 ? "es" : ""}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </div>
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  {/* Header Row */}
                  <div
                    className="grid items-stretch bg-white"
                    style={gridTemplate}
                  >
                    {/* Search Input Cell */}
                    <div className="p-3 bg-white">
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        type="text"
                        placeholder="Search Students"
                        className="w-full h-[48px] px-4 rounded border border-[#505050] text-[14px] text-[#505050] bg-white font-inter font-normal focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    {/* Day headers (1 or 7 depending on activeView) */}
                    {weekDays.map((day, idx) => (
                      <div key={idx} className="p-3 text-center bg-[#F5F5F5]">
                        <div className="text-[16px] font-inter font-medium text-[#212121]">
                          {day.toLocaleDateString("en-US", {
                            day: "2-digit",
                            weekday: "short",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Body */}
                  <div className="max-h-[70vh] overflow-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="text-[16px] text-[#9B9B9B] mb-2">
                          No students to display
                        </div>
                        <div className="text-[14px] text-[#C4C4C4]">
                          {searchTerm
                            ? "Try adjusting your search terms"
                            : "No students found in the system"}
                        </div>
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <div
                          key={student._id}
                          className="grid items-center hover:bg-gray-50 transition-colors"
                          style={gridTemplate}
                        >
                          {/* Student Info Cell */}
                          <div className="p-3 flex items-center gap-3 min-h-[88px] border-r border-gray-200">
                            {student.profileImage ? (
                              <img
                                src={student.profileImage}
                                alt={student.username}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-800">
                                {getInitials(student.username)}
                              </div>
                            )}
                            <div>
                              <div className="text-[14px] text-[#212121] font-medium">
                                {student.username}
                              </div>
                            </div>
                          </div>

                          {/* Daily Schedule Cells */}
                          {weekDays.map((day, idx) => {
                            const classes = getClassesForDate(student._id, day);
                            return (
                              <div key={idx} className="p-3 min-h-[88px]">
                                {classes.length === 0 ? (
                                  <div className="h-full flex items-center justify-center">
                                    <div className="text-[12px] text-[#E0E0E0]">
                                      No classes
                                    </div>
                                  </div>
                                ) : (
                                  classes.map((classItem, cIdx) => {
                                    const attendanceStatus =
                                      getClassAttendanceStatus(classItem);
                                    const statusColor =
                                      getStatusColor(attendanceStatus);
                                    return (
                                      <div
                                        key={classItem._id || cIdx}
                                        className={`mb-2 last:mb-0 p-2 ${statusColor.bg} border-l-4 ${statusColor.border} hover:opacity-90 text-xs text-[#212121] rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer relative`}
                                        title={`${
                                          classItem.title || "Class"
                                        } - ${formatTime(
                                          classItem.startTime,
                                          classItem.endTime
                                        )}`}
                                        onClick={() =>
                                          handleClassClick(classItem)
                                        }
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div
                                            className={`font-medium text-[13px] truncate ${
                                              statusColor.strikethrough
                                                ? "line-through"
                                                : ""
                                            } ${statusColor.text}`}
                                          >
                                            {classItem.title || "Class"}
                                          </div>
                                          <span
                                            className={`w-2 h-2 rounded-full ${statusColor.dot}`}
                                            title={attendanceStatus}
                                          ></span>
                                        </div>
                                        <div
                                          className={`text-[11px] truncate ${
                                            statusColor.strikethrough
                                              ? "line-through"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          {formatTime(
                                            classItem.startTime,
                                            classItem.endTime
                                          )}
                                        </div>

                                        {/* Add this block for reschedule reason */}
                                        {/* {classItem.reasonForReschedule && classItem.status === 'rescheduled' && (
                                          <div className="mt-1 text-[10px] text-yellow-700 bg-yellow-50 p-1 rounded">
                                            <span className="font-semibold">Rescheduled:</span> {classItem.reasonForReschedule}
                                          </div>
                                        )} */}

                                        {/* Add this block for cancellation reason */}
                                        {/* {classItem.reasonForCancelation &&
                                          classItem.status === "canceled" && (
                                            <div className="mt-1 text-[10px] text-red-700 bg-red-50 p-1 rounded">
                                              <span className="font-semibold">
                                                Cancelled:
                                              </span>{" "}
                                              {classItem.reasonForCancelation}
                                            </div>
                                          )} */}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Add this legend component just below your calendar grid, before the closing </div> of the main calendar container: */}
            <div className="mt-6 flex flex-wrap gap-4 items-center justify-center">
              {Object.entries(STATUS_COLORS).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className={`inline-block w-4 h-4 rounded-full border ${val.dot} ${val.border}`}
                  ></span>
                  <span
                    className={`text-xs text-gray-700 ${
                      val.strikethrough || ""
                    }`}
                  >
                    {val.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Class Options Modal */}
      <Modal
        show={showClassModal}
        onHide={handleCloseClassModal}
        centered
        dialogClassName="max-w-lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <div className="flex items-start justify-between w-full">
            <div>
              <h5 className="mb-0 text-lg font-semibold">
                {selectedClass?.title || "Class"}
              </h5>
              <div className="text-sm text-gray-500 mt-1">
                {selectedClass?.studentName ||
                  selectedClass?.student?.username ||
                  ""}
              </div>
            </div>
            {selectedClass &&
              (() => {
                const attendanceStatus =
                  getClassAttendanceStatus(selectedClass);
                const statusColor = getStatusColor(attendanceStatus);
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${statusColor.dot}`}
                    ></span>
                    {/* use label instead of raw status string */}
                    {statusColor.label}
                  </span>
                );
              })()}
          </div>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">
                  {formatTime(
                    selectedClass?.startTime,
                    selectedClass?.endTime
                  ) || "No time"}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(
                    selectedClass?.startTime || Date.now()
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>

            {selectedClass?.description && (
              <div className="text-sm text-gray-600">
                {selectedClass.description.length > 220
                  ? `${selectedClass.description.slice(0, 220)}...`
                  : selectedClass.description}
              </div>
            )}

            {selectedClass?.cancellationReason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-xs font-semibold text-red-700 mb-1">
                  Cancellation Reason:
                </div>
                <div className="text-sm text-red-600">
                  {selectedClass.cancellationReason}
                </div>
              </div>
            )}

            {selectedClass?.rescheduleReason && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="text-xs font-semibold text-gray-700 mb-1">
                  Reschedule Reason:
                </div>
                <div className="text-sm text-gray-600">
                  {selectedClass.rescheduleReason}
                </div>
              </div>
            )}

            {/* These already exist in your code - just making sure they show the new fields */}
            {selectedClass?.reasonForReschedule && (
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-yellow-800 mb-1">
                      Reason for Reschedule
                    </div>
                    <div className="text-sm text-yellow-700">
                      {selectedClass.reasonForReschedule}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedClass?.reasonForCancelation && (
              <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-red-800 mb-1">
                      Reason for Cancellation
                    </div>
                    <div className="text-sm text-red-700">
                      {selectedClass.reasonForCancelation}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons row */}
            <div className="flex flex-wrap gap-4 mt-2">
              <Button
                variant="outline-primary"
                className="!rounded-md !py-2 !text-sm"
                onClick={handleEditClass}
              >
                Reschedule/Edit
              </Button>

              <Button
                variant="outline-warning"
                className="!rounded-md !py-2 !text-sm"
                onClick={() => {
                  setShowCancelModal(true);
                }}
                disabled={
                  selectedClass &&
                  (getClassAttendanceStatus(selectedClass) === "cancelled" ||
                    getClassAttendanceStatus(selectedClass) === "canceled")
                }
              >
                Cancel
              </Button>

              {/* <Button
                variant="outline-danger"
                className="!rounded-md !py-2 !text-sm"
                onClick={() => {
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </Button> */}

              <Button
                variant="success"
                className="!rounded-md !py-2 !text-sm"
                onClick={() => {
                  if (selectedClass?._id) handleJoinMeeting(selectedClass._id);
                  handleCloseClassModal();
                }}
              >
                Join
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Cancel Options Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => {
          setShowCancelModal(false);
        }}
        centered
        dialogClassName="max-w-md"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h5 className="mb-0 text-lg font-semibold">Cancel Class</h5>
          </div>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-sm text-gray-600 mb-3">
            You are about to cancel this class. Students will see it as
            cancelled on their calendar.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="Please provide a reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-400 mt-1">
              {rescheduleReason.length}/500
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="flex-1 !py-2 !rounded-md !text-sm"
              onClick={() => {
                setShowCancelModal(false);
              }}
            >
              Keep Class
            </Button>

            <Button
              variant="warning"
              className="flex-1 !py-2 !rounded-md !text-sm"
              onClick={handleCancelClass}
              disabled={!rescheduleReason.trim() || isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel Class"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Delete Options Modal - Keep existing */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        dialogClassName="max-w-md"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h5 className="mb-0 text-lg font-semibold">Delete Class</h5>
          </div>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-sm text-gray-600 mb-3">
            Are you sure you want to permanently delete this class? This action
            cannot be undone.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="danger"
              className="flex-1 !py-2 !rounded-md"
              onClick={() => handleDeleteClass("single")}
            >
              Delete This Event
            </Button>

            <Button
              variant="outline-danger"
              className="flex-1 !py-2 !rounded-md"
              onClick={() => handleDeleteClass("all")}
            >
              Delete All Events
            </Button>
          </div>

          <div className="mt-3 text-right">
            <button
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Class Modal with Reschedule Reason */}
      <EditClassModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingClassId(null);
          setRescheduleReason("");
        }}
        classId={editingClassId}
        initialData={selectedClass}
        userTimezone={userTz}
        onSuccess={handleEditSuccess}
        // customFields={
        //   <div className="mb-3">
        //     <label className="block text-sm font-medium text-gray-700 mb-2">
        //       Reason for Reschedule (Optional)
        //     </label>
        //     <textarea
        //       value={rescheduleReason}
        //       onChange={(e) => setRescheduleReason(e.target.value)}
        //       placeholder="Provide a reason for rescheduling..."
        //       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        //       rows={3}
        //       maxLength={500}
        //     />
        //     <div className="text-xs text-gray-400 mt-1">{rescheduleReason.length}/500</div>
        //   </div>
        // }
      />

      {/* Cancel Class Modal - New Component */}
      <CancelClassModal
        show={showCancelModal}
        onHide={() => {
          setShowCancelModal(false);
        }}
        onCancel={async (reason: string, type: "single" | "all" | "following") => {
          await handleCancelClass(reason, type);
        }}
        disabled={
          selectedClass &&
          (getClassAttendanceStatus(selectedClass) === "cancelled" ||
            getClassAttendanceStatus(selectedClass) === "canceled")
        }
        loading={isCancelling}
      />
    </div>
  );
};

const CancelClassModal = React.memo(
  ({ show, onHide, onCancel, disabled, loading }) => {
    const [reason, setReason] = useState("");
    useEffect(() => {
      if (!show) setReason("");
    }, [show]);
    return (
      <Modal show={show} onHide={onHide} centered dialogClassName="max-w-md">
        <Modal.Header closeButton className="border-0 pb-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h5 className="mb-0 text-lg font-semibold">Cancel Class</h5>
          </div>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-sm text-gray-600 mb-3">
            You are about to cancel this class. Students will see it as
            cancelled on their calendar.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-400 mt-1">{reason.length}/500</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="flex-1 !py-2 !rounded-md !text-sm"
              onClick={() => onCancel(reason, "following")}
              disabled={!reason.trim() || disabled || loading}
            >
              {loading ? "Cancelling..." : "Cancel Following"}
            </Button>
            <Button
              variant="warning"
              className="flex-1 !py-2 !rounded-md !text-sm"
              onClick={() => onCancel(reason, "single")}
              disabled={!reason.trim() || disabled || loading}
            >
              {loading ? "Cancelling..." : "Cancel This Event"}
            </Button>
            <Button
              variant="danger"
              className="flex-1 !py-2 !rounded-md !text-sm"
              onClick={() => onCancel(reason, "all")}
              disabled={!reason.trim() || disabled || loading}
            >
              {loading ? "Cancelling..." : "Cancel All Events"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
);

export default StudentCalendarView;
