"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tutor, ClassData, Course, CreateClassForm } from "./components/Types";

// Import all modals + grid
import SlotGrid from "./components/Slotgrid";
import RepeatModal from "./components/Repeatmodal";
import CreateClassModal from "./components/Createclassmodal";
import EditClassModal from "./components/Editclassmodal";
import CancelClassModal from "./components/Cancelclassmodal";
import SocietyModal from "./components/Societymodal";
import ViewClassModal from "./components/Viewclassmodal";




const TutorAvailabilitySlots = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
const searchParams = useSearchParams();
const [selectedTutor, setSelectedTutor] = useState<string>(
  searchParams.get("tutorId") || ""
);
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
const [viewClassDetails, setViewClassDetails] = useState<ClassData | null>(null);
const router = useRouter();
// const societyId = searchParams.get("societyId") || "";
const [slotSocietyMap, setSlotSocietyMap] = useState<Map<string, string[]>>(new Map());
const [currentSocietyId, setCurrentSocietyId] = useState<string>(
  searchParams.get("societyId") || ""
);
const [selectedSocietyIds, setSelectedSocietyIds] = useState<string[]>([]);
const [showSocietyModal, setShowSocietyModal] = useState(false);

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
  const fetchSocieties = async () => {
    try {
      const res = await fetch("/Api/salesHead/society");
      const data = await res.json();
      if (data.success) setSocieties(data.societies);
    } catch (e) {
      console.error("Failed to fetch societies", e);
    }
  };
  fetchSocieties();
}, []);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        const response = await fetch("/Api/salesHead/allTutorsInfo");
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
    const newSocietyMap = new Map<string, string>();  // key -> societyName


    tutor.slotsAvailable.forEach((slot) => {
      try {
if (currentSocietyId && slot.societyId && slot.societyId !== currentSocietyId) return;
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
          if (slot.societyName) {
      newSocietyMap.set(key, slot.societyName);  // store society name
    }
        }
      } catch (error) {
        console.error("Error processing slot:", error);
      }
    });

    setSlots(newSlots);
    setSlotSocietyMap(newSocietyMap);
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

        const [year, month, day] = date.split('-').map(Number);
        const slotStartLocal = new Date(year, month - 1, day, hour, 0, 0);
        const slotEndLocal = new Date(year, month - 1, day, hour + 1, 0, 0);

        return startLocal < slotEndLocal && endLocal > slotStartLocal;
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
  if (!selectedTutor) return toast.error("Please select a tutor");
  if (slots.size === 0) return toast.error("No slots selected");
  setShowSocietyModal(true); // show society picker before saving
};

const handleSocietyConfirmAndSave = async () => {
  if (selectedSocietyIds.length === 0) return toast.error("Select at least one society");
  setShowSocietyModal(false);
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

      const response = await fetch("/Api/salesHead/demoSlots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify({ tutorId: selectedTutor, slots: slotsToSave, societyIds: selectedSocietyIds })

      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save slots");
      }

      toast.success("Slots saved successfully!");
      
      const tutorsResponse = await fetch("/Api/salesHead/allTutorsInfo");
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
  const handleCalendar = () => {
    router.push(`/salesHead/demoSlotAllocation`);
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
      {/* Header / tutor selector stays inline or extract to its own component */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Tutor Availability Management
        </h1>
        {/* tutor display, society selector, save button */}
      </div>

      {/* Slot Grid */}
      <SlotGrid
        slots={slots}
        classes={classes}
        tutors={tutors}
        selectedTutor={selectedTutor}
        currentDate={currentDate}
        userTimezone={userTimezone}
        slotSocietyMap={slotSocietyMap}
        selectedSlots={selectedSlots}
        onSlotChange={handleSlotChange}
        onOpenCreateClass={handleOpenCreateClass}
        onEditClass={handleEditClass}
        onDeleteClass={handleDeleteClass}
        onViewClass={setViewClassDetails}
        onWeekChange={changeWeek}
        onToday={() => setCurrentDate(new Date())}
      />

      {/* Modals — conditionally rendered, all controlled from page.tsx */}
      {showRepeatModal && (
        <RepeatModal
          selectedSlots={selectedSlots}
          repeatType={repeatType}
          selectedDays={selectedDays}
          repeatStartDate={repeatStartDate}
          repeatEndDate={repeatEndDate}
          onRepeatTypeChange={setRepeatType}
          onToggleDay={toggleDay}
          onStartDateChange={setRepeatStartDate}
          onEndDateChange={setRepeatEndDate}
          onApply={applyRepeatPattern}
          onClose={() => setShowRepeatModal(false)}
          getPreviewSlots={getPreviewSlots}
          getAllowedDays={getAllowedDaysFromSelectedSlots}
        />
      )}

      {showCreateClassModal && (
        <CreateClassModal
          form={createClassForm}
          courses={courses}
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
          onFormChange={handleCreateClassFormChange}
          onSubmit={handleCreateClassSubmit}
          onClose={() => setShowCreateClassModal(false)}
        />
      )}

      {showEditClassModal && editingClass && (
        <EditClassModal
          editingClass={editingClass}
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
          onClassChange={setEditingClass}
          onSubmit={handleUpdateClassSubmit}
          onClose={() => {
            setShowEditClassModal(false);
            setEditingClass(null);
            setErrorMessage("");
          }}
        />
      )}

      {showCancelModal && (
        <CancelClassModal
          cancellationReason={cancellationReason}
          isCancelling={isCancelling}
          errorMessage={errorMessage}
          onReasonChange={setCancellationReason}
          onConfirm={handleConfirmCancellation}
          onClose={() => {
            setShowCancelModal(false);
            setCancellingClassId(null);
            setCancellationReason("");
            setErrorMessage("");
          }}
        />
      )}

      {showSocietyModal && (
        <SocietyModal
          societies={societies}
          selectedSocietyIds={selectedSocietyIds}
          saving={saving}
          onToggleSociety={(id) =>
            setSelectedSocietyIds(prev =>
              prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            )
          }
          onConfirm={handleSocietyConfirmAndSave}
          onClose={() => setShowSocietyModal(false)}
        />
      )}

      {viewClassDetails && (
        <ViewClassModal
          classItem={viewClassDetails}
          onClose={() => setViewClassDetails(null)}
        />
      )}
    </div>
  );
};



const TutorAvailabilitySlotsWrapper = () => (
  <Suspense fallback={
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  }>
    <TutorAvailabilitySlots />
  </Suspense>
);

export default TutorAvailabilitySlotsWrapper;
