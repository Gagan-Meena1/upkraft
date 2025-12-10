"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Save, User, Repeat, X } from "lucide-react";
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

const TutorAvailabilitySlots = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string>("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<Map<string, "available" | "unavailable">>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userTimezone, setUserTimezone] = useState<string>("UTC");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [repeatType, setRepeatType] = useState<"daily" | "weekly">("weekly");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [repeatStartDate, setRepeatStartDate] = useState("");
  const [repeatEndDate, setRepeatEndDate] = useState("");

  const toast = {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg)
  };

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
          setClasses(data.classData);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, [selectedTutor]);

  useEffect(() => {
    if (!selectedTutor) {
      setSlots(new Map());
      setSelectedSlots(new Set());
      return;
    }

    const tutor = tutors.find((t) => t._id === selectedTutor);
    if (!tutor || !tutor.slotsAvailable || tutor.slotsAvailable.length === 0) {
      setSlots(new Map());
      setSelectedSlots(new Set());
      return;
    }

    const newSlots = new Map<string, "available" | "unavailable">();

    tutor.slotsAvailable.forEach((slot) => {
      try {
        const startTimeStr = typeof slot.startTime === 'string' ? slot.startTime : slot.startTime?.toISOString();
        const endTimeStr = typeof slot.endTime === 'string' ? slot.endTime : slot.endTime?.toISOString();
        
        if (!startTimeStr || !endTimeStr) return;
        
        const startUTC = parseISO(startTimeStr);
        const endUTC = parseISO(endTimeStr);
        const tutorTz = tutor.timezone || userTimezone;
        const startLocal = dateFnsTz.toZonedTime(startUTC, tutorTz);
        const endLocal = dateFnsTz.toZonedTime(endUTC, tutorTz);
        const slotDate = format(startLocal, 'yyyy-MM-dd');
        const startHour = startLocal.getHours();
        const endHour = endLocal.getHours();

        for (let hour = startHour; hour < endHour; hour++) {
          const key = `${slotDate}-${hour}`;
          newSlots.set(key, "available");
        }
      } catch (error) {
        console.error("Error processing slot:", error);
      }
    });

    setSlots(newSlots);
    setSelectedSlots(new Set());
  }, [selectedTutor, currentDate, tutors, userTimezone]);

  const getClassesForSlot = (date: string, hour: number): ClassData[] => {
    if (!selectedTutor || classes.length === 0) return [];

    const tutor = tutors.find((t) => t._id === selectedTutor);
    const tutorTz = tutor?.timezone || userTimezone;

    return classes.filter((classItem) => {
      try {
        const startUTC = parseISO(classItem.startTime);
        const endUTC = parseISO(classItem.endTime);
        
        const startLocal = dateFnsTz.toZonedTime(startUTC, tutorTz);
        const endLocal = dateFnsTz.toZonedTime(endUTC, tutorTz);

        const classDate = format(startLocal, 'yyyy-MM-dd');
        const startHour = startLocal.getHours();
        const endHour = endLocal.getHours();

        return classDate === date && hour >= startHour && hour < endHour;
      } catch (error) {
        return false;
      }
    });
  };
  const getAllowedDaysFromSelectedSlots = (): number[] => {
  const daysSet = new Set<number>();
  
  selectedSlots.forEach(key => {
    const parts = key.split("-");
    const date = parts.slice(0, 3).join("-");
    const dayOfWeek = parseISO(date).getDay();
    daysSet.add(dayOfWeek);
  });
  
  return Array.from(daysSet).sort();
};

  const formatDateString = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
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
      const newSelected = new Set(selectedSlots);
      newSelected.delete(key);
      setSelectedSlots(newSelected);
    } else {
      newSlots.set(key, status);
      const newSelected = new Set(selectedSlots);
      newSelected.add(key);
      setSelectedSlots(newSelected);
    }
    
    setSlots(newSlots);
  };

 const handleOpenRepeatModal = () => {
  if (selectedSlots.size === 0) {
    toast.error("Please select at least one slot first");
    return;
  }
  
  const dates = Array.from(selectedSlots).map(key => {
    const parts = key.split("-");
    return parts.slice(0, 3).join("-");
  }).sort();
  
  setRepeatStartDate(dates[0]);
  setRepeatEndDate("");
  
  // AUTO-SELECT only the days from selected slots
  const allowedDays = getAllowedDaysFromSelectedSlots();
  setSelectedDays(allowedDays);
  
  setShowRepeatModal(true);
};

  const toggleDay = (day: number) => {
  const allowedDays = getAllowedDaysFromSelectedSlots();
  
  // Only allow toggling if this day exists in selected slots
  if (!allowedDays.includes(day)) {
    return; // Do nothing if day is not allowed
  }
  
  setSelectedDays(prev => 
    prev.includes(day) 
      ? prev.filter(d => d !== day)
      : [...prev, day].sort()
  );
};

  const getPreviewSlots = (): string[] => {
    if (!repeatStartDate || !repeatEndDate || selectedSlots.size === 0) {
      return [];
    }

    const preview: string[] = [];
    const startDate = parseISO(repeatStartDate);
    const endDate = parseISO(repeatEndDate);

    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const shouldInclude = repeatType === "daily" || selectedDays.includes(dayOfWeek);
      
      if (shouldInclude) {
        selectedSlots.forEach(key => {
          const parts = key.split("-");
          const originalDate = parts.slice(0, 3).join("-");
          const hour = parseInt(parts[parts.length - 1]);
          const originalDayOfWeek = parseISO(originalDate).getDay();
          
          if (repeatType === "daily" || originalDayOfWeek === dayOfWeek) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            preview.push(`${dateStr} ${String(hour).padStart(2, '0')}:00`);
          }
        });
      }
      
      currentDate = addDays(currentDate, 1);
    }

    return preview;
  };

  const applyRepeatPattern = () => {
    if (!repeatStartDate || !repeatEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const startDate = parseISO(repeatStartDate);
    const endDate = parseISO(repeatEndDate);

    if (endDate < startDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (repeatType === "weekly" && selectedDays.length === 0) {
      toast.error("Please select at least one day for weekly repeat");
      return;
    }

    const newSlots = new Map(slots);
    const newSelected = new Set(selectedSlots);

    const slotsToRepeat: Array<{ dayOfWeek: number; hour: number }> = [];
    selectedSlots.forEach(key => {
      const parts = key.split("-");
      const date = parts.slice(0, 3).join("-");
      const hour = parseInt(parts[parts.length - 1]);
      const dayOfWeek = parseISO(date).getDay();
      
      slotsToRepeat.push({ dayOfWeek, hour });
    });

    let currentDate = new Date(startDate);
    let slotsAdded = 0;

    while (currentDate <= endDate) {
      const currentDayOfWeek = currentDate.getDay();
      const shouldInclude = repeatType === "daily" || selectedDays.includes(currentDayOfWeek);

      if (shouldInclude) {
        slotsToRepeat.forEach(({ dayOfWeek, hour }) => {
          if (repeatType === "daily" || dayOfWeek === currentDayOfWeek) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const key = `${dateStr}-${hour}`;
            
            newSlots.set(key, "available");
            newSelected.add(key);
            slotsAdded++;
          }
        });
      }

      currentDate = addDays(currentDate, 1);
    }

    setSlots(newSlots);
    setSelectedSlots(newSelected);
    setShowRepeatModal(false);
    toast.success(`Applied repeat pattern: ${slotsAdded} slots added`);
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

      const slotsByDate = new Map<string, number[]>();
      
      slots.forEach((status, key) => {
        if (status === "available") {
          const parts = key.split("-");
          const hourStr = parts[parts.length - 1];
          const date = parts.slice(0, 3).join("-");
          const hour = parseInt(hourStr);
          
          if (!slotsByDate.has(date)) {
            slotsByDate.set(date, []);
          }
          slotsByDate.get(date)!.push(hour);
        }
      });

      const slotsToSave: { startTime: string; endTime: string }[] = [];

      slotsByDate.forEach((hours, dateStr) => {
        hours.sort((a, b) => a - b);
        
        let rangeStart = hours[0];
        let rangeEnd = hours[0];

        for (let i = 1; i <= hours.length; i++) {
          if (i < hours.length && hours[i] === rangeEnd + 1) {
            rangeEnd = hours[i];
          } else {
            const [year, month, day] = dateStr.split('-').map(Number);
            
            const startLocal = new Date(year, month - 1, day, rangeStart, 0, 0);
            const endLocal = new Date(year, month - 1, day, rangeEnd + 1, 0, 0);
            
            if (isNaN(startLocal.getTime()) || isNaN(endLocal.getTime())) {
              throw new Error(`Invalid date: ${dateStr}`);
            }
            
            const startUTC = dateFnsTz.fromZonedTime(startLocal, tutorTimezone);
            const endUTC = dateFnsTz.fromZonedTime(endLocal, tutorTimezone);

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
      
      const tutorsResponse = await fetch("/Api/academy/tutorPersonalInfo");
      const tutorsData = await tutorsResponse.json();
      if (tutorsData.success && tutorsData.tutors) {
        setTutors(tutorsData.tutors);
      }
      
      setSelectedSlots(new Set());
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
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tutor Availability Management
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
            <div className="flex-1 w-full min-w-[250px]">
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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Slots"}
            </button>
            
            {selectedSlots.size > 0 && (
              <button
                onClick={handleOpenRepeatModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Repeat size={18} />
                Apply Repeat ({selectedSlots.size})
              </button>
            )}
          </div>
        </div>

        {showRepeatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Apply Repeat Pattern</h2>
                  <button
                    onClick={() => setShowRepeatModal(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Selected Slots ({selectedSlots.size})
                  </h3>
                  <div className="text-sm text-blue-700 max-h-32 overflow-y-auto">
                    {Array.from(selectedSlots).sort().slice(0, 10).map(key => {
                      const parts = key.split("-");
                      const date = parts.slice(0, 3).join("-");
                      const hour = parseInt(parts[parts.length - 1]);
                      const dayName = format(parseISO(date), 'EEE, MMM d');
                      return (
                        <div key={key}>
                          {dayName} - {String(hour).padStart(2, '0')}:00
                        </div>
                      );
                    })}
                    {selectedSlots.size > 10 && (
                      <div className="text-blue-600 font-medium mt-1">
                        ...and {selectedSlots.size - 10} more
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat Pattern
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="daily"
                        checked={repeatType === "daily"}
                        onChange={(e) => setRepeatType(e.target.value as "daily")}
                        className="mr-2"
                      />
                      Daily
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="weekly"
                        checked={repeatType === "weekly"}
                        onChange={(e) => setRepeatType(e.target.value as "weekly")}
                        className="mr-2"
                      />
                      Weekly
                    </label>
                  </div>
                </div>

             {repeatType === "weekly" && (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Repeat on Days (Only days from your selected slots)
    </label>
    <div className="flex gap-2 flex-wrap">
      {[
        { value: 0, label: "Sun" },
        { value: 1, label: "Mon" },
        { value: 2, label: "Tue" },
        { value: 3, label: "Wed" },
        { value: 4, label: "Thu" },
        { value: 5, label: "Fri" },
        { value: 6, label: "Sat" },
      ].map((day) => {
        const allowedDays = getAllowedDaysFromSelectedSlots();
        const isAllowed = allowedDays.includes(day.value);
        const isSelected = selectedDays.includes(day.value);
        
        return (
          <button
            key={day.value}
            onClick={() => toggleDay(day.value)}
            disabled={!isAllowed}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isSelected
                ? "bg-purple-600 text-white ring-2 ring-purple-400"
                : isAllowed
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
            }`}
            title={!isAllowed ? "This day is not in your selected slots" : ""}
          >
            {day.label}
          </button>
        );
      })}
    </div>
    <p className="text-xs text-gray-600 mt-2">
      ℹ️ You can only select days that match your originally selected time slots
    </p>
  </div>
)}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={repeatStartDate}
                      onChange={(e) => setRepeatStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={repeatEndDate}
                      onChange={(e) => setRepeatEndDate(e.target.value)}
                      min={repeatStartDate}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {repeatStartDate && repeatEndDate && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Preview: {getPreviewSlots().length} slots will be created
                    </h3>
                    <div className="text-sm text-green-700 max-h-48 overflow-y-auto">
                      {getPreviewSlots().slice(0, 20).map((slot, idx) => (
                        <div key={idx}>{slot}</div>
                      ))}
                      {getPreviewSlots().length > 20 && (
                        <div className="text-green-600 font-medium mt-1">
                          ...and {getPreviewSlots().length - 20} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowRepeatModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyRepeatPattern}
                    disabled={!repeatStartDate || !repeatEndDate}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Apply Pattern
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTutor && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
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

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="grid grid-cols-8 gap-2" style={{ minWidth: "800px" }}>
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

                  {hours.map((hour) => (
                    <React.Fragment key={hour}>
                      <div className="text-sm font-medium text-gray-700 py-2 text-center bg-gray-50 rounded-lg flex items-center justify-center hover:bg-purple-100 transition-colors">
                        {String(hour).padStart(2, "0")}:00
                      </div>

                      {weekDays.map((day) => {
                        const dateStr = formatDateString(day);
                        const key = `${dateStr}-${hour}`;
                        const status = slots.get(key) || "unavailable";
                        const slotClasses = getClassesForSlot(dateStr, hour);
                        const hasClass = slotClasses.length > 0;

                        return (
                          <div key={key} className="py-1 relative hover:bg-purple-50 transition-colors">
                            {hasClass ? (
                              <div className="flex flex-col gap-1">
                                {slotClasses.map((classItem, idx) => {
                                  const tutor = tutors.find((t) => t._id === selectedTutor);
                                  const tutorTz = tutor?.timezone || userTimezone;
                                  const startLocal = dateFnsTz.toZonedTime(parseISO(classItem.startTime), tutorTz);
                                  const endLocal = dateFnsTz.toZonedTime(parseISO(classItem.endTime), tutorTz);
                                  
                                  return (
                                    <div
                                      key={idx}
                                      className="group/class relative w-full px-2 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white border border-blue-600 cursor-pointer hover:bg-blue-600 truncate"
                                      title={`${classItem.title}\n${format(startLocal, 'HH:mm')} - ${format(endLocal, 'HH:mm')}`}
                                    >
                                      {classItem.title}
                                      
                                      <div className="absolute hidden group-hover/class:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg -top-2 left-full ml-2 whitespace-normal">
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