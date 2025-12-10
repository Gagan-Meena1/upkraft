"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Save, User, Repeat, X, Edit2, Trash2, AlertCircle } from "lucide-react";
import * as dateFnsTz from 'date-fns-tz';
import { format, parseISO, addDays } from 'date-fns';

interface Tutor {
  _id: string;
  username: string;
  email: string;
  timezone: string;
  slotsAvailable: { startTime: string; endTime: string }[];
  description?: string;
}

interface ClassData {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
}
interface Course {
  _id: string;
  title: string;
}

interface CreateClassForm {
  courseId: string;
  title: string;
  description: string;
  date: string;
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
  // New states for class management
const [showCreateClassModal, setShowCreateClassModal] = useState(false);
const [showEditClassModal, setShowEditClassModal] = useState(false);
const [courses, setCourses] = useState<Course[]>([]);
const [createClassForm, setCreateClassForm] = useState<CreateClassForm>({
  courseId: "",
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: ""
});
const [editingClass, setEditingClass] = useState<ClassData | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
// Add these states near your other state declarations
const [showCancelModal, setShowCancelModal] = useState(false);
const [cancellingClassId, setCancellingClassId] = useState<string | null>(null);
const [cancellationReason, setCancellationReason] = useState("");
// Add this state near your other state declarations
const [isCancelling, setIsCancelling] = useState(false);

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

  // Fetch courses when tutor is selected
// Fetch courses when tutor is selected
useEffect(() => {
  const fetchCourses = async () => {
    if (!selectedTutor) {
      setCourses([]);
      return;
    }

    try {
      console.log("Fetching courses for tutor:", selectedTutor);
      const response = await fetch(`/Api/tutors/courses?tutorId=${selectedTutor}`);
      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.success && data.course) {
        console.log("Setting courses:", data.course);
        setCourses(data.course);
      } else if (data.course) {
        // Handle case where success flag might not be present
        console.log("Setting courses (no success flag):", data.course);
        setCourses(data.course);
      } else {
        console.log("No courses found in response");
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    }
  };

  fetchCourses();
}, [selectedTutor]);

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
  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;
  value = value.replace(/[^\d:]/g, '');
  if (value.length === 2 && !value.includes(':')) {
    value = value + ':';
  }
  if (value.length > 5) {
    value = value.slice(0, 5);
  }
  e.target.value = value;
  
  const { name } = e.target;
  if (showCreateClassModal) {
    setCreateClassForm(prev => ({ ...prev, [name]: value }));
  }
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
  // Handle opening create class modal
const handleOpenCreateClass = (date: string, hour: number) => {
  const startTime = `${String(hour).padStart(2, '0')}:00`;
  const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
  
  setCreateClassForm({
    courseId: "",
    title: "",
    description: "",
    date: date,
    startTime: startTime,
    endTime: endTime
  });
  setErrorMessage("");
  setShowCreateClassModal(true);
};

// Handle create class form change
const handleCreateClassFormChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;
  setCreateClassForm(prev => ({ ...prev, [name]: value }));
};

// Validate time
const validateDateTime = (startTime: string, endTime: string) => {
  if (!startTime || !endTime) return "";
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  if (endMinutes <= startMinutes) {
    return "End time must be after start time";
  }
  
  return "";
};

// Handle create class submit
const handleCreateClassSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setErrorMessage("");

  try {
    const validationError = validateDateTime(createClassForm.startTime, createClassForm.endTime);
    if (validationError) {
      setErrorMessage(validationError);
      setIsSubmitting(false);
      return;
    }

    const tutor = tutors.find((t) => t._id === selectedTutor);
    const timezoneToSend = tutor?.timezone || userTimezone || "UTC";

    const formData = new FormData();
    formData.append("title", createClassForm.title);
    formData.append("description", createClassForm.description);
    formData.append("date", createClassForm.date);
    formData.append("startTime", createClassForm.startTime);
    formData.append("endTime", createClassForm.endTime);
    formData.append("timezone", timezoneToSend);
    
    if (createClassForm.courseId) {
      formData.append("course", createClassForm.courseId);
      formData.append("courseId", createClassForm.courseId);
    }

    const response = await fetch("/Api/classes", {
      method: "POST",
      body: formData,
    });

    const result = await response.json().catch(() => ({ message: "Invalid response" }));

    if (!response.ok) {
      throw new Error(result?.message || "Failed to create class");
    }

    toast.success("Class created successfully!");
    setShowCreateClassModal(false);
    
    // Refresh classes
    const classesResponse = await fetch(`/Api/classes?userid=${selectedTutor}`);
    const classesData = await classesResponse.json();
    if (classesData.classData) {
      setClasses(classesData.classData);
    }
  } catch (err: any) {
    console.error("Error creating class:", err);
    setErrorMessage(err?.message || "Failed to create class");
  } finally {
    setIsSubmitting(false);
  }
};

// Handle edit class
const handleEditClass = (classItem: ClassData) => {
  const tutor = tutors.find((t) => t._id === selectedTutor);
  const tutorTz = tutor?.timezone || userTimezone;
  
  const startUTC = parseISO(classItem.startTime);
  const endUTC = parseISO(classItem.endTime);
  const startLocal = dateFnsTz.toZonedTime(startUTC, tutorTz);
  const endLocal = dateFnsTz.toZonedTime(endUTC, tutorTz);
  
  setEditingClass({
    ...classItem,
    startTime: format(startLocal, 'HH:mm'),
    endTime: format(endLocal, 'HH:mm')
  });
  setErrorMessage("");
  setShowEditClassModal(true);
};

// Handle update class submit
// Handle update class submit
const handleUpdateClassSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingClass) return;
  
  setIsSubmitting(true);
  setErrorMessage("");

  try {
    const validationError = validateDateTime(editingClass.startTime, editingClass.endTime);
    if (validationError) {
      setErrorMessage(validationError);
      setIsSubmitting(false);
      return;
    }

    const tutor = tutors.find((t) => t._id === selectedTutor);
    const tutorTz = tutor?.timezone || userTimezone;
    
    // Parse original class date
    const originalStartUTC = parseISO(classes.find(c => c._id === editingClass._id)?.startTime || '');
    const originalStartLocal = dateFnsTz.toZonedTime(originalStartUTC, tutorTz);
    const classDate = format(originalStartLocal, 'yyyy-MM-dd');
    
    const [startHour, startMin] = editingClass.startTime.split(':').map(Number);
    const [endHour, endMin] = editingClass.endTime.split(':').map(Number);
    
    const [year, month, day] = classDate.split('-').map(Number);
    const startLocal = new Date(year, month - 1, day, startHour, startMin, 0);
    const endLocal = new Date(year, month - 1, day, endHour, endMin, 0);
    
    const startUTC = dateFnsTz.fromZonedTime(startLocal, tutorTz);
    const endUTC = dateFnsTz.fromZonedTime(endLocal, tutorTz);

    // Use FormData or JSON - keep the same API route
    const response = await fetch(`/Api/classes?classId=${editingClass._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editingClass.title,
        description: editingClass.description,
        date: classDate,  // Added date
        startTime: editingClass.startTime,  // Send as HH:mm format
        endTime: editingClass.endTime,      // Send as HH:mm format
        timezone: tutorTz,  // Added timezone
      }),
    });

    const result = await response.json().catch(() => ({ message: "Invalid response" }));

    if (!response.ok) {
      throw new Error(result?.message || "Failed to update class");
    }

    toast.success("Class updated successfully!");
    setShowEditClassModal(false);
    setEditingClass(null);
    
    // Refresh classes
    const classesResponse = await fetch(`/Api/classes?userid=${selectedTutor}`);
    const classesData = await classesResponse.json();
    if (classesData.classData) {
      setClasses(classesData.classData);
    }
  } catch (err: any) {
    console.error("Error updating class:", err);
    setErrorMessage(err?.message || "Failed to update class");
  } finally {
    setIsSubmitting(false);
  }
};

// Handle delete class
// Replace the existing handleDeleteClass function with this:
const handleDeleteClass = async (classId: string) => {
  setCancellingClassId(classId);
  setCancellationReason("");
  setShowCancelModal(true);
};

// Add new function to handle the actual cancellation
const handleConfirmCancellation = async () => {
  if (!cancellingClassId) return;
  
  if (!cancellationReason.trim()) {
    setErrorMessage("Please provide a reason for cancellation");
    return;
  }

  setIsCancelling(true); // Start loading
  setErrorMessage(""); // Clear any previous errors

  try {
    const tutor = tutors.find((t) => t._id === selectedTutor);
    const tutorTz = tutor?.timezone || userTimezone;

    const response = await fetch(`/Api/classes?classId=${cancellingClassId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reasonForCancellation: cancellationReason,
        timezone: tutorTz
      }),
    });

    const result = await response.json().catch(() => ({ message: "Invalid response" }));

    if (!response.ok) {
      throw new Error(result?.message || "Failed to cancel class");
    }

    toast.success("Class cancelled successfully!");
    setShowCancelModal(false);
    setCancellingClassId(null);
    setCancellationReason("");
    
    // Refresh classes
    const classesResponse = await fetch(`/Api/classes?userid=${selectedTutor}`);
    const classesData = await classesResponse.json();
    if (classesData.classData) {
      setClasses(classesData.classData);
    }
  } catch (err: any) {
    console.error("Error cancelling class:", err);
    setErrorMessage(err?.message || "Failed to cancel class");
  } finally {
    setIsCancelling(false); // Stop loading
  }
};
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
                className="group/class relative w-full px-2 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white border border-blue-600 hover:bg-blue-600"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate flex-1" title={classItem.title}>
                    {classItem.title}
                  </span>
                  <div className="flex gap-1  group-hover/class:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClass(classItem);
                      }}
                      className="p-0.5 hover:bg-blue-700 rounded"
                      title="Edit class"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(classItem._id);
                      }}
                      className="p-0.5 hover:bg-red-600 rounded"
                      title="Delete class"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="absolute hidden group-hover/class:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg -top-2 left-full ml-2 whitespace-normal">
                  <div className="font-semibold">{classItem.title}</div>
                  <div className="text-gray-300 mt-1">
                    {format(startLocal, 'HH:mm')} - {format(endLocal, 'HH:mm')}
                  </div>
                  {classItem.description && (
                    <div className="text-gray-400 mt-1 text-xs">
                      {classItem.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <select
  value={status}
  onChange={(e) => {
    const value = e.target.value;
    if (value === "create-class") {
      handleOpenCreateClass(dateStr, hour);
      e.target.value = status; // Reset select
    } else {
      handleSlotChange(
        dateStr,
        hour,
        value as "available" | "unavailable"
      );
    }
  }}
  className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
    status === "available"
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-gray-100 text-gray-600 border-gray-300"
  } border`}
>
  <option value="available">Available</option>
  <option value="unavailable">-</option>
  {/* Only show Create Class option if slot is available */}
  {status === "available" && (
    <option value="create-class">+ Create Class</option>
  )}
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
      {/* Create Class Modal */}
{showCreateClassModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-white/20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Create New Class
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Date: {createClassForm.date} | Time: {createClassForm.startTime} - {createClassForm.endTime}
          </p>
        </div>
        <button
          onClick={() => setShowCreateClassModal(false)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleCreateClassSubmit} className="space-y-6">
        <div>
          <label htmlFor="courseId" className="block text-gray-600 mb-2 text-sm font-medium">
            Select Course
          </label>
          <select
            id="courseId"
            name="courseId"
            value={createClassForm.courseId}
            onChange={handleCreateClassFormChange}
            className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          >
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-gray-600 mb-2 text-sm font-medium">
            Class Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={createClassForm.title}
            onChange={handleCreateClassFormChange}
            className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g., Introduction to Algebra"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-600 mb-2 text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={createClassForm.description}
            onChange={handleCreateClassFormChange}
            className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-28 transition-all"
            placeholder="Provide details about the class..."
            required
          />
        </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  <div>
    <label htmlFor="startTime" className="block text-gray-600 mb-2 text-sm font-medium">
      Start Time (HH:MM)
    </label>
    <input
      type="text"
      id="startTime"
      name="startTime"
      value={createClassForm.startTime}
      disabled
      className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border border-gray-300/70 text-gray-600 cursor-not-allowed"
    />
  </div>

  <div>
    <label htmlFor="endTime" className="block text-gray-600 mb-2 text-sm font-medium">
      End Time (HH:MM)
    </label>
    <input
      type="text"
      id="endTime"
      name="endTime"
      value={createClassForm.endTime}
      disabled
      className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border border-gray-300/70 text-gray-600 cursor-not-allowed"
    />
  </div>
</div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          disabled={isSubmitting || !!errorMessage}
        >
          {isSubmitting ? "Creating..." : "Create Class"}
        </button>
      </form>
    </div>
  </div>
)}

{/* Edit Class Modal */}
{showEditClassModal && editingClass && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-white/20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Edit Class
          </h2>
        </div>
        <button
          onClick={() => {
            setShowEditClassModal(false);
            setEditingClass(null);
            setErrorMessage("");
          }}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleUpdateClassSubmit} className="space-y-6">
        <div>
          <label htmlFor="edit-title" className="block text-gray-600 mb-2 text-sm font-medium">
            Class Title
          </label>
          <input
            type="text"
            id="edit-title"
            value={editingClass.title}
            onChange={(e) => setEditingClass({ ...editingClass, title: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-gray-600 mb-2 text-sm font-medium">
            Description
          </label>
          <textarea
            id="edit-description"
            value={editingClass.description || ""}
            onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-28 transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="edit-startTime" className="block text-gray-600 mb-2 text-sm font-medium">
              Start Time (HH:MM)
            </label>
            <input
              type="text"
              id="edit-startTime"
              value={editingClass.startTime}
              onChange={(e) => {
                let value = e.target.value.replace(/[^\d:]/g, '');
                if (value.length === 2 && !value.includes(':')) value = value + ':';
                if (value.length > 5) value = value.slice(0, 5);
                setEditingClass({ ...editingClass, startTime: value });
              }}
              pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
              maxLength={5}
              className="w-full px-4 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-endTime" className="block text-gray-600 mb-2 text-sm font-medium">
              End Time (HH:MM)
            </label>
            <input
              type="text"
              id="edit-endTime"
              value={editingClass.endTime}
              onChange={(e) => {
                let value = e.target.value.replace(/[^\d:]/g, '');
                if (value.length === 2 && !value.includes(':')) value = value + ':';
                if (value.length > 5) value = value.slice(0, 5);
                setEditingClass({ ...editingClass, endTime: value });
              }}
              pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
              maxLength={5}
              className="w-full px-4 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          disabled={isSubmitting || !!errorMessage}
        >
          {isSubmitting ? "Updating..." : "Update Class"}
        </button>
      </form>
    </div>

  </div>
)}
{/* Cancel Class Modal */}
{showCancelModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-red-50/80 via-orange-50/80 to-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-lg border border-white/20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Cancel Class
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Please provide a reason for cancelling this class
          </p>
        </div>
        <button
          onClick={() => {
            setShowCancelModal(false);
            setCancellingClassId(null);
            setCancellationReason("");
            setErrorMessage("");
          }}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="cancellationReason" className="block text-gray-600 mb-2 text-sm font-medium">
            Reason for Cancellation <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cancellationReason"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 h-32 transition-all"
            placeholder="e.g., Instructor illness, scheduling conflict, etc."
            required
          />
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg"> */}
          {/* <div className="flex items-start gap-2"> */}
            {/* <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" /> */}
            {/* <div className="text-sm text-yellow-800"> */}
              {/* <p className="font-medium">Warning</p> */}
              {/* <p className="mt-1">All enrolled students will be notified via email about this cancellation.</p> */}
            {/* </div> */}
          {/* </div> */}
        {/* </div> */}

    <div className="flex gap-3 pt-2">
  <button
    onClick={() => {
      setShowCancelModal(false);
      setCancellingClassId(null);
      setCancellationReason("");
      setErrorMessage("");
    }}
    disabled={isCancelling}
    className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Keep Class
  </button>
  <button
    onClick={handleConfirmCancellation}
    disabled={!cancellationReason.trim() || isCancelling}
    className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-lg font-semibold text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
  >
    {isCancelling ? (
      <>
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span>Cancelling...</span>
      </>
    ) : (
      "Cancel Class"
    )}
  </button>
</div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default TutorAvailabilitySlots;