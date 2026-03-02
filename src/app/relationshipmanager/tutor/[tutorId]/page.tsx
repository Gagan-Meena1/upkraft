"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { formatTimeRangeInTz, getUserTimeZone } from "@/helper/time";

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
}

interface TutorInfo {
  _id: string;
  username?: string;
  email?: string;
}

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  completed: { bg: "bg-green-50", border: "border-green-400", text: "text-green-700" },
  scheduled: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-700" },
  rescheduled: { bg: "bg-amber-50", border: "border-amber-400", text: "text-amber-700" },
  canceled: { bg: "bg-gray-100", border: "border-gray-400", text: "text-gray-600" },
  cancelled: { bg: "bg-gray-100", border: "border-gray-400", text: "text-gray-600" },
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

        setTutor(data.tutor || null);
        setClasses(data.classes || []);
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

  const getStatusStyle = (status?: string) => {
    const key = (status || "scheduled").toLowerCase();
    return STATUS_STYLES[key] || STATUS_STYLES.scheduled;
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
                              const style = getStatusStyle(cls.status);
                              return (
                                <div
                                  key={cls._id}
                                  className={`p-2 rounded-lg border-l-4 ${style.bg} ${style.border} ${style.text} text-xs`}
                                >
                                  <div className="font-semibold truncate">
                                    {cls.title || "Class"}
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
        </div>
      </main>
    </div>
  );
}
