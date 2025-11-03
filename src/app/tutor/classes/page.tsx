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

    const dateString = formatDateToString(year, month, day);
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
  const validateDateTime = (
    date: string,
    startTime: string,
    endTime: string
  ) => {
    if (!date || !startTime || !endTime) return "";

    const { year, month, day } = parseDateString(date);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Create date objects using local timezone
    const startDateTime = new Date(year, month, day, startHour, startMinute);
    const endDateTime = new Date(year, month, day, endHour, endMinute);
    const currentDateTime = new Date();

    // Check if start time is in the past
    // if (startDateTime <= currentDateTime) {
    //   return "Start time cannot be in the past";
    // }

    // Check if end time is after start time
    if (endDateTime <= startDateTime) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Parse date and time components
      const { year, month, day } = parseDateString(sessionForm.date);
      const [startHour, startMinute] = sessionForm.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = sessionForm.endTime.split(":").map(Number);

      // Create datetime objects for validation
      const sessionDateTime = new Date(
        year,
        month,
        day,
        startHour,
        startMinute
      );
      const endDateTime = new Date(year, month, day, endHour, endMinute);
      const currentDateTime = new Date();

      // Validation checks
      // if (sessionDateTime <= currentDateTime) {
      //   throw new Error("Cannot create sessions for past date and time");
      // }

      if (endDateTime <= sessionDateTime) {
        throw new Error("End time must be after start time");
      }

      // Create form data for submission
      const formData = new FormData();
      formData.append("title", sessionForm.title);
      formData.append("description", sessionForm.description);

      // Send date and time as separate values to maintain precision
      formData.append("date", sessionForm.date); // YYYY-MM-DD format
      formData.append("startTime", sessionForm.startTime); // HH:MM format
      formData.append("endTime", sessionForm.endTime); // HH:MM format

      // Add timezone information - use user's saved timezone, fallback to device timezone
      const timezoneToSend = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      formData.append("timezone", timezoneToSend);

      if (sessionForm.video) {
        formData.append("video", sessionForm.video);
      }

      // Submit to the API
      const response = await fetch("/Api/classes", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create session");
      }

      // Success!
      alert("Session created successfully!");
      router.push(`/tutor/courses/${courseId}`);
    } catch (error) {
      console.error("Error creating session:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create session"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href={"/tutor/calendar"}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Add New Session
            </h1>
          </div>
        </header>

        {/* Calendar container */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
          {/* Calendar header */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
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
                className="p-1.5 sm:p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 sm:p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
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
                        } ${isToday ? "text-orange-600 font-bold" : ""}`}
                      >
                        {day}
                      </span>
                      {(
                        <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
            <div className="bg-gradient-to-r bg-purple-40 rounded-xl p-4 sm:p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-pink-200">
                  <span className="hidden sm:inline">
                    Create Session for {selectedDate}
                  </span>
                  <span className="sm:hidden">Create Session</span>
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-300 hover:text-white p-1"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-blue-200 mb-1 text-sm sm:text-base"
                    >
                      Class Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={sessionForm.title}
                      onChange={handleFormChange}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg bg-blue-900 border border-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base"
                      placeholder="e.g., Advanced Mathematics"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-blue-200 mb-1 text-sm sm:text-base"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={sessionForm.description}
                      onChange={handleFormChange}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg bg-blue-900 border border-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 h-20 sm:h-24 text-sm sm:text-base"
                      placeholder="Class description and notes..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label
                        htmlFor="startTime"
                        className="block text-blue-200 mb-1 text-sm sm:text-base"
                      >
                        Start Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute top-2.5 sm:top-3 left-3 text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type="time"
                          id="startTime"
                          name="startTime"
                          value={sessionForm.startTime}
                          onChange={handleFormChange}
                          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 rounded-lg bg-blue-900 border border-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="endTime"
                        className="block text-blue-200 mb-1 text-sm sm:text-base"
                      >
                        End Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute top-2.5 sm:top-3 left-3 text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type="time"
                          id="endTime"
                          name="endTime"
                          value={sessionForm.endTime}
                          onChange={handleFormChange}
                          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 rounded-lg bg-blue-900 border border-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Display selected date for confirmation */}
                  <div className="bg-blue-900 p-3 rounded-lg">
                    <span className="text-blue-200 text-sm">
                      Selected Date:{" "}
                    </span>
                    <span className="text-white font-medium">
                      {selectedDate}
                    </span>
                  </div>

                  {/* Error message display */}
                  {errorMessage && (
                    <div className="bg-red-900 text-white p-2 sm:p-3 rounded-lg text-sm sm:text-base">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-400 hover:to-blue-400 rounded-lg font-semibold shadow-md transition-colors disabled:opacity-50 text-sm sm:text-base"
                    disabled={isSubmitting || !!errorMessage}
                  >
                    {isSubmitting ? "Creating..." : "Create Session"}
                  </button>
                </div>
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
