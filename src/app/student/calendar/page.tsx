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
import { formatInTz, formatTimeRangeInTz, getUserTimeZone } from "@/helper/time";

interface UserData {
  _id: string;
  username?: string;
  name?: string;
  email?: string;
  category: string;
}

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

  const cloneDate = (d) => new Date(d.getTime());

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

  // Filter helpers for week/day
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const getMyClassesForDate = (date: Date) => {
    return myClasses.filter((cls) => {
      if (!cls?.startTime) return false;
      const d = new Date(cls.startTime);
      return isSameDay(d, date);
    });
  };

  const getMyAssignmentsForDate = (date: Date) => {
    return myAssignments.filter((a) => {
      if (!a?.deadline || a?.status === true) return false; // show only pending
      const d = new Date(a.deadline);
      return isSameDay(d, date);
    });
  };

  const changeDay = (deltaDays) => {
    const d = cloneDate(currentDate);
    d.setDate(d.getDate() + deltaDays);
    setCurrentDate(d);
  };

  const userTz = userData?.timezone || getUserTimeZone();

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

      router.push(
        `/student/video-call?url=${encodeURIComponent(data.url)}&userRole=${
          userData.category
        }&token=${encodeURIComponent(data.token || "")}`
      );
    } catch (error: any) {
      console.error("[Meeting] Error details:", error);
      toast.error(
        error.message || "Failed to create meeting. Please try again."
      );
    }
  };

  const weekDays = getWeekDays();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const gridTemplate = {
    gridTemplateColumns: "200px repeat(7, minmax(0, 1fr))",
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
      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Student Calendar
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
                <span
                  onClick={() => changeDay(-1)}
                  className="cursor-pointer select-none hover:bg-gray-100 p-2 rounded"
                >
                  {"<"}
                </span>
                <span className="font-medium text-[20px] text-[#212121]">
                  {currentDate.toLocaleDateString("en-US", {
                    day: "2-digit",
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                  })}
                </span>
                <span
                  onClick={() => changeDay(1)}
                  className="cursor-pointer select-none hover:bg-gray-100 p-2 rounded"
                >
                  {">"}
                </span>
              </div>

              <div className="flex gap-[10px]">
                <select className="w-[90px] text-[16px] text-[#505050] border border-[#505050] rounded px-2 py-1 truncate focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option className="truncate">Day</option>
                  <option className="truncate">Today</option>
                  <option className="truncate">Tomorrow</option>
                  <option className="truncate">Custom...</option>
                </select>

                <select className="w-[90px] text-[16px] text-[#505050] border border-[#505050] rounded px-2 py-1 truncate focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option className="truncate">Week</option>
                  <option className="truncate">This Week</option>
                  <option className="truncate">Next Week</option>
                  <option className="truncate">Custom...</option>
                </select>

                <select className="w-[90px] text-[16px] text-[#505050] border border-[#505050] rounded px-2 py-1 truncate focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option className="truncate">Month</option>
                  <option className="truncate">This Month</option>
                  <option className="truncate">Next Month</option>
                  <option className="truncate">Custom...</option>
                </select>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="mt-2 rounded overflow-hidden">
              {/* Header Row */}
              <div className="grid items-stretch bg-white" style={gridTemplate}>
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
              <div
                className="grid items-start bg-white border-t"
                style={gridTemplate}
              >
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
                          {dayClasses.map((classItem, cIdx) => (
                            <div
                              key={classItem._id || `c-${cIdx}`}
                              className="mb-2 p-2 bg-orange-50 border-l-4 border-orange-400 text-xs text-[#212121] rounded-md shadow-sm hover:cursor-pointer hover:bg-orange-100"
                              title={`${
                                classItem.title || "Class"
                              } - ${formatTime(
                                classItem.startTime,
                                classItem.endTime
                              )}`}
                              onClick={() => handleJoinMeeting(classItem._id)}
                            >
                              <div className="font-medium text-[13px] truncate">
                                {classItem.title || "Class"}
                              </div>
                              <div className="text-[11px] text-gray-600 truncate">
                                {formatInTz(classItem.startTime, userTz, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          ))}

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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentCalendarView;
