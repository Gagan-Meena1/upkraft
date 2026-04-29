"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { formatInTz, formatTimeRangeInTz, getUserTimeZone } from "@/helper/time";
import CalendarControls from "@/app/components/calendar/CalendarControls";
import {
  CALENDAR_STATUS_COLORS,
  getCalendarStatusColor,
  resolveCalendarClassStatus,
} from "@/app/components/calendar/status";

interface UserData {
  _id: string;
  username?: string;
  name?: string;
  email?: string;
  timezone?: string;
  category: string;
}

const STATUS_COLORS = CALENDAR_STATUS_COLORS;

const StudentCalendarView = () => {
  const router = useRouter();
  // remove tutor/students list focus; add own schedule + assignments
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  
  // Add view state
  const [activeView, setActiveView] = useState<"day" | "week" | "month">("week");
  const handleSetView = (v: "day" | "week" | "month") => {
    setActiveView(v);
  };
 
  // fetch attendance for current student (used to display present/absent)
  useEffect(() => {
    if (!userId) return;

    const fetchAttendance = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
          console.warn("No auth token found for attendance fetch");
          setAttendanceRecords([]);
          return;
        }

        const res = await fetch("/Api/student/attendanceData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentIds: [userId] }),
        });

        if (!res.ok) {
          console.error("Failed to fetch attendance:", res.status);
          setAttendanceRecords([]);
          return;
        }

        const data = await res.json();
        const uid = String(userId);
        const attendanceForUser =
          (data && data.data && data.data[uid]) || [];

        setAttendanceRecords(
          Array.isArray(attendanceForUser) ? attendanceForUser : []
        );
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
        setAttendanceRecords([]);
      }
    };

    fetchAttendance();
  }, [userId]);

  // Check if mobile
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

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/Api/users/user");
      const data = await res.json();
      setUserId(data.user?._id);
      if (data.user) {
        setUserData(data.user);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const loadMyData = async () => {
      try {
        setLoading(true);
        const [essentialsRes, assignmentsRes] = await Promise.all([
          fetch("/Api/users/essentials"),
          fetch("/Api/assignment"),
        ]);

        // classes
        if (essentialsRes.ok) {
          const essentialsJson = await essentialsRes.json();
          setMyClasses(essentialsJson.classDetails || []); // future classes only
        } else {
          setMyClasses([]);
        }

        // assignments
        if (assignmentsRes.ok) {
          const assignmentsJson = await assignmentsRes.json();
          const list = assignmentsJson?.data?.assignments || [];
          setMyAssignments(Array.isArray(list) ? list : []);
        } else {
          setMyAssignments([]);
        }
      } catch (e) {
        console.error("Failed to load student schedule:", e);
        setMyClasses([]);
        setMyAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    loadMyData();
  }, []);

  const userTz = userData?.timezone || getUserTimeZone();
  const cloneDate = (d: Date) => new Date(d.getTime());

  // Get days for current week (Mon - Sun)
  const getWeekDays = () => {
    const ref = cloneDate(currentDate);
    const day = ref.getDay();
    const diff = ref.getDate() - day + (day === 0 ? -6 : 1); // Monday start
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

  // Generate month days for Month view
  const generateMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay(); // Sunday=0
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const datePartsFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: userTz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    [userTz]
  );

  const getDateKeyInUserTz = useCallback(
    (date: Date | string) => {
      const d = typeof date === "string" ? new Date(date) : date;
      const parts = datePartsFormatter.formatToParts(d);
      const year = parts.find((p) => p.type === "year")?.value || "0000";
      const month = parts.find((p) => p.type === "month")?.value || "00";
      const day = parts.find((p) => p.type === "day")?.value || "00";
      return `${year}-${month}-${day}`;
    },
    [datePartsFormatter]
  );

  const classesByDate = useMemo(() => {
    const grouped = new Map<string, any[]>();
    for (const cls of myClasses) {
      if (!cls?.startTime) continue;
      const key = getDateKeyInUserTz(cls.startTime);
      const list = grouped.get(key);
      if (list) {
        list.push(cls);
      } else {
        grouped.set(key, [cls]);
      }
    }
    return grouped;
  }, [myClasses, getDateKeyInUserTz]);

  const assignmentsByDate = useMemo(() => {
    const grouped = new Map<string, any[]>();
    for (const assignment of myAssignments) {
      if (!assignment?.deadline || assignment?.status === true) continue;
      const key = getDateKeyInUserTz(assignment.deadline);
      const list = grouped.get(key);
      if (list) {
        list.push(assignment);
      } else {
        grouped.set(key, [assignment]);
      }
    }
    return grouped;
  }, [myAssignments, getDateKeyInUserTz]);

  const getMyClassesForDate = useCallback(
    (date: Date) => classesByDate.get(getDateKeyInUserTz(date)) || [],
    [classesByDate, getDateKeyInUserTz]
  );

  const getMyAssignmentsForDate = useCallback(
    (date: Date) => assignmentsByDate.get(getDateKeyInUserTz(date)) || [],
    [assignmentsByDate, getDateKeyInUserTz]
  );

  const changeDay = (deltaDays) => {
    const d = cloneDate(currentDate);
    d.setDate(d.getDate() + deltaDays);
    setCurrentDate(d);
  };

  // Unified navigation: prev / today / next that respect activeView ('day'|'week'|'month')
  const handlePrev = () => {
    if (activeView === "month") {
      // go to previous month (keep to first day of that month for consistent month view)
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
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
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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
        `/student/video-call?url=${encodeURIComponent(data.url)}&userRole=${
          userData.category
        }&token=${encodeURIComponent(data.token || "")}`,
        '_blank'
      );
    } catch (error: any) {
      console.error("[Meeting] Error details:", error);
      toast.error(
        error.message || "Failed to create meeting. Please try again."
      );
    }
  };

  const weekDays = useMemo(
    () => (activeView === "day" ? [currentDate] : getWeekDays()),
    [activeView, currentDate]
  );

  const monthDays = useMemo(() => generateMonthDays(currentDate), [currentDate]);

  const attendanceByClassId = useMemo(() => {
    const lookup = new Map<string, string>();
    for (const rec of attendanceRecords || []) {
      const status = (rec?.status || "pending").toString().toLowerCase();
      if (rec?.classId) lookup.set(String(rec.classId), status);
      if (rec?.sessionId && !lookup.has(String(rec.sessionId))) {
        lookup.set(String(rec.sessionId), status);
      }
    }
    return lookup;
  }, [attendanceRecords]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getClassAttendanceStatus = (classItem: any) => {
    const attendanceStatus = attendanceByClassId.get(String(classItem?._id)) || "pending";
    return resolveCalendarClassStatus(
      classItem?.status,
      attendanceStatus,
      Boolean(classItem?.feedbackId)
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}

      {/* Main Content */}
      <div className="flex-1 min-h-screen align-items-center">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 flex items-center gap-2">
          <Link
                                    href={`/student`}
                                    className="!p-2 !rounded-full !bg-gray-200 !hover:bg-gray-300 !transition-colors !shadow-md !flex-shrink-0"
                                  >
                                    <ChevronLeft className="!text-gray-700 !w-5 !h-5 !sm:w-6 !sm:h-6" />
                                  </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 m-0 p-0">
            Student Calendar
          </h1>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
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
            <CalendarControls
              currentDate={currentDate}
              activeView={activeView}
              onPrev={handlePrev}
              onNext={handleNext}
              onToday={handleToday}
              onSetView={handleSetView}
            />

            {/* Calendar Grid */}
            <div className="mt-2 rounded overflow-hidden">
              {activeView === "month" ? (
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                    {/* <div className="flex gap-2">
                      <button onClick={handlePrev} className="px-3 py-1 rounded bg-gray-100">Prev</button>
                      <button onClick={handleToday} className="px-3 py-1 rounded bg-gray-100">Today</button>
                      <button onClick={handleNext} className="px-3 py-1 rounded bg-gray-100">Next</button>
                    </div> */}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="py-2">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {monthDays.map((d, idx) => {
                      const classCount = d ? getMyClassesForDate(d).length : 0;
                      const assignmentCount = d ? getMyAssignmentsForDate(d).length : 0;
                      const hasItems = classCount + assignmentCount;

                      return (
                        <div
                          key={idx}
                          // clickable whole cell to open day
                          onClick={() => {
                            if (!d) return;
                            setCurrentDate(d);
                            setActiveView("day");
                          }}
                          className={`min-h-[88px] p-2 border rounded ${d ? "bg-white cursor-pointer hover:bg-gray-50" : "bg-transparent"}`}
                        >
                          {d ? (
                            <>
                              <div className="text-sm font-medium">{d.getDate()}</div>

                              <div className="mt-2 text-xs text-gray-600">
                                {hasItems > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                      {classCount} class{classCount !== 1 ? "es" : ""}
                                    </span>
                                    <span className="inline-block px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">
                                      {assignmentCount} assignment{assignmentCount !== 1 ? "s" : ""}
                                    </span>
                                  </div>
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
                  <div className="grid items-stretch bg-white grid-cols-[200px_repeat(7,minmax(0,1fr))]">
                    {/* Label cell */}
                    <div className="p-3 bg-white flex items-center font-medium text-[#212121]">
                      My Schedule
                    </div>
                    {/* Week Day Headers */}
                    {weekDays.map((day, idx) => (
                      <div key={idx} className="p-3 text-center bg-[#F5F5F5]">
                        <div className="text-[16px] font-inter font-medium text-[#212121]">
                          {formatInTz(day, userTz, { day: "2-digit", weekday: "short" })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Body: single row (student) */}
                  <div className="grid items-start bg-white border-t grid-cols-[200px_repeat(7,minmax(0,1fr))]">
                    {/* Row label */}
                    <div className="p-3 border-r border-gray-200 flex items-center">
                      Upcoming Classes & Due Assignments
                    </div>

                    {/* Day cells */}
                    {weekDays.map((day, idx) => {
                      const dayClasses = getMyClassesForDate(day);
                      const dayAssignments = getMyAssignmentsForDate(day);
                      const empty =
                        dayClasses.length === 0 && dayAssignments.length === 0;
                      return (
                        <div key={idx} className="p-3 min-h-[120px]">
                          {empty ? (
                            <div className="h-full flex items-center justify-center">
                              <div className="text-[12px] text-[#E0E0E0]">
                                No items
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Classes */}
                              {dayClasses.map((classItem, cIdx) => {
                                const attendanceStatus = getClassAttendanceStatus(classItem);
                                const statusColor = getCalendarStatusColor(attendanceStatus);

                                return (
                                  <div
                                    key={classItem._id || `c-${cIdx}`}
                                    className={`mb-2 p-2 ${statusColor.bg} border-l-4 ${statusColor.border} text-xs text-[#212121] rounded-md shadow-sm hover:cursor-pointer hover:opacity-90 ${statusColor.strikethrough ? 'overflow-hidden relative' : ''}`}
                                    title={`${classItem.title || "Class"} - ${formatTime(classItem.startTime, classItem.endTime)}`}
                                    onClick={() => handleJoinMeeting(classItem._id)}
                                  >
                                    {statusColor.strikethrough && (
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-full h-0.5 bg-red-500 transform rotate-[-15deg]" />
                                      </div>
                                    )}
                                     <div className="flex items-center justify-between gap-2">
                                       <div className="font-medium text-[13px] truncate">{classItem.title || "Class"}</div>
                                       <span className={`w-2 h-2 rounded-full ${statusColor.dot}`} title={attendanceStatus}></span>
                                     </div>
                                    <div className="text-[11px] text-gray-600 truncate">{formatTime(classItem.startTime, classItem.endTime)}</div>

                                    {classItem.reasonForReschedule &&
                                      (classItem.status === "rescheduled" ||
                                        classItem.status === "edited") && (
                                      <div className="mt-1 text-[10px] text-yellow-700 bg-yellow-50 p-1 rounded">
                                        <span className="font-semibold">Rescheduled:</span>{" "}
                                        {classItem.reasonForReschedule}
                                      </div>
                                    )}

                                    {classItem.reasonForCancelation && (classItem.status === "canceled" || classItem.status === "cancelled") && (
                                      <div className="mt-1 text-[10px] text-red-700 bg-red-50 p-1 rounded">
                                        <span className="font-semibold">Cancelled:</span> {classItem.reasonForCancelation}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Assignments */}
                              {dayAssignments.map((a, aIdx) => (
                                <div
                                  key={a._id || `a-${aIdx}`}
                                  className="mb-2 p-2 bg-purple-50 border-l-4 border-purple-500 text-xs text-[#212121] rounded-md shadow-sm"
                                  title={`${
                                    a.title || "Assignment"
                                  } - Due ${new Date(a.deadline).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                      timeZone: "UTC",
                                    }
                                  )}`}
                                >
                                  <div className="font-medium text-[13px] truncate">
                                    {a.title || "Assignment"}
                                  </div>
                                  <div className="text-[11px] text-gray-600 truncate">
                                    Due{" "}
                                    {new Date(a.deadline).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                        timeZone: "UTC",
                                      }
                                    )}
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 items-center justify-center">
              {Object.entries(STATUS_COLORS).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`inline-block w-4 h-4 rounded-full border ${val.dot} ${val.border}`}></span>
                  <span className={`text-xs text-gray-700 ${val.strikethrough || ""}`}>{val.label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentCalendarView;
