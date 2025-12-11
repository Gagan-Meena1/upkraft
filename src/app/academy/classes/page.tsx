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
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import TimePicker from 'react-time-picker';
// ADD these
import * as dateFnsTz from 'date-fns-tz';
// import { format } from 'date-fns';
// import { parseISO, addDays } from 'date-fns';
import{ formatInTimeZone } from 'date-fns-tz';
   import { format, parseISO, addDays } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';


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
  const [repeatCount, setRepeatCount] = useState<number>(1); // number of occurrences (including first)
  const [repeatUntil, setRepeatUntil] = useState<string>(""); // yyyy-mm-dd
  const [availableSlots, setAvailableSlots] = useState([]);
const [tutorId, setTutorId] = useState(null);
const [slotsLoading, setSlotsLoading] = useState(false);
const [tutorClasses, setTutorClasses] = useState([]);

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


useEffect(() => {
  const fetchTutorSlots = async () => {
    if (!courseId) return;
    
    setSlotsLoading(true);
    try {
      // First get the course details
      const courseRes = await fetch(`/Api/academy/course?courseId=${courseId}`);
      const courseData = await courseRes.json();
      console.log("Fetched course data:", courseData);
      
      // Get instructor ID from academyInstructorId (first element) or fallback to instructorId
      let instructorId = null;
      
      if (courseData.course.academyInstructorId && courseData.course.academyInstructorId.length > 0) {
        instructorId = courseData.course.academyInstructorId[0]; // Take first instructor from array
        console.log("Using academyInstructorId:", instructorId);
        console.log("Full academyInstructorId array:", courseData.course.academyInstructorId);
      } else if (courseData.instructorId) {
        instructorId = courseData.instructorId; // Fallback to legacy field
      }
      
      if (!instructorId) {
        console.error("No instructor found for this course");
        setErrorMessage("No instructor assigned to this course. Please contact support.");
        return;
      }
      
      setTutorId(instructorId);
         // Fetch tutor's available slots
      const slotsRes = await fetch(`/Api/academy/userDetail?userId=${instructorId}`);
      const slotsData = await slotsRes.json();
      console.log("Fetched tutor slots data:", slotsData);
      
      if (slotsData.user?.slotsAvailable) {
        setAvailableSlots(slotsData.user.slotsAvailable);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching tutor slots:", error);
      setErrorMessage("Failed to load tutor availability. Please try again.");
    } finally {
      setSlotsLoading(false);
    }
  };

  fetchTutorSlots();
  }, [courseId]);



// ADD this helper function to check if time is within available slots
const isTimeInAvailableSlot = (date, startTime, endTime) => {
  if (!availableSlots || availableSlots.length === 0) {
    return { 
      valid: false, 
      message: "No available slots found for this tutor. Please contact them to set up availability." 
    };
  }

  // Get user's timezone (fallback to system timezone)
  const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Parse the session date and times in user's timezone
  const sessionDate = parseISO(date); // YYYY-MM-DD format
  const [sessionStartHour, sessionStartMin] = startTime.split(':').map(Number);
  const [sessionEndHour, sessionEndMin] = endTime.split(':').map(Number);
  
  // Create full datetime objects for the session in user's timezone
  const sessionStart = new Date(sessionDate);
  sessionStart.setHours(sessionStartHour, sessionStartMin, 0, 0);
  
  const sessionEnd = new Date(sessionDate);
  sessionEnd.setHours(sessionEndHour, sessionEndMin, 0, 0);

  // Convert session times to UTC for comparison (since DB stores in UTC)
  const sessionStartUTC = dateFnsTz.fromZonedTime(sessionStart, timezone);
  const sessionEndUTC = dateFnsTz.fromZonedTime(sessionEnd, timezone);

  // Check if session falls within any available slot
  const matchingSlot = availableSlots.find(slot => {
    const slotStartUTC = new Date(slot.startTime); // Already in UTC from DB
    const slotEndUTC = new Date(slot.endTime); // Already in UTC from DB
    
    // Convert slot times to user's timezone for date comparison
    const slotStartLocal = dateFnsTz.toZonedTime(slotStartUTC, timezone);
    const slotEndLocal = dateFnsTz.toZonedTime(slotEndUTC, timezone);
    
    // Check if it's the same day in user's timezone
    const isSameDay = 
      sessionDate.getDate() === slotStartLocal.getDate() &&
      sessionDate.getMonth() === slotStartLocal.getMonth() &&
      sessionDate.getFullYear() === slotStartLocal.getFullYear();
    
    if (!isSameDay) return false;
    
    // Check if session time is within slot time (compare in UTC)
    return sessionStartUTC >= slotStartUTC && sessionEndUTC <= slotEndUTC;
  });

  if (!matchingSlot) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[sessionDate.getDay()];
    
    // Find slots on the same day in user's timezone
    const sameDaySlots = availableSlots.filter(slot => {
      const slotStartUTC = new Date(slot.startTime);
      const slotStartLocal = dateFnsTz.toZonedTime(slotStartUTC, timezone);
      
      return slotStartLocal.getDate() === sessionDate.getDate() &&
             slotStartLocal.getMonth() === sessionDate.getMonth() &&
             slotStartLocal.getFullYear() === sessionDate.getFullYear();
    });
    
    if (sameDaySlots.length === 0) {
      return {
        valid: false,
        message: `No available slots on ${dayName}, ${format(sessionDate, 'MMM dd, yyyy')}. Please choose another date.`
      };
    }
    
    const availableTimes = sameDaySlots.map(s => {
      const startUTC = new Date(s.startTime);
      const endUTC = new Date(s.endTime);
      const startLocal = dateFnsTz.toZonedTime(startUTC, timezone);
      const endLocal = dateFnsTz.toZonedTime(endUTC, timezone);
      return `${format(startLocal, 'HH:mm')}-${format(endLocal, 'HH:mm')}`;
    }).join(', ');
    
    return {
      valid: false,
      message: `This time slot is not available. Available slots on ${format(sessionDate, 'MMM dd')}: ${availableTimes}`
    };
  }

  return { valid: true, message: "" };
};
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

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setErrorMessage("");

  try {
    // Build occurrences array based on recurrence type
    const occurrences = [];

    if (repeatType === "none") {
      occurrences.push({
        date: sessionForm.date,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
      });
    } else if (repeatType === "weekdays") {
      let currentDate = parseISO(sessionForm.date);
      let added = 0;
      const maxOccurrences = repeatCount > 0 ? repeatCount : 365;
      const untilDate = repeatUntil ? parseISO(repeatUntil) : null;

      while (added < maxOccurrences) {
        if (untilDate && currentDate > untilDate) break;

        const dayOfWeek = currentDate.getDay();
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
      const maxOccurrences = repeatCount > 0 ? repeatCount : 365;
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
      const maxOccurrences = repeatCount > 0 ? repeatCount : 52;
      const untilDate = repeatUntil ? parseISO(repeatUntil) : null;

      for (let i = 0; i < maxOccurrences; i++) {
        if (untilDate && currentDate > untilDate) break;

        occurrences.push({
          date: format(currentDate, "yyyy-MM-dd"),
          startTime: sessionForm.startTime,
          endTime: sessionForm.endTime,
        });

        currentDate = addDays(currentDate, 7);
      }
    }

    // ========== VALIDATE ALL OCCURRENCES AGAINST AVAILABLE SLOTS ==========
    const invalidOccurrences = [];
    
    for (const occ of occurrences) {
      const slotCheck = isTimeInAvailableSlot(occ.date, occ.startTime, occ.endTime);
      if (!slotCheck.valid) {
        invalidOccurrences.push({
          date: occ.date,
          reason: slotCheck.message
        });
      }
    }

    // If any occurrence is invalid, show error and stop
    if (invalidOccurrences.length > 0) {
      let errorMsg;
      
      if (invalidOccurrences.length === 1) {
        errorMsg = invalidOccurrences[0].reason;
      } else {
        errorMsg = `${invalidOccurrences.length} sessions fall outside available slots.\n\n`;
        errorMsg += `First issue (${invalidOccurrences[0].date}): ${invalidOccurrences[0].reason}`;
        
        if (invalidOccurrences.length <= 3) {
          // Show all errors if 3 or fewer
          for (let i = 1; i < invalidOccurrences.length; i++) {
            errorMsg += `\n\n${invalidOccurrences[i].date}: ${invalidOccurrences[i].reason}`;
          }
        } else {
          errorMsg += `\n\n... and ${invalidOccurrences.length - 1} more conflicts.`;
        }
      }
      
      setErrorMessage(errorMsg);
      setIsSubmitting(false);
      return;
    }
    // ========== END VALIDATION ==========

    // Get user's timezone
    const timezoneToSend =
      userTimezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC";

    console.log(`Creating ${occurrences.length} session(s)...`);

    // Create each occurrence
    let created = 0;
    for (let idx = 0; idx < occurrences.length; idx++) {
      const occ = occurrences[idx];

      const formData = new FormData();
      formData.append("title", sessionForm.title || "");
      formData.append("description", sessionForm.description || "");
      formData.append("date", occ.date);
      formData.append("startTime", occ.startTime);
      formData.append("endTime", occ.endTime);
      formData.append("timezone", timezoneToSend);

      if (courseId) {
        formData.append("course", courseId);
        formData.append("courseId", courseId);
      }

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
    
    if (courseId) {
      router.push(`/academy/courses/${courseId}`);
    } else {
      router.push("/academy/calendar");
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
        {/* <header className="mb-6 sm:mb-8 flex justify-between items-center">
          <div className="flex !items-center gap-2 sm:gap-4">
            <Link
              href={"/academy/calendar"}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 !mb-0">
              Add New Session
            </h1>
          </div>
        </header> */}

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
  <div>
    <label htmlFor="startTime" className="block text-gray-600 mb-2 text-sm font-medium">
      Start Time (24-hour: HH:MM)
    </label>
    <input
      type="text"
      id="startTime"
      name="startTime"
      value={sessionForm.startTime}
      onChange={handleTimeInput}
      onKeyPress={(e) => {
        if (!/[\d:]/.test(e.key)) e.preventDefault();
      }}
      pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
      placeholder="14:30"
      maxLength={5}
      className="w-full px-4 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required
    />
  </div>

  <div>
    <label htmlFor="endTime" className="block text-gray-600 mb-2 text-sm font-medium">
      End Time (24-hour: HH:MM)
    </label>
    <input
      type="text"
      id="endTime"
      name="endTime"
      value={sessionForm.endTime}
      onChange={handleTimeInput}
      onKeyPress={(e) => {
        if (!/[\d:]/.test(e.key)) e.preventDefault();
      }}
      pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
      placeholder="16:00"
      maxLength={5}
      className="w-full px-4 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required
    />
  </div>
</div>
{availableSlots.length > 0 && selectedDate && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
    <div className="flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900">Available Time Slots</p>
        <div className="text-xs text-blue-700 mt-1">
          {(() => {
            const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
            const sessionDate = parseISO(selectedDate);
            
            // Find slots on the selected date (comparing in user's timezone)
            const sameDaySlots = availableSlots.filter(slot => {
              const slotStartUTC = new Date(slot.startTime);
              const slotStartLocal = dateFnsTz.toZonedTime(slotStartUTC, timezone);
              
              return slotStartLocal.getDate() === sessionDate.getDate() &&
                     slotStartLocal.getMonth() === sessionDate.getMonth() &&
                     slotStartLocal.getFullYear() === sessionDate.getFullYear();
            });
            
            if (sameDaySlots.length === 0) {
              return `No slots available on ${format(sessionDate, 'MMM dd, yyyy')}. Please choose another date.`;
            }
            
            return (
              <div className="space-y-1 mt-1">
                <p className="font-medium">{format(sessionDate, 'EEEE, MMM dd, yyyy')}:</p>
                {sameDaySlots.map((slot, idx) => {
                  const startUTC = new Date(slot.startTime);
                  const endUTC = new Date(slot.endTime);
                  const startLocal = dateFnsTz.toZonedTime(startUTC, timezone);
                  const endLocal = dateFnsTz.toZonedTime(endUTC, timezone);
                  
                  return (
                    <div key={idx} className="pl-2">
                      • {format(startLocal, 'hh:mm a')} - {format(endLocal, 'hh:mm a')}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  </div>
)}

{slotsLoading && (
  <div className="text-sm text-gray-500 flex items-center gap-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
    Loading available slots...
  </div>
)}
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
                    <input
                      type="number"
                      min={1}
                      value={repeatCount}
                      onChange={(e) => setRepeatCount(Math.max(1, Number(e.target.value || 1)))}
                      disabled={repeatType === "none"}
                      className="w-full px-3 py-2 border rounded"
                    />
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
