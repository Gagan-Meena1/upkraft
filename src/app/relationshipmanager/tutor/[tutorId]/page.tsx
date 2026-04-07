"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronDown, Trash2, X } from "lucide-react";
import { formatTimeRangeInTz, getUserTimeZone } from "@/helper/time";
import { toast } from "react-hot-toast";

interface Student {
  _id: string;
  username?: string;
  email?: string;
  address?: string;
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
  const [loading, setLoading] = useState(true);
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
  const [resettingAttendanceFor, setResettingAttendanceFor] = useState<string | null>(null);
  const [pendingResetRequests, setPendingResetRequests] = useState<any[]>([]);

  const resetAttendance = async (studentId: string, classId: string) => {
    try {
      setResettingAttendanceFor(studentId);
      const res = await fetch("/Api/relationship-manager/attendance/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, classId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingResetRequests(prev => [...prev, data.data]);
        toast?.success?.("Attendance reset requested sent to Team Lead.");
      } else {
        alert(data.error || data.message || "Failed to request attendance reset");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to request attendance reset");
    } finally {
      setResettingAttendanceFor(null);
    }
  };

  const userTz = getUserTimeZone();

  useEffect(() => {
    if (!tutorId) {
      setLoading(false);
      setError("Tutor not found");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/Api/relationship-manager/tutor/${tutorId}/classes`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load classes");
        }

        const loadedClasses = data.classes || [];
        setTutor(data.tutor || null);
        setClasses(loadedClasses);
        setPendingResetRequests(data.pendingResetRequests || []);

        const studentIds = new Set<string>();
        loadedClasses.forEach((cls: ClassItem) => {
          cls.students?.forEach((s) => studentIds.add(s._id));
        });

        if (studentIds.size > 0) {
          try {
            const attRes = await fetch("/Api/student/attendanceData", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ studentIds: Array.from(studentIds) })
            });
            const attData = await attRes.json();
            if (attData.success && attData.data) {
              setAttendanceMap(attData.data);
            }
          } catch (e) {
            console.error("Failed to fetch attendance for RM view", e);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load calendar");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutorId]);

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
      const d = cloneDate(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const weekDays = activeView === "day" ? [currentDate] : getWeekDays();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
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
                onClick={() => setCurrentDate(new Date())}
                className="ml-2 px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Today
              </button>
            </div>
            <div className="flex gap-2">
              {(["day", "week", "month"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
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
          <div className="p-4">
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
                          setCurrentDate(d);
                          setActiveView("day");
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
                      const record = records.find((r: any) => r.classId === selectedClassForAttendance._id || r.sessionId === selectedClassForAttendance._id);
                      if (record && record.status) {
                        studentStatus = record.status;
                      }
                    }
                    
                    const sc = STATUS_COLORS[studentStatus] || STATUS_COLORS.pending;
                    
                    const isResetRequested = pendingResetRequests.some((req: any) => 
                      req.student === student._id && req.classItem === selectedClassForAttendance._id
                    );

                    return (
                      <div key={student._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{student.username || student.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.text} border ${sc.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                            {sc.label}
                          </span>
                          {studentStatus === "absent" && (
                            <button
                              disabled={isResetRequested || resettingAttendanceFor === student._id}
                              onClick={() => resetAttendance(student._id, selectedClassForAttendance._id)}
                              className={`text-[10px] px-2 py-1 rounded border transition-colors disabled:opacity-50 ${isResetRequested ? 'text-orange-700 bg-orange-100 border-orange-200' : 'text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border-red-200'}`}
                            >
                              {isResetRequested ? "Reset Requested" : resettingAttendanceFor === student._id ? "Requesting..." : "Reset"}
                            </button>
                          )}
                        </div>
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
    </div>
  );
}
