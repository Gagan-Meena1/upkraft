"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Save, User } from "lucide-react";
import { toast } from "react-hot-toast";
import * as dateFnsTz from 'date-fns-tz';
import { format, parseISO, addDays } from 'date-fns';

interface Tutor {
  _id: string;
  username: string;
  email: string;
  timezone: string;
  slotsAvailable: { startTime: string; endTime: string }[];
}

interface ClassData {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
}

interface SlotData {
  date: string;
  hour: number;
  status: "available" | "unavailable";
}

const TutorAvailabilitySlots = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string>("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<Map<string, "available" | "unavailable">>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userTimezone, setUserTimezone] = useState<string>("UTC");
  const [classes, setClasses] = useState<ClassData[]>([]);

  // Fetch user timezone
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/Api/users/user");
        const data = await response.json();
        if (data.user?.timezone) {
          setUserTimezone(data.user.timezone);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Fetch tutors list
  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        const response = await fetch("/Api/academy/tutorPersonalInfo");
        const data = await response.json();
        if (data.success && data.tutors) {
          setTutors(data.tutors);
        }
      } catch (error) {
        console.error("Error fetching tutors:", error);
        toast.error("Failed to load tutors");
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  // Fetch classes when tutor is selected
useEffect(() => {
  const fetchClasses = async () => {
    if (!selectedTutor) {
      setClasses([]);
      return;
    }

    try {
      const response = await fetch(`/Api/classes?userid=${selectedTutor}`);
      const data = await response.json();
      
      if (data.classData) {
        console.log("Fetched classes:", data.classData);
        setClasses(data.classData);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  fetchClasses();
}, [selectedTutor]);

  // Load existing slots when tutor is selected - LOAD ALL SLOTS
  useEffect(() => {
    if (!selectedTutor) {
      setSlots(new Map());
      return;
    }

    const tutor = tutors.find((t) => t._id === selectedTutor);
    if (!tutor) {
      console.log("Tutor not found");
      return;
    }

    console.log("Selected tutor:", tutor);
    console.log("Tutor slots available:", tutor.slotsAvailable);

    if (!tutor.slotsAvailable || tutor.slotsAvailable.length === 0) {
      console.log("No slots available for this tutor");
      setSlots(new Map());
      return;
    }

    const newSlots = new Map<string, "available" | "unavailable">();
    const weekDays = getWeekDays();

    console.log("Current week days:", weekDays.map(d => format(d, 'yyyy-MM-dd')));

    // Convert UTC slots to tutor's timezone and mark as available
    // Load ALL slots, not just those in current week
    tutor.slotsAvailable.forEach((slot, index) => {
      try {
        console.log(`Processing slot ${index}:`, slot);
        
        // Ensure we have valid ISO strings
        const startTimeStr = typeof slot.startTime === 'string' ? slot.startTime : slot.startTime?.toISOString();
        const endTimeStr = typeof slot.endTime === 'string' ? slot.endTime : slot.endTime?.toISOString();
        
        if (!startTimeStr || !endTimeStr) {
          console.error(`Slot ${index}: Invalid time format`);
          return;
        }
        
        const startUTC = parseISO(startTimeStr);
        const endUTC = parseISO(endTimeStr);

        // Convert from UTC to tutor's timezone using date-fns-tz
        const tutorTz = tutor.timezone || userTimezone;
        const startLocal = dateFnsTz.toZonedTime(startUTC, tutorTz);
        const endLocal = dateFnsTz.toZonedTime(endUTC, tutorTz);

        const slotDate = format(startLocal, 'yyyy-MM-dd');
        const startHour = startLocal.getHours();
        const endHour = endLocal.getHours();

        const isInWeek = isDateInCurrentWeek(slotDate, weekDays);
        
        console.log(`Slot ${index} converted:`, {
          utcStart: startTimeStr,
          utcEnd: endTimeStr,
          localDate: slotDate,
          startHour,
          endHour,
          timezone: tutorTz,
          isInCurrentWeek: isInWeek
        });

        // Mark all hours in this slot as available
        for (let hour = startHour; hour < endHour; hour++) {
          const key = `${slotDate}-${hour}`;
          newSlots.set(key, "available");
          if (isInWeek) {
            console.log(`Marked as available (visible): ${key}`);
          }
        }
      } catch (error) {
        console.error(`Error processing slot ${index}:`, error, slot);
      }
    });

    const visibleSlots = Array.from(newSlots.keys()).filter(key => {
      const [date] = key.split('-').slice(0, 3).join('-');
      return isDateInCurrentWeek(date, weekDays);
    }).length;

    console.log(`Total slots in database: ${newSlots.size}, visible in current week: ${visibleSlots}`);
    setSlots(newSlots);
  }, [selectedTutor, currentDate, tutors, userTimezone]);

  // Helper to get classes for a specific date and hour
const getClassesForSlot = (date: string, hour: number): ClassData[] => {
  if (!selectedTutor || classes.length === 0) return [];

  const tutor = tutors.find((t) => t._id === selectedTutor);
  const tutorTz = tutor?.timezone || userTimezone;

  return classes.filter((classItem) => {
    try {
      // Convert class UTC times to tutor's timezone
      const startUTC = parseISO(classItem.startTime);
      const endUTC = parseISO(classItem.endTime);
      
      const startLocal = dateFnsTz.toZonedTime(startUTC, tutorTz);
      const endLocal = dateFnsTz.toZonedTime(endUTC, tutorTz);

      const classDate = format(startLocal, 'yyyy-MM-dd');
      const startHour = startLocal.getHours();
      const endHour = endLocal.getHours();

      // Check if this class overlaps with the current slot
      return classDate === date && hour >= startHour && hour < endHour;
    } catch (error) {
      console.error("Error processing class:", error);
      return false;
    }
  });
};

  const formatDateString = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const isDateInCurrentWeek = (dateStr: string, weekDays: Date[]): boolean => {
    // dateStr might be full format "2025-01-01" or need reconstruction from key
    const checkDate = dateStr.includes('-') && dateStr.split('-').length === 3 
      ? dateStr 
      : dateStr.split('-').slice(0, 3).join('-');
    
    return weekDays.some((day) => formatDateString(day) === checkDate);
  };

  const getWeekDays = (): Date[] => {
    const ref = new Date(currentDate.getTime());
    const day = ref.getDay();
    const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(ref);
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const changeWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const handleSlotChange = (date: string, hour: number, status: "available" | "unavailable") => {
    const key = `${date}-${hour}`;
    const newSlots = new Map(slots);
    
    if (status === "unavailable") {
      newSlots.delete(key);
    } else {
      newSlots.set(key, status);
    }
    
    setSlots(newSlots);
  };

const handleSave = async () => {
  if (!selectedTutor) {
    toast.error("Please select a tutor");
    return;
  }

  setSaving(true);
  try {
    const tutor = tutors.find((t) => t._id === selectedTutor);
    const tutorTimezone = tutor?.timezone || userTimezone;

    console.log("Tutor timezone:", tutorTimezone);

    // Group consecutive hours into ranges
    const slotsByDate = new Map<string, number[]>();
    
    slots.forEach((status, key) => {
      if (status === "available") {
        // Split the key properly: "2025-12-01-14" -> ["2025", "12", "01", "14"]
        const parts = key.split("-");
        const hourStr = parts[parts.length - 1]; // Last part is the hour
        const date = parts.slice(0, 3).join("-"); // First 3 parts are the date
        const hour = parseInt(hourStr);
        
        console.log("Processing key:", key, "-> date:", date, "hour:", hour);
        
        if (!slotsByDate.has(date)) {
          slotsByDate.set(date, []);
        }
        slotsByDate.get(date)!.push(hour);
      }
    });

    console.log("Slots by date:", Array.from(slotsByDate.entries()));

    // Convert to ranges and then to UTC using date-fns-tz
    const slotsToSave: { startTime: string; endTime: string }[] = [];

    slotsByDate.forEach((hours, dateStr) => {
      hours.sort((a, b) => a - b);
      
      let rangeStart = hours[0];
      let rangeEnd = hours[0];

      for (let i = 1; i <= hours.length; i++) {
        if (i < hours.length && hours[i] === rangeEnd + 1) {
          rangeEnd = hours[i];
        } else {
          // Create Date objects for the local time
          const [year, month, day] = dateStr.split('-').map(Number);
          
          console.log("Creating date from:", { year, month, day, rangeStart, rangeEnd });
          
          // Create local dates (month is 0-indexed in JS Date)
          const startLocal = new Date(year, month - 1, day, rangeStart, 0, 0);
          const endLocal = new Date(year, month - 1, day, rangeEnd + 1, 0, 0);
          
          console.log("Local dates:", { startLocal, endLocal });
          
          // Validate dates
          if (isNaN(startLocal.getTime()) || isNaN(endLocal.getTime())) {
            console.error("Invalid date created:", { dateStr, rangeStart, rangeEnd });
            throw new Error(`Invalid date: ${dateStr}`);
          }
          
          // Convert local time to UTC using date-fns-tz
          const startUTC = dateFnsTz.fromZonedTime(startLocal, tutorTimezone);
          const endUTC = dateFnsTz.fromZonedTime(endLocal, tutorTimezone);
          
          console.log("UTC dates:", { startUTC, endUTC });

          slotsToSave.push({
            startTime: startUTC.toISOString(),
            endTime: endUTC.toISOString(),
          });

          if (i < hours.length) {
            rangeStart = hours[i];
            rangeEnd = hours[i];
          }
        }
      }
    });

    console.log("Slots to save:", slotsToSave);

    const response = await fetch("/Api/academy/tutorSlots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tutorId: selectedTutor,
        slots: slotsToSave,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save slots");
    }

    toast.success("Slots saved successfully!");
    
    // Refresh tutor data
    const tutorsResponse = await fetch("/Api/academy/tutorPersonalInfo");
    const tutorsData = await tutorsResponse.json();
    if (tutorsData.success && tutorsData.tutors) {
      setTutors(tutorsData.tutors);
    }
  } catch (error: any) {
    console.error("Error saving slots:", error);
    toast.error(error.message || "Failed to save slots");
  } finally {
    setSaving(false);
  }
};

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tutor Availability Management
          </h1>

          {/* Tutor Selection */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tutor
              </label>
              <select
                value={selectedTutor}
                onChange={(e) => setSelectedTutor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">-- Choose a tutor --</option>
                {tutors.map((tutor) => (
                  <option key={tutor._id} value={tutor._id}>
                    {tutor.username} ({tutor.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={!selectedTutor || saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 mt-6 sm:mt-0"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Slots"}
            </button>
          </div>
        </div>

        {/* Calendar */}
        {selectedTutor && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            {/* Week Navigation */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Week of {weekDays[0].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </h2>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => changeWeek(-1)}
                  className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium"
                >
                  Today
                </button>
                <button
                  onClick={() => changeWeek(1)}
                  className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="grid grid-cols-8 gap-2" style={{ minWidth: "800px" }}>
                  {/* Header - Time column + Days */}
                  <div className="font-semibold text-center py-3 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Time
                  </div>
                  {weekDays.map((day, idx) => (
                    <div key={idx} className="font-semibold text-center py-3 bg-purple-100 rounded-lg">
                      <div className="text-sm">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="text-xs text-gray-600">
                        {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  ))}

                  {/* Time slots */}
                  {hours.map((hour) => (
                    <React.Fragment key={hour}>
                      {/* Hour label */}
                      <div className="text-sm font-medium text-gray-700 py-2 text-center bg-gray-50 rounded-lg flex items-center justify-center">
                        {String(hour).padStart(2, "0")}:00
                      </div>

                      {/* Slot dropdowns for each day */}
                      {/* Slot dropdowns for each day */}
{weekDays.map((day) => {
  const dateStr = formatDateString(day);
  const key = `${dateStr}-${hour}`;
  const status = slots.get(key) || "unavailable";
  const slotClasses = getClassesForSlot(dateStr, hour);
  const hasClass = slotClasses.length > 0;

  return (
    <div key={key} className="py-1 relative">
      {hasClass ? (
        // Show only class badges when class exists
        <div className="flex flex-col gap-1">
          {slotClasses.map((classItem, idx) => {
            const tutor = tutors.find((t) => t._id === selectedTutor);
            const tutorTz = tutor?.timezone || userTimezone;
            const startLocal = dateFnsTz.toZonedTime(parseISO(classItem.startTime), tutorTz);
            const endLocal = dateFnsTz.toZonedTime(parseISO(classItem.endTime), tutorTz);
            
            return (
              <div
                key={idx}
                className="group relative w-full px-2 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white border border-blue-600 cursor-pointer hover:bg-blue-600 truncate"
                title={`${classItem.title}\n${format(startLocal, 'HH:mm')} - ${format(endLocal, 'HH:mm')}`}
              >
                {classItem.title}
                
                {/* Tooltip on hover */}
                <div className="absolute hidden group-hover:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg -top-2 left-full ml-2 whitespace-normal">
                  <div className="font-semibold">{classItem.title}</div>
                  <div className="text-gray-300 mt-1">
                    {format(startLocal, 'HH:mm')} - {format(endLocal, 'HH:mm')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Show availability dropdown only when no class exists
        <select
          value={status}
          onChange={(e) =>
            handleSlotChange(
              dateStr,
              hour,
              e.target.value as "available" | "unavailable"
            )
          }
          className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            status === "available"
              ? "bg-green-100 text-green-800 border-green-300"
              : "bg-gray-100 text-gray-600 border-gray-300"
          } border`}
        >
          <option value="available">Available</option>
          <option value="unavailable">-</option>
        </select>
      )}
    </div>
  );
})}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
           {/* Legend */}
<div className="mt-6 flex gap-4 justify-center flex-wrap">
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
    <span className="text-sm text-gray-600">Available</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
    <span className="text-sm text-gray-600">Scheduled Class</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
    <span className="text-sm text-gray-600">Unavailable</span>
  </div>
</div>
          </div>
        )}

        {!selectedTutor && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Please select a tutor to manage availability slots</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorAvailabilitySlots;