"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronDown, Trash2, X, Info, ClipboardCheck } from "lucide-react";
import { formatTimeRangeInTz, getUserTimeZone, formatInTz } from "@/helper/time";
import { toast } from "react-hot-toast";
import CancellationReasonPicker from "@/app/components/reasonForCancellation";
import StudentInfoPopup from "@/app/components/StudentInfoPopup";
import WhatsAppNotificationModal from "@/app/components/WhatsAppNotificationModal";
import DailySummaryWhatsAppModal from "@/app/components/DailySummaryWhatsAppModal";

interface Student {
  _id: string;
  username?: string;
  email?: string;
  address?: string;
  contact?: string;
  whatsappGroups?: { name: string; link: string }[];
  studentSociety?: string;
}

interface ClassItem {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status?: string;
  course?: string;
  courseId?: string;
  students: Student[];
  deleteRequest?: boolean;
  deleteRequestStatus?: string;
  whatsappSentCount?: number;
}

interface TutorInfo {
  _id: string;
  username?: string;
  email?: string;
}

const STATUS_COLORS: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    dot: string;
    label: string;
    strikethrough?: string;
  }
> = {
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
  rescheduled_present: {
    bg: "bg-teal-50",
    border: "border-teal-400",
    text: "text-teal-700",
    dot: "bg-teal-500",
    label: "Rescheduled (Present)",
  },
  pending: {
    bg: "bg-purple-50",
    border: "border-purple-400",
    text: "text-purple-700",
    dot: "bg-purple-500",
    label: "Pending",
  },
};

export default function RMTutorCalendarPage() {
  const params = useParams();
  const tutorId = typeof params?.tutorId === "string" ? params.tutorId : null;

  const [tutor, setTutor] = useState<TutorInfo | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<"day" | "week" | "month">("week");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
  const [selectedStudentsForDelete, setSelectedStudentsForDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, any[]>>({});
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<ClassItem | null>(null);

  const [pendingResetRequests, setPendingResetRequests] = useState<any[]>([]);
  const [resettingStudentId, setResettingStudentId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>("");
  const [creditDeduction, setCreditDeduction] = useState<"yes" | "no">("no");
  const [cancellationReason, setCancellationReason] = useState<string>("");
  const [cancelClassModalOpen, setCancelClassModalOpen] = useState(false);
  const [classToCancel, setClassToCancel] = useState<ClassItem | null>(null);
  const [cancelCreditDeduction, setCancelCreditDeduction] = useState<"yes" | "no">("no");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [studentInfoId, setStudentInfoId] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [whatsappModalClass, setWhatsappModalClass] = useState<ClassItem | null>(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);
  const [dailySummaryDay, setDailySummaryDay] = useState<Date | null>(null);

  // --- Performance: class cache & debounce refs ---
  const classCacheRef = useRef<Map<string, { classes: ClassItem[]; pendingResets: any[] }>>(new Map());
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const attendanceCacheRef = useRef<Set<string>>(new Set());

  const triggerViewTransition = (updateFn: () => void) => {
    setViewLoading(true);
    setTimeout(() => {
      updateFn();
      setViewLoading(false);
    }, 300);
  };

  const submitAttendanceReset = async (
    studentId: string,
    classId: string,
    newStatus: string,
    creditDeduction?: "yes" | "no",
    singleStudent?: boolean,
    reasonForCancellation?: string
  ) => {
    setResettingStudentId(studentId);
    try {
      const res = await fetch("/Api/relationship-manager/attendance/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          classId,
          newStatus,
          creditDeduction,
          singleStudent: singleStudent ?? false,
          reasonForCancellation: reasonForCancellation || ""
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to request reset");
      }
      toast.success(data.message || "Attendance reset request submitted");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setResettingStudentId(null);
      setEditingStudentId(null);
      setSelectedNewStatus("");
      setCreditDeduction("no");
      setCancellationReason("");
    }
  };

  // --- Helpers for date-range fetching ---
  const getWeekRange = useCallback((refDate: Date) => {
    const d = new Date(refDate.getTime());
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  const getMonthRange = useCallback((refDate: Date) => {
    const start = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    const end = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }, []);

  const getCacheKey = useCallback((start: Date, end: Date) => {
    return `${start.toISOString()}_${end.toISOString()}`;
  }, []);

  const fetchClassesForRange = useCallback(async (start: Date, end: Date, isBackground = false) => {
    if (!tutorId) return;
    const key = getCacheKey(start, end);

    // Use cache if available
    if (classCacheRef.current.has(key)) {
      if (!isBackground) {
        const cached = classCacheRef.current.get(key)!;
        setClasses(cached.classes);
        setPendingResetRequests(cached.pendingResets);
      }
      return;
    }

    if (!isBackground) setClassesLoading(true);
    try {
      const url = `/Api/relationship-manager/tutor/${tutorId}/classes?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (!isBackground) throw new Error(data.error || "Failed to load classes");
        return;
      }

      const loadedClasses = data.classes || [];
      const pendingResets = data.pendingResetRequests || [];

      // Cache the result
      classCacheRef.current.set(key, { classes: loadedClasses, pendingResets });

      if (!isBackground) {
        setTutor(data.tutor || null);
        setClasses(loadedClasses);
        setPendingResetRequests(pendingResets);
      }

      // Fetch attendance for students in these classes (non-blocking)
      const studentIds = new Set<string>();
      loadedClasses.forEach((cls: ClassItem) => {
        cls.students?.forEach((s: Student) => studentIds.add(s._id));
      });

      // Only fetch attendance for students we haven't already fetched
      const newStudentIds = Array.from(studentIds).filter(id => !attendanceCacheRef.current.has(id));
      if (newStudentIds.length > 0) {
        if (!isBackground) setAttendanceLoading(true);
        try {
          const attRes = await fetch("/Api/student/attendanceData", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentIds: newStudentIds })
          });
          const attData = await attRes.json();
          if (attData.success && attData.data) {
            newStudentIds.forEach(id => attendanceCacheRef.current.add(id));
            setAttendanceMap(prev => ({ ...prev, ...attData.data }));
          }
        } catch (e) {
          console.error("Failed to fetch attendance", e);
        } finally {
          if (!isBackground) setAttendanceLoading(false);
        }
      } else {
        if (!isBackground) setAttendanceLoading(false);
      }
    } catch (err: any) {
      if (!isBackground) setError(err.message || "Failed to load calendar");
    } finally {
      if (!isBackground) setClassesLoading(false);
    }
  }, [tutorId, getCacheKey]);

  // Prefetch adjacent weeks in background
  const prefetchAdjacent = useCallback((refDate: Date) => {
    if (activeView === "month") {
      const prevMonth = new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1);
      const nextMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1);
      const prevRange = getMonthRange(prevMonth);
      const nextRange = getMonthRange(nextMonth);
      fetchClassesForRange(prevRange.start, prevRange.end, true);
      fetchClassesForRange(nextRange.start, nextRange.end, true);
    } else {
      const prevWeekDate = new Date(refDate.getTime());
      prevWeekDate.setDate(prevWeekDate.getDate() - 7);
      const nextWeekDate = new Date(refDate.getTime());
      nextWeekDate.setDate(nextWeekDate.getDate() + 7);
      const prevRange = getWeekRange(prevWeekDate);
      const nextRange = getWeekRange(nextWeekDate);
      fetchClassesForRange(prevRange.start, prevRange.end, true);
      fetchClassesForRange(nextRange.start, nextRange.end, true);
    }
  }, [activeView, getWeekRange, getMonthRange, fetchClassesForRange]);

  // Main effect: fetch classes when date or view changes (with debounce)
  useEffect(() => {
    if (!tutorId) {
      setClassesLoading(false);
      setError("Tutor not found");
      return;
    }

    // Clear any pending debounce
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }

    const range = activeView === "month"
      ? getMonthRange(currentDate)
      : getWeekRange(currentDate);
    const key = getCacheKey(range.start, range.end);

    // If cached, show immediately (no debounce needed)
    if (classCacheRef.current.has(key)) {
      const cached = classCacheRef.current.get(key)!;
      setClasses(cached.classes);
      setPendingResetRequests(cached.pendingResets);
      setClassesLoading(false);
    }

    // Debounce: wait 300ms before fetching (handles rapid clicking)
    fetchTimerRef.current = setTimeout(async () => {
      await fetchClassesForRange(range.start, range.end);
      // Prefetch adjacent ranges after current loads
      prefetchAdjacent(currentDate);
    }, 300);

    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  }, [tutorId, currentDate, activeView, getWeekRange, getMonthRange, getCacheKey, fetchClassesForRange, prefetchAdjacent]);

  const userTz = getUserTimeZone();

  const cloneDate = (d: Date) => new Date(d.getTime());

  const getDateParts = (date: Date | string, tz: string) => {
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

  const isSameDay = (date1: Date | string, date2: Date, tz: string) => {
    const a = getDateParts(date1, tz);
    const b = getDateParts(date2, tz);
    return a.year === b.year && a.month === b.month && a.day === b.day;
  };

  const getWeekDays = () => {
    const ref = cloneDate(currentDate);
    const day = ref.getDay();
    const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = cloneDate(ref);
    startOfWeek.setDate(diff);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = cloneDate(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getClassesForDay = (day: Date) =>
    classes.filter((c) => isSameDay(c.startTime, day, userTz));

  const getClassesForDate = (d: Date) => getClassesForDay(d);

  const formatTime = (startTime: string, endTime: string) =>
    formatTimeRangeInTz(startTime, endTime, userTz);

  const getStatusStyle = (cls: ClassItem) => {
    const rawStatus = (cls.status || "scheduled").toLowerCase();

    if (rawStatus === "canceled" || rawStatus === "cancelled") {
      return STATUS_COLORS.cancelled;
    }

    let isPresent = false;
    let isAbsent = false;

    cls.students?.forEach(student => {
      const records = attendanceMap[student._id];
      if (records) {
        const record = records.find((r: any) => r.classId === cls._id || r.sessionId === cls._id);
        if (record) {
          if (record.status === "present") isPresent = true;
          if (record.status === "absent") isAbsent = true;
        }
      }
    });

    if (rawStatus === "reschedule" || rawStatus === "rescheduled") {
      if (isPresent) return STATUS_COLORS.rescheduled_present;
      return STATUS_COLORS.rescheduled;
    }

    if (isPresent) return STATUS_COLORS.present;
    if (isAbsent && !isPresent) return STATUS_COLORS.absent;

    if (rawStatus === "completed") return STATUS_COLORS.present;

    return STATUS_COLORS.pending;
  };

  const generateMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++)
      days.push(new Date(year, month, d));
    return days;
  };

  const handlePrev = () => {
    triggerViewTransition(() => {
      if (activeView === "month") {
        setCurrentDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        );
      } else if (activeView === "week") {
        const d = cloneDate(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
      } else {
        const d = cloneDate(currentDate);
        d.setDate(d.getDate() - 1);
        setCurrentDate(d);
      }
    });
  };

  const handleNext = () => {
    triggerViewTransition(() => {
      if (activeView === "month") {
        setCurrentDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        );
      } else if (activeView === "week") {
        const d = cloneDate(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
      } else {
        const d = cloneDate(currentDate);
        d.setDate(d.getDate() + 1);
        setCurrentDate(d);
      }
    });
  };

  const weekDays = useMemo(() => activeView === "day" ? [currentDate] : getWeekDays(), [activeView, currentDate]);

  const visibleClasses = useMemo(() => {
    let filtered: ClassItem[] = [];
    if (activeView === "month") {
      const days = generateMonthDays(currentDate).filter((d): d is Date => d !== null);
      filtered = classes.filter((c) => days.some((day) => isSameDay(c.startTime, day, userTz)));
    } else {
      filtered = classes.filter((c) => weekDays.some((day) => isSameDay(c.startTime, day, userTz)));
    }
    // Apply day filter if selected (in week view)
    if (selectedDayFilter && activeView === "week") {
      filtered = filtered.filter((c) => {
        const classDate = new Date(c.startTime);
        const dayStr = classDate.toLocaleDateString("en-US", { weekday: "short", timeZone: userTz });
        return dayStr === selectedDayFilter;
      });
    }
    return [...filtered].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [classes, activeView, currentDate, weekDays, selectedDayFilter, userTz]);

  const openDeleteModal = (cls: ClassItem) => {
    setClassToDelete(cls);
    setSelectedStudentsForDelete(cls.students.map(s => s._id)); // By default select all
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setClassToDelete(null);
    setSelectedStudentsForDelete([]);
    setIsDropdownOpen(false);
  };

  const handleDeleteRequest = async () => {
    if (!classToDelete) return;

    if (classToDelete.students.length > 1 && selectedStudentsForDelete.length === 0) {
      toast.error("Please select at least one student or cancel.");
      return;
    }

    try {
      setIsDeleting(true);
      const actionType = selectedStudentsForDelete.length > 0 && selectedStudentsForDelete.length < classToDelete.students.length
        ? "partial"
        : "full";

      const res = await fetch(
        `/Api/relationship-manager/tutor/${tutorId}/classes/${classToDelete._id}/delete-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ actionType, studentIds: selectedStudentsForDelete })
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Delete request sent to team lead");
        setClasses((prev) =>
          prev.map((c) =>
            c._id === classToDelete._id
              ? { ...c, deleteRequest: true, deleteRequestStatus: "pending" }
              : c
          )
        );
        closeDeleteModal();
      } else {
        toast.error(data.error || "Failed to send delete request");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send delete request");
    } finally {
      setIsDeleting(false);
    }
  };

  const openCancelModal = (cls: ClassItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setClassToCancel(cls);
    setCancelCreditDeduction("no");
    setCancelReason("");
    setCancelClassModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelClassModalOpen(false);
    setClassToCancel(null);
    setCancelCreditDeduction("no");
    setCancelReason("");
  };

  const handleCancelClassSubmit = async () => {
    if (!classToCancel || !cancelReason.trim()) return;
    try {
      setIsSubmittingCancel(true);
      const res = await fetch("/Api/relationship-manager/class/cancel-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          classId: classToCancel._id,
          creditDeduction: cancelCreditDeduction === "yes",
          reasonForCancellation: cancelReason
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to submit cancellation request");
        return;
      }
      setPendingResetRequests(prev => [...prev, data.data]);
      toast.success("Cancellation request sent to Team Lead");
      closeCancelModal();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmittingCancel(false);
    }
  };


  if (classesLoading && classes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
          <span className="text-sm text-gray-500">Loading classes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/relationshipmanager"
            className="inline-flex items-center gap-2 text-purple-600 hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Back to tutors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/relationshipmanager"
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {tutor?.username ? `${tutor.username}'s` : "Tutor"} Classes
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Calendar view with students
              </p>
            </div>
          </div>
          <div>
            <Link
              href={`/relationshipmanager/tutor/${tutorId}/feedbacks`}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-500 transition-colors inline-block text-sm"
            >
              View Student Feedbacks
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Calendar toolbar */}
          <div className="flex flex-wrap justify-between items-center gap-4 p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                ‹
              </button>
              <span className="font-medium text-gray-900 min-w-[200px] text-center">
                {activeView === "month"
                  ? currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                  : currentDate.toLocaleDateString("en-US", {
                    day: "2-digit",
                    weekday: "long",
                    month: "long",
                    year: "numeric",
                  })}
              </span>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                ›
              </button>
              <button
                onClick={() => triggerViewTransition(() => setCurrentDate(new Date()))}
                className="ml-2 px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Today
              </button>
            </div>
            <div className="flex gap-2">
              {(["day", "week", "month"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => triggerViewTransition(() => setActiveView(view))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${activeView === view
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar content */}
          <div className="p-4 relative min-h-[300px]">
            {viewLoading && (
              <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] z-20 flex items-center justify-center transition-all duration-200">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600" />
                  <span className="text-xs text-gray-500 font-medium">Updating view...</span>
                </div>
              </div>
            )}
            {activeView === "month" && (
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-xs font-medium text-gray-500"
                  >
                    {d}
                  </div>
                ))}
                {generateMonthDays(currentDate).map((d, idx) => {
                  const dayClasses = d ? getClassesForDay(d) : [];
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (d) {
                          triggerViewTransition(() => {
                            setCurrentDate(d);
                            setActiveView("day");
                          });
                        }
                      }}
                      className={`min-h-[90px] p-2 border rounded-lg ${d
                        ? "bg-white cursor-pointer hover:bg-gray-50 border-gray-200"
                        : "bg-transparent border-transparent"
                        }`}
                    >
                      {d && (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {d.getDate()}
                          </div>
                          <div className="mt-1">
                            {dayClasses.length > 0 ? (
                              <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                                {dayClasses.length} class
                                {dayClasses.length !== 1 ? "es" : ""}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {(activeView === "day" || activeView === "week") && (
              <>
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${weekDays.length}, minmax(0, 1fr))`,
                  }}
                >
                  {weekDays.map((day, idx) => {
                    const dayClasses = getClassesForDate(day);
                    return (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-100 px-3 py-2 text-center">
                          <div className="font-medium text-gray-900 text-sm">
                            {day.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {day.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                        <div className="p-2 space-y-2 min-h-[120px]">
                          {dayClasses.length === 0 ? (
                            <div className="text-xs text-gray-400 text-center py-4">
                              No classes
                            </div>
                          ) : (
                            dayClasses.map((cls) => {
                              const style = getStatusStyle(cls);
                              return (
                                <div
                                  key={cls._id}
                                  className={`p-2 rounded-lg border-l-4 ${style.bg} ${style.border} text-xs relative cursor-pointer hover:shadow-md transition-shadow`}
                                  onClick={() => {
                                    setSelectedClassForAttendance(cls);
                                    setAttendanceModalOpen(true);
                                  }}
                                >
                                  <div className="flex justify-between items-start gap-1">
                                    <div className={`font-semibold truncate ${style.text} ${style.strikethrough || ""}`}>
                                      {cls.title || "Class"}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                                      <span
                                        className={`w-2 h-2 rounded-full ${style.dot}`}
                                        title={style.label}
                                      ></span>
                                      {cls.deleteRequestStatus === "pending" ? (
                                        <span className="text-[10px] bg-orange-100 text-orange-700 px-1 py-0.5 rounded whitespace-nowrap">
                                          Delete Requested
                                        </span>
                                      ) : cls.deleteRequestStatus === "approved" ? (
                                        <span className="text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded whitespace-nowrap">
                                          Deleted
                                        </span>
                                      ) : cls.status === "scheduled" || cls.status === "rescheduled" ? (
                                        <>
                                          {/* Check if cancel request already pending for this class */}
                                          {pendingResetRequests.some(
                                            (req: any) => req.requestType === "class" &&
                                              String(req.classItem?._id || req.classItem) === String(cls._id) &&
                                              req.status === "pending"
                                          ) ? (
                                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1 py-0.5 rounded whitespace-nowrap">
                                              Cancel Requested
                                            </span>
                                          ) : (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openCancelModal(cls, e);
                                              }}
                                              title="Cancel Class"
                                              className="text-gray-400 hover:text-orange-500 transition-colors p-0.5"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openDeleteModal(cls);
                                            }}
                                            title="Request Delete"
                                            className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      ) : null}
                                    </div>
                                  </div>
                                  <div className="text-[11px] opacity-90 mt-0.5">
                                    {formatTime(cls.startTime, cls.endTime)}
                                  </div>
                                  {cls.course && (
                                    <div className="text-[11px] opacity-80 mt-0.5">
                                      {cls.course}
                                    </div>
                                  )}
                                  <div className="mt-1.5 font-medium text-gray-700">
                                    {cls.students.length > 0 ? (
                                      cls.students.map((s) => (
                                        <div key={s._id} className="mb-0.5">
                                          <div>
                                            {s.username || s.email || "—"}
                                          </div>
                                          {s.address && (
                                            <div className="text-[10px] text-gray-500 truncate">
                                              {s.address}
                                            </div>
                                          )}
                                        </div>
                                      ))
                                    ) : (
                                      <span className="italic">No students</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Status Legend */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex flex-wrap gap-4 items-center justify-center">
              {Object.entries(STATUS_COLORS).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className={`inline-block w-4 h-4 rounded-full border ${val.dot} ${val.border}`}
                  ></span>
                  <span
                    className={`text-xs text-gray-700 ${val.strikethrough || ""}`}
                  >
                    {val.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Class Details Table</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Showing details for {visibleClasses.length} class{visibleClasses.length !== 1 ? "es" : ""} in the current view
                </p>
              </div>
            </div>
            {/* Day filter for week view */}
            {activeView === "week" && (
              <>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs font-medium text-gray-500">Filter by day:</span>
                <button
                  onClick={() => setSelectedDayFilter(null)}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                    selectedDayFilter === null
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {weekDays.map((day) => {
                  const dayStr = day.toLocaleDateString("en-US", { weekday: "short", timeZone: userTz });
                  const dateStr = day.toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: userTz });
                  const classCount = classes.filter((c) => isSameDay(c.startTime, day, userTz)).length;
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDayFilter(selectedDayFilter === dayStr ? null : dayStr)}
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-colors flex items-center gap-1 ${
                        selectedDayFilter === dayStr
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {dayStr} {dateStr}
                      {classCount > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          selectedDayFilter === dayStr ? "bg-white/20" : "bg-purple-100 text-purple-600"
                        }`}>
                          {classCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Daily Summary WhatsApp Button */}
              <div className="mt-3">
                <button
                  onClick={() => {
                    // Use the filtered day if selected, otherwise use today or first day with classes
                    if (selectedDayFilter) {
                      const matchingDay = weekDays.find(day => {
                        const dayStr = day.toLocaleDateString("en-US", { weekday: "short", timeZone: userTz });
                        return dayStr === selectedDayFilter;
                      });
                      if (matchingDay) setDailySummaryDay(matchingDay);
                    } else {
                      // Find today or first day with classes
                      const today = new Date();
                      const todayInWeek = weekDays.find(day => {
                        const d1 = day.toLocaleDateString("en-US", { timeZone: userTz });
                        const d2 = today.toLocaleDateString("en-US", { timeZone: userTz });
                        return d1 === d2;
                      });
                      setDailySummaryDay(todayInWeek || weekDays[0]);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  📋 Send Daily Summary
                </button>
              </div>
              </>
            )}
          </div>
          
          <div className="p-6 pt-0">
            <div className="overflow-x-auto relative min-h-[150px]">
              {viewLoading && (
                <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] z-20 flex items-center justify-center transition-all duration-200">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600" />
                    <span className="text-xs text-gray-500 font-medium">Updating list...</span>
                  </div>
                </div>
              )}
              {visibleClasses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">No classes scheduled in this range</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{ paddingLeft: "1.5rem" }}>
                        Class Title / Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span className="flex items-center justify-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </span>
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Sent
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{ paddingRight: "1.5rem" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visibleClasses.map((cls) => {
                      const statusStyle = getStatusStyle(cls);
                      const isCancelPending = pendingResetRequests.some(
                        (req: any) => req.requestType === "class" &&
                          String(req.classItem?._id || req.classItem) === String(cls._id) &&
                          req.status === "pending"
                      );

                      return (
                        <tr key={cls._id} className={`transition-colors ${(cls.whatsappSentCount || 0) > 0 ? "bg-gray-100 opacity-60" : "hover:bg-gray-50"}`}>
                          <td className="px-6 py-4 whitespace-nowrap" style={{ paddingLeft: "1.5rem" }}>
                            <div className="text-sm font-bold text-gray-900">{cls.title || "Class"}</div>
                            {cls.course && (
                              <div className="text-xs text-gray-500 mt-0.5">{cls.course}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {formatInTz(cls.startTime, userTz, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatTime(cls.startTime, cls.endTime)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {cls.students.length > 0 ? (
                              <div className="flex flex-col gap-1.5 max-w-xs">
                                {cls.students.map((student) => (
                                  <div key={student._id} className="text-xs">
                                    <div className="font-semibold text-gray-900 flex items-center gap-1">
                                      <span>{student.username || student.email || "—"}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setStudentInfoId(student._id);
                                        }}
                                        className="p-0.5 rounded-full hover:bg-purple-100 text-purple-400 hover:text-purple-600 transition-colors"
                                        title="View student info"
                                      >
                                        <Info className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    {student.address && (
                                      <div className="text-[10px] text-gray-500 truncate" title={student.address}>
                                        {student.address}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No students</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                              {statusStyle.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setWhatsappModalClass(cls);
                              }}
                              title="Send WhatsApp Notification"
                              className="p-2 rounded-lg transition-all hover:scale-110"
                              style={{
                                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)',
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                            </button>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              (cls.whatsappSentCount || 0) > 0
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-gray-100 text-gray-400 border border-gray-200"
                            }`}>
                              {cls.whatsappSentCount || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" style={{ paddingRight: "1.5rem" }}>
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedClassForAttendance(cls);
                                  setAttendanceModalOpen(true);
                                }}
                                title="Manage Attendance"
                                className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                              >
                                <ClipboardCheck className="w-4 h-4" />
                              </button>
                              {cls.deleteRequestStatus === "pending" ? (
                                <span className="inline-flex items-center text-[10px] bg-orange-100 text-orange-700 px-2.5 py-1.5 rounded-lg border border-orange-200 font-medium">
                                  Delete Requested
                                </span>
                              ) : cls.deleteRequestStatus === "approved" ? (
                                <span className="inline-flex items-center text-[10px] bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg border border-red-200 font-medium">
                                  Deleted
                                </span>
                              ) : cls.status === "scheduled" || cls.status === "rescheduled" ? (
                                <>
                                  {isCancelPending ? (
                                    <span className="inline-flex items-center text-[10px] bg-orange-100 text-orange-700 px-2.5 py-1.5 rounded-lg border border-orange-200 font-medium">
                                      Cancel Requested
                                    </span>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openCancelModal(cls, e);
                                      }}
                                      title="Cancel Class"
                                      className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeleteModal(cls);
                                    }}
                                    title="Request Delete"
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Attendance Details Modal */}
      {attendanceModalOpen && selectedClassForAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative">
            <button
              onClick={() => {
                setAttendanceModalOpen(false);
                setSelectedClassForAttendance(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedClassForAttendance.title || "Class"}</h3>
            <p className="text-xs text-gray-500 mb-4">{formatTime(selectedClassForAttendance.startTime, selectedClassForAttendance.endTime)}</p>

            <div className="max-h-60 overflow-y-auto pr-2">
              <div className="space-y-2">
                {selectedClassForAttendance.students.length > 0 ? (
                  selectedClassForAttendance.students.map((student) => {
                    let studentStatus = "pending";
                    const records = attendanceMap[student._id];
                    if (records) {
                      const record = records.find((r: any) =>
                        r.classId === selectedClassForAttendance._id || r.sessionId === selectedClassForAttendance._id
                      );
                      if (record?.status) studentStatus = record.status;
                    }

                    const normalizedStatus = studentStatus === "canceled" ? "cancelled" : studentStatus;
                    const sc = STATUS_COLORS[normalizedStatus] || STATUS_COLORS.pending;
                    const isEditing = editingStudentId === student._id;
                    const isSingleStudent = selectedClassForAttendance.students.length === 1;
                    const showCreditOption = selectedNewStatus === "cancelled" && !isSingleStudent;

                    return (
                      <div key={student._id} className="flex flex-col gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-900">
                              {student.username || student.email || "—"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setStudentInfoId(student._id);
                              }}
                              className="p-0.5 rounded-full hover:bg-purple-100 text-purple-400 hover:text-purple-600 transition-colors"
                              title="View student info"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {!isEditing ? (
                            <div className="flex items-center gap-2">
                              {(() => {
                                const isResetRequested = pendingResetRequests.some((req: any) =>
                                  String(req.student) === String(student._id) &&
                                  String(req.classItem) === String(selectedClassForAttendance._id)
                                );

                                return isResetRequested ? (
                                  <span className="text-[10px] px-2 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 font-medium">
                                    Reset Requested
                                  </span>
                                ) : (
                                  <>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.text} border ${sc.border}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                                      {sc.label}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setEditingStudentId(student._id);
                                        setSelectedNewStatus("");
                                        setCreditDeduction("no");
                                        setCancellationReason("");

                                      }}
                                      className="text-[10px] px-2 py-1 rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                      Reset
                                    </button>
                                  </>
                                );
                              })()}
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingStudentId(null); setSelectedNewStatus(""); setCancellationReason(""); }}
                              className="text-[10px] text-gray-400 hover:text-gray-600"
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                        {isEditing && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedNewStatus}
                                onChange={(e) => {
                                  setSelectedNewStatus(e.target.value);
                                  setCreditDeduction("no");
                                  setCancellationReason("");
                                }}
                                className="text-xs px-2 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1"
                              >
                                <option value="">Select status...</option>
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                disabled={
                                  !selectedNewStatus ||
                                  resettingStudentId === student._id ||
                                  (selectedNewStatus === "cancelled" && !cancellationReason.trim())
                                }
                                onClick={() =>
                                  submitAttendanceReset(
                                    student._id,
                                    selectedClassForAttendance._id,
                                    selectedNewStatus,
                                    creditDeduction,
                                    isSingleStudent,
                                    cancellationReason
                                  )
                                }
                                className="text-[10px] px-3 py-1.5 rounded-lg bg-purple-600 text-white disabled:opacity-50 hover:bg-purple-700 transition-colors whitespace-nowrap"
                              >
                                {resettingStudentId === student._id ? "Saving..." : "Confirm"}
                              </button>
                            </div>

                            {showCreditOption && (
                              <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                                <span className="font-medium">Credit deduction?</span>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input type="radio" name={`credit-${student._id}`} value="yes"
                                    checked={creditDeduction === "yes"}
                                    onChange={() => setCreditDeduction("yes")} />
                                  With
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input type="radio" name={`credit-${student._id}`} value="no"
                                    checked={creditDeduction === "no"}
                                    onChange={() => setCreditDeduction("no")} />
                                  Without
                                </label>
                              </div>
                            )}

                            {selectedNewStatus === "cancelled" && (
                              <CancellationReasonPicker
                                value={cancellationReason}
                                onChange={setCancellationReason}
                                onReset={() => setCancellationReason("")}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 italic">No students assigned to this class.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setAttendanceModalOpen(false);
                  setSelectedClassForAttendance(null);
                  setEditingStudentId(null);
                  setSelectedNewStatus("");
                  setCancellationReason("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative">
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Class</h3>

            <div className="text-gray-600 text-sm mb-6">
              {classToDelete.students.length > 1 ? (
                <>
                  <p className="mb-4 text-gray-600">
                    Select the students you want to remove from <span className="font-semibold text-gray-900">{classToDelete.title}</span>.
                    If all students are selected, the entire class will be deleted. This request will be sent to your team lead.
                  </p>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-colors hover:bg-gray-50 mb-2"
                    >
                      <span className="text-gray-700 text-sm font-medium">
                        {selectedStudentsForDelete.length === 0
                          ? "Select students..."
                          : selectedStudentsForDelete.length === classToDelete.students.length
                            ? "All students selected"
                            : `${selectedStudentsForDelete.length} student${selectedStudentsForDelete.length > 1 ? 's' : ''} selected`}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mt-1">
                        {/* Select All Row */}
                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                          <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={selectedStudentsForDelete.length === classToDelete.students.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentsForDelete(classToDelete.students.map(s => s._id));
                                } else {
                                  setSelectedStudentsForDelete([]);
                                }
                              }}
                              className="w-5 h-5 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer transition flex-shrink-0"
                            />
                            <span className="font-semibold text-sm text-gray-900">Select All Students</span>
                          </label>
                        </div>

                        {/* Individual Students List */}
                        <div className="max-h-52 overflow-y-auto p-2 flex flex-col gap-1">
                          {classToDelete.students.map((student) => (
                            <label
                              key={student._id}
                              className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors select-none group"
                            >
                              <input
                                type="checkbox"
                                checked={selectedStudentsForDelete.includes(student._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudentsForDelete(prev => [...prev, student._id]);
                                  } else {
                                    setSelectedStudentsForDelete(prev => prev.filter(id => id !== student._id));
                                  }
                                }}
                                className="w-5 h-5 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer transition flex-shrink-0"
                              />
                              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                {student.username || student.email || "—"}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p>
                  Are you sure you want to request deletion for{" "}
                  <span className="font-semibold">{classToDelete.title}</span>? This
                  request will be sent to your team lead for approval.
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRequest}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center"
              >
                {isDeleting ? "Requesting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Cancel Class Modal */}
      {cancelClassModalOpen && classToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative">
            <button
              onClick={closeCancelModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Cancel Class</h3>
            <p className="text-xs text-gray-500 mb-1">
              {classToCancel.title} · {formatTime(classToCancel.startTime, classToCancel.endTime)}
            </p>
            <p className="text-xs text-gray-600 mb-4">
              This will cancel the class for{" "}
              <span className="font-semibold">{classToCancel.students.length} student(s)</span>.
              A request will be sent to the Team Lead for approval.
            </p>

            <div className="flex flex-col gap-4">
              {/* Credit deduction — only for multi-student */}
              {classToCancel.students.length > 1 && (
                <div className="flex items-center justify-between px-3 py-2.5 border border-amber-200 rounded-xl bg-amber-50">
                  <div>
                    <p className="text-sm font-medium text-amber-800">Credit Deduction</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      {cancelCreditDeduction === "yes"
                        ? "Attendance marked absent — credit deducted"
                        : "Attendance marked cancelled — no credit impact"}
                    </p>
                  </div>
                  <button
                    onClick={() => setCancelCreditDeduction(p => p === "yes" ? "no" : "yes")}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${cancelCreditDeduction === "yes" ? "bg-amber-500" : "bg-gray-300"
                      }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${cancelCreditDeduction === "yes" ? "translate-x-5" : "translate-x-0"
                      }`} />
                  </button>
                </div>
              )}

              <CancellationReasonPicker
                value={cancelReason}
                onChange={setCancelReason}
                onReset={() => setCancelReason("")}
              />

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={closeCancelModal}
                  disabled={isSubmittingCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelClassSubmit}
                  disabled={isSubmittingCancel || !cancelReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingCancel ? "Submitting..." : "Send to Team Lead"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Notification Modal */}
      {whatsappModalClass && (
        <WhatsAppNotificationModal
          classData={whatsappModalClass}
          userTz={userTz}
          onClose={() => setWhatsappModalClass(null)}
          onSend={async (classId) => {
            try {
              const res = await fetch("/Api/classes/whatsapp-sent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classId }),
              });
              const data = await res.json();
              if (data.success) {
                // Update the local classes state with the new count
                setClasses((prev) =>
                  prev.map((c) =>
                    c._id === classId
                      ? { ...c, whatsappSentCount: data.whatsappSentCount }
                      : c
                  )
                );
              }
            } catch (err) {
              console.error("Failed to update sent count:", err);
            }
          }}
        />
      )}

      {/* Daily Summary WhatsApp Modal */}
      {dailySummaryDay && (() => {
        const dayClasses = classes.filter((c) => isSameDay(c.startTime, dailySummaryDay, userTz));
        const dayLabel = dailySummaryDay.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: userTz,
        });
        // Collect all unique WhatsApp groups from all students in all classes for this day
        const groupMap = new Map<string, { name: string; link: string }>();
        dayClasses.forEach((cls) => {
          cls.students.forEach((student) => {
            (student as any).whatsappGroups?.forEach((group: any) => {
              if (group.link && !groupMap.has(group.link)) {
                groupMap.set(group.link, { name: group.name || group.link, link: group.link });
              }
            });
          });
        });
        const allGroups = Array.from(groupMap.values());

        return (
          <DailySummaryWhatsAppModal
            classes={dayClasses}
            dayLabel={dayLabel}
            userTz={userTz}
            whatsappGroups={allGroups}
            onClose={() => setDailySummaryDay(null)}
          />
        );
      })()}

      {/* Student Info Popup */}
      {studentInfoId && (
        <StudentInfoPopup
          studentId={studentInfoId}
          onClose={() => setStudentInfoId(null)}
        />
      )}
    </div>
  );
}
