// pages/add-session.tsx
"use client";
import React, { useState } from "react";
import {
  Calendar,
  Clock,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

import TimePicker from 'react-time-picker';
// ADD these
import * as dateFnsTz from 'date-fns-tz';
import { format } from 'date-fns';
import { parseISO, addDays } from 'date-fns';


// Create a non-SSR version of the components
const StudentFeedbackDashboardClient = dynamic(
  () => Promise.resolve(AddSessionPage),
  { ssr: false }
);

interface SessionForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  video: File | null;
}

function AddSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  console.log("courseId : ", courseId);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userTimezone, setUserTimezone] = useState<string | null>(null);
  const [sessionForm, setSessionForm] = useState<SessionForm>({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:30",
    date: "",
    video: null,
  });
  // NEW: recurrence state
  const [repeatType, setRepeatType] = useState<"none" | "daily" | "weekly" | "weekdays">("none");
  // String input so you can clear and type freely; parse on submit
  const [repeatCountInput, setRepeatCountInput] = useState<string>("1");
  const [repeatUntil, setRepeatUntil] = useState<string>(""); // yyyy-mm-dd
  // Add these state variables after your existing useState declarations
const [showStartTimePicker, setShowStartTimePicker] = useState(false);
const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // helper: is weekday (Mon-Fri)
  const isWeekday = (date: Date) => {
    const d = date.getDay();
    return d !== 0 && d !== 6;
  };

  // Helper function to format date as YYYY-MM-DD without timezone issues
  const formatDateToString = (
    year: number,
    month: number,
    day: number
  ): string => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  // Helper function to parse date string and return date components
  const parseDateString = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return { year, month: month - 1, day }; // month is 0-indexed for Date constructor
  };

  // Fetch user's timezone
  useEffect(() => {
    const fetchUserTimezone = async () => {
      try {
        const response = await fetch("/Api/users/user");
        const data = await response.json();
        if (data.user?.timezone) {
          setUserTimezone(data.user.timezone);
        }
      } catch (error) {
        console.error("Error fetching user timezone:", error);
      }
    };
    fetchUserTimezone();
  }, []);

  // Helper function to check if a date is in the past (without time consideration)
  const isDateInPast = (year: number, month: number, day: number): boolean => {
    const today = new Date();
    const compareDate = new Date(year, month, day);
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return compareDate < todayDate;
  };

  // Add this helper function in your component
const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;
  
  // Remove everything except digits and colon
  value = value.replace(/[^\d:]/g, '');
  
  // Auto-add colon after 2 digits
  if (value.length === 2 && !value.includes(':')) {
    value = value + ':';
  }
  
  // Limit to 5 characters (HH:MM)
  if (value.length > 5) {
    value = value.slice(0, 5);
  }
  
  e.target.value = value;
  handleFormChange(e);
};

  // Generate calendar days for current month view
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();

    // Total days in month
    const daysInMonth = lastDay.getDate();

    // Calendar array to hold all days
    const calendarDays = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }

    return calendarDays;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number) => {
    if (!day) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Check if date is in the past
    // if (isDateInPast(year, month, day)) {
    //   alert("Cannot create sessions for past dates");
    //   return;
    // }

const dateString = format(new Date(year, month, day), 'yyyy-MM-dd');
    setSelectedDate(dateString);
    setSessionForm({ ...sessionForm, date: dateString });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedDate(null);
    setErrorMessage("");
    // Reset form
    setSessionForm({
      title: "",
      description: "",
      startTime: "09:00",
      endTime: "10:30",
      date: "",
      video: null,
    });
  };

  // Fixed validateDateTime function to avoid timezone issues
  // const validateDateTime = (
  //   date: string,
  //   startTime: string,
  //   endTime: string
  // ) => {
  //   if (!date || !startTime || !endTime) return "";

  //   const { year, month, day } = parseDateString(date);
  //   const [startHour, startMinute] = startTime.split(":").map(Number);
  //   const [endHour, endMinute] = endTime.split(":").map(Number);

  //   // Create date objects using local timezone
  //   const startDateTime = new Date(year, month, day, startHour, startMinute);
  //   const endDateTime = new Date(year, month, day, endHour, endMinute);
  //   const currentDateTime = new Date();

  //   // Check if start time is in the past
  //   // if (startDateTime <= currentDateTime) {
  //   //   return "Start time cannot be in the past";
  //   // }

  //   // Check if end time is after start time
  //   // if (endDateTime <= startDateTime) {
  //   //   return "End time must be after start time";
  //   // }

  //   return "";
  // };
  const validateDateTime = (date: string, startTime: string, endTime: string) => {
  if (!date || !startTime || !endTime) return "";
  
  // Simple check: end time must be after start time
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  if (endMinutes <= startMinutes) {
    return "End time must be after start time";
  }
  
  return "";
};

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const updatedForm = { ...sessionForm, [name]: value };
    setSessionForm(updatedForm);

    // Validate time if start time, end time, or date changes
    if (name === "startTime" || name === "endTime") {
      const validationError = validateDateTime(
        updatedForm.date,
        updatedForm.startTime,
        updatedForm.endTime
      );
      setErrorMessage(validationError);
    }
  };

  // Helpers for occurrences input
  const bumpOccurrences = (delta: number) => {
    const n = parseInt(repeatCountInput || "0", 10);
    const next = isNaN(n) ? 1 : Math.min(999, Math.max(1, n + delta));
    setRepeatCountInput(String(next));
  };
  
  const handleOccurrencesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const STEP = e.shiftKey ? 5 : 1;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      bumpOccurrences(STEP);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      bumpOccurrences(-STEP);
    } else if (e.key === "Home") {
      e.preventDefault();
      setRepeatCountInput("1");
    } else if (e.key === "End") {
      e.preventDefault();
      setRepeatCountInput("999");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // Parse occurrences with bounds
    const parsedCount = (() => {
      const n = parseInt(repeatCountInput, 10);
      if (isNaN(n) || n < 1) return 1;
      return Math.min(n, 999);
    })();

    try {
      // Build occurrences array based on recurrence type
      const occurrences: { date: string; startTime: string; endTime: string }[] = [];

      if (repeatType === "none") {
        occurrences.push({
          date: sessionForm.date,
          startTime: sessionForm.startTime,
          endTime: sessionForm.endTime,
        });
      } else if (repeatType === "weekdays") {
        let currentDate = parseISO(sessionForm.date);
        let added = 0;
        const maxOccurrences = parsedCount > 0 ? parsedCount : 365;
        const untilDate = repeatUntil ? parseISO(repeatUntil) : null;

        while (added < maxOccurrences) {
          // Check if we've passed the "until" date
          if (untilDate && currentDate > untilDate) break;

          const dayOfWeek = currentDate.getDay();
          // 0 = Sunday, 6 = Saturday
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            occurrences.push({
              date: format(currentDate, "yyyy-MM-dd"),
              startTime: sessionForm.startTime,
              endTime: sessionForm.endTime,
            });
            added++;
          }
          
          currentDate = addDays(currentDate, 1);
        }
      } else if (repeatType === "daily") {
        let currentDate = parseISO(sessionForm.date);
        const maxOccurrences = parsedCount > 0 ? parsedCount : 365;
        const untilDate = repeatUntil ? parseISO(repeatUntil) : null;

        for (let i = 0; i < maxOccurrences; i++) {
          if (untilDate && currentDate > untilDate) break;

          occurrences.push({
            date: format(currentDate, "yyyy-MM-dd"),
            startTime: sessionForm.startTime,
            endTime: sessionForm.endTime,
          });

          currentDate = addDays(currentDate, 1);
        }
      } else if (repeatType === "weekly") {
        let currentDate = parseISO(sessionForm.date);
        const maxOccurrences = parsedCount > 0 ? parsedCount : 52;
        const untilDate = repeatUntil ? parseISO(repeatUntil) : null;

        for (let i = 0; i < maxOccurrences; i++) {
          if (untilDate && currentDate > untilDate) break;

          occurrences.push({
            date: format(currentDate, "yyyy-MM-dd"),
            startTime: sessionForm.startTime,
            endTime: sessionForm.endTime,
          });

          currentDate = addDays(currentDate, 7); // Add 7 days
        }
      }

      // Get user's timezone
      const timezoneToSend =
        userTimezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "UTC";

      console.log(`Creating ${occurrences.length} session(s)...`);

      // ONLY generate a recurrenceId for explicit recurring batches (daily, weekly, weekdays)
      const isRecurringBatch = ["daily", "weekly", "weekdays"].includes(repeatType);
      const recurrenceId = isRecurringBatch
        ? (typeof crypto !== "undefined" && (crypto as any).randomUUID
            ? (crypto as any).randomUUID()
            : `rec-${Date.now()}`)
        : null;
   
      // Create each occurrence
      let created = 0;
      for (let idx = 0; idx < occurrences.length; idx++) {
        const occ = occurrences[idx];
   
        const formData = new FormData();
        formData.append("title", sessionForm.title || "");
        formData.append("description", sessionForm.description || "");
        formData.append("date", occ.date); // YYYY-MM-DD
        formData.append("startTime", occ.startTime); // HH:MM
        formData.append("endTime", occ.endTime); // HH:MM
        formData.append("timezone", timezoneToSend);
   
        // Attach recurrence metadata only for recurring batches
        if (isRecurringBatch && recurrenceId) {
          formData.append("recurrenceId", recurrenceId);
          formData.append("recurrenceType", repeatType);
          if (repeatUntil) formData.append("recurrenceUntil", repeatUntil);
        } else {
          formData.append("recurrenceType", "none");
        }
   
       // Include course ID
       if (courseId) {
         formData.append("course", courseId);
         formData.append("courseId", courseId);
       }
   
       // Attach video only for the first occurrence
       if (sessionForm.video && idx === 0) {
         formData.append("video", sessionForm.video);
       }

       const response = await fetch("/Api/classes", {
         method: "POST",
         body: formData,
       });
   
       const result = await response
         .json()
         .catch(() => ({ message: "Invalid response" }));
   
     if (!response.ok) {
       throw new Error(
         result?.message || `Failed creating session on ${occ.date}`
       );
     }
   
     created++;
     console.log(`Created session ${created}/${occurrences.length}`);
   }
   
   alert(`Successfully created ${created} session(s)!`);
   handleCloseForm();
    
    // Navigate back to course page
    if (courseId) {
      router.push(`/tutor/courses/${courseId}`);
    } else {
      router.push("/tutor/calendar");
    }
  } catch (err: any) {
    console.error("Error creating session(s):", err);
    setErrorMessage(err?.message || "Failed to create session(s)");
  } finally {
    setIsSubmitting(false);
  }
};

  // Modify your create/submit handler to create multiple weekly copies
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const basePayload = {
        title: sessionForm.title,
        description: sessionForm.description,
        course: courseId,
        startTime: new Date(sessionForm.startTime).toISOString(),
        endTime: new Date(sessionForm.endTime).toISOString(),
        // include other required fields...
      };

      const createdItems = [];
      if (repeatWeekly && (repeatCount > 1 || repeatUntil)) {
        for (let i = 0; i < Math.max(1, repeatCount); i++) {
          const start = new Date(basePayload.startTime);
          const end = new Date(basePayload.endTime);
          start.setDate(start.getDate() + 7 * i);
          end.setDate(end.getDate() + 7 * i);

          if (repeatUntil) {
            const until = new Date(repeatUntil);
            if (start > until) break;
          }

          const payload = {
            ...basePayload,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            title:
              i === 0
                ? basePayload.title
                : `${basePayload.title} (Copy ${i})`,
          };

          const res = await fetch("/Api/classes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Failed to create class");
          createdItems.push(await res.json());
        }
      } else {
        const res = await fetch("/Api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(basePayload),
        });
        if (!res.ok) throw new Error("Failed to create class");
        createdItems.push(await res.json());
      }

      alert("Class(es) created");
      // refresh your list / calendar here
    } catch (err) {
      console.error(err);
      alert("Failed to create class");
    }
  };
// Add this helper function before the return statement
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) { // 15-minute intervals
      const hourStr = String(hour).padStart(2, '0');
      const minuteStr = String(minute).padStart(2, '0');
      times.push(`${hourStr}:${minuteStr}`);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();
  const calendarDays = generateCalendarDays();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdaysMobile = ["S", "M", "T", "W", "T", "F", "S"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <header className="mb-6 sm:mb-8 flex justify-between items-center">
          <div className="flex !items-center gap-2 sm:gap-4">
            <Link
              href={"/tutor/calendar"}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 !mb-0">
              Add New Session
            </h1>
          </div>
        </header>

        {/* Calendar container */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
          {/* Calendar header */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-800" />
              <span className="hidden sm:inline">
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </span>
              <span className="sm:hidden">
                {monthNames[currentMonth.getMonth()].substring(0, 3)}{" "}
                {currentMonth.getFullYear()}
              </span>
            </h2>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 sm:p-2 !rounded-lg bg-purple-700 hover:bg-purple-600 text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 sm:p-2 !rounded-lg bg-purple-700 hover:bg-purple-600 text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Weekday headers */}
            {weekdays.map((day, index) => (
              <div
                key={day}
                className="text-center py-1 sm:py-2 font-medium text-gray-500 text-xs sm:text-base"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{weekdaysMobile[index]}</span>
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();

              const isToday =
                day &&
                year === new Date().getFullYear() &&
                month === new Date().getMonth() &&
                day === new Date().getDate();

              const isPastDate = day && isDateInPast(year, month, day);

              return (
                <div
                  key={index}
                  className={`relative p-2 sm:p-4 rounded-lg min-h-[3rem] sm:min-h-[4rem] ${
                    day
                      ? isPastDate
                        ?  "bg-white border border-gray-200 hover:bg-orange-50 cursor-pointer transition-colors"
                        : "bg-white border border-gray-200 hover:bg-orange-50 cursor-pointer transition-colors"
                      : "opacity-0"
                  }`}
                  onClick={() => day  && handleDateClick(day)}
                >
                  {day && (
                    <>
                      <span
                        className={`font-medium text-sm sm:text-base ${
                          ""
                        } ${isToday ? "text-purple-600 font-bold" : ""}`}
                      >
                        {day}
                      </span>
                      {(
                        <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 hover:bg-purple-400 text-white rounded-full flex items-center justify-center">
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-white/20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Create New Session
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    For date: {selectedDate}
                  </p>
                </div>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:!text-gray-600 !p-1 !rounded-full hover:!bg-black/5 !transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-gray-600 mb-2 text-sm font-medium"
                  >
                    Class Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={sessionForm.title}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., Advanced Calculus"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-gray-600 mb-2 text-sm font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={sessionForm.description}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-28 transition-all"
                    placeholder="Provide details about the session..."
                    required
                  />
                </div>

                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="startTime"
                      className="block text-gray-600 mb-2 text-sm font-medium"
                    >
                      Start Time
                    </label> */}
                    {/* <div className="relative">
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={sessionForm.startTime}
                        onChange={handleFormChange}
                        className="w-full pl-4 pr-12 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        required
                      /> */}
                      {/* <Clock className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 w-5 h-5 pointer-events-none" /> */}
                    {/* </div>
                  </div> */}

                  {/* <div>
                    <label
                      htmlFor="endTime"
                      className="block text-gray-600 mb-2 text-sm font-medium"
                    >
                      End Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={sessionForm.endTime}
                        onChange={handleFormChange}
                        className="w-full pl-4 pr-12 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        required
                      /> */}
                      {/* <Clock className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 w-5 h-5 pointer-events-none" /> */}
                    {/* </div> */}
                  {/* </div> */}
                {/* </div> */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  {/* Start Time Picker */}
  <div className="relative">
    <label htmlFor="startTime" className="block text-gray-600 mb-2 text-sm font-medium">
      Start Time
    </label>
    <div className="relative">
      <input
        type="text"
        id="startTime"
        name="startTime"
        value={sessionForm.startTime}
        onChange={handleTimeInput}
        onFocus={() => setShowStartTimePicker(true)}
        onKeyPress={(e) => {
          if (!/[\d:]/.test(e.key)) e.preventDefault();
        }}
        pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
        placeholder="09:00"
        maxLength={5}
        className="w-full px-4 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
      <Clock className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 w-5 h-5 pointer-events-none" />
    </div>
    
    {/* Start Time Dropdown */}
    {showStartTimePicker && (
      <>
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowStartTimePicker(false)}
        />
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200">
            <p className="text-xs text-gray-600 font-medium">Select time</p>
          </div>
          {timeOptions.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => {
                setSessionForm({ ...sessionForm, startTime: time });
                setShowStartTimePicker(false);
                const validationError = validateDateTime(
                  sessionForm.date,
                  time,
                  sessionForm.endTime
                );
                setErrorMessage(validationError);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                sessionForm.startTime === time ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              {time}
              {sessionForm.startTime === time && (
                <span className="float-right text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </>
    )}
  </div>

  {/* End Time Picker */}
  <div className="relative">
    <label htmlFor="endTime" className="block text-gray-600 mb-2 text-sm font-medium">
      End Time
    </label>
    <div className="relative">
      <input
        type="text"
        id="endTime"
        name="endTime"
        value={sessionForm.endTime}
        onChange={handleTimeInput}
        onFocus={() => setShowEndTimePicker(true)}
        onKeyPress={(e) => {
          if (!/[\d:]/.test(e.key)) e.preventDefault();
        }}
        pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
        placeholder="10:30"
        maxLength={5}
        className="w-full px-4 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
      <Clock className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 w-5 h-5 pointer-events-none" />
    </div>
    
    {/* End Time Dropdown */}
    {showEndTimePicker && (
      <>
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowEndTimePicker(false)}
        />
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200">
            <p className="text-xs text-gray-600 font-medium">Select time</p>
          </div>
          {timeOptions.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => {
                setSessionForm({ ...sessionForm, endTime: time });
                setShowEndTimePicker(false);
                const validationError = validateDateTime(
                  sessionForm.date,
                  sessionForm.startTime,
                  time
                );
                setErrorMessage(validationError);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                sessionForm.endTime === time ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              {time}
              {sessionForm.endTime === time && (
                <span className="float-right text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </>
    )}
  </div>
</div>
                {/* Recurrence Controls */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Repeat</label>
                    <select
                      value={repeatType}
                      onChange={(e) => setRepeatType(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="none">Does not repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekdays">Weekdays (Mon–Fri)</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Occurrences</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => bumpOccurrences(-1)}
                        disabled={repeatType === "none"}
                        className="px-2 py-2 border rounded bg-white hover:bg-gray-50"
                        aria-label="Decrease occurrences"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 5"
                        value={repeatCountInput}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/[^\d]/g, "");
                          setRepeatCountInput(digits);
                        }}
                        onBlur={() => {
                          if (!repeatCountInput) setRepeatCountInput("1");
                        }}
                        onKeyDown={handleOccurrencesKeyDown}
                        disabled={repeatType === "none"}
                        className="w-full px-3 py-2 border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => bumpOccurrences(1)}
                        disabled={repeatType === "none"}
                        className="px-2 py-2 border rounded bg-white hover:bg-gray-50"
                        aria-label="Increase occurrences"
                      >
                        +
                      </button>
                    </div>
                    {/* <p className="mt-1 text-xs text-gray-500">Type freely, use arrow keys, or click − / +.</p> */}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Or repeat until</label>
                    <input
                      type="date"
                      value={repeatUntil}
                      onChange={(e) => setRepeatUntil(e.target.value)}
                      disabled={repeatType === "none"}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm text-center">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  disabled={isSubmitting || !!errorMessage}
                >
                  {isSubmitting ? "Creating..." : "Create Session"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export this as the default component
export default function ViewPerformancePage() {
  return <StudentFeedbackDashboardClient />;
}
