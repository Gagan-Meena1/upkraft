"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { parseISO, format, addDays } from "date-fns";
import * as dateFnsTz from "date-fns-tz";
import { Tutor, TutorListItem, ClassData, Course, CreateClassForm, Society, RegistrationData } from "./components/Types";
import "./demoSlotAllocation.css";

// Import all modals + grid
import SlotGrid from "./components/Slotgrid";
import RepeatModal from "./components/Repeatmodal";
import CreateClassModal from "./components/Createclassmodal";
import EditClassModal from "./components/Editclassmodal";
import CancelClassModal from "./components/Cancelclassmodal";
import SocietyModal from "./components/Societymodal";
import ViewClassModal from "./components/Viewclassmodal";

// New UI components
import Navbar from "./components/Navbar";
import FilterBar from "./components/FilterBar";
import ViewTabs from "./components/ViewTabs";
import TutorSidebar from "./components/TutorSidebar";
import MobileBar from "./components/MobileBar";
import DayTabs from "./components/DayTabs";
import DayView from "./components/DayView";
import Toast from "./components/Toast";
import AssignSocietiesModal from "./components/AssignSocietiesModal";
import OpenSlotsPanel from "./components/OpenSlotsPanel";
import EditSlotModal from "./components/EditSlotModal";
import type { EditSlotData, SlotStatusValue } from "./components/EditSlotModal";




const TutorAvailabilitySlots = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [tutorList, setTutorList] = useState<TutorListItem[]>([]);
  const searchParams = useSearchParams();
  const [selectedTutor, setSelectedTutor] = useState<string>(
    searchParams.get("tutorId") || ""
  );

  // Persist selected tutor in URL so it survives refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedTutor) {
      params.set("tutorId", selectedTutor);
    } else {
      params.delete("tutorId");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [selectedTutor]);

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
  const [slotKeyToIdMap, setSlotKeyToIdMap] = useState<Map<string, string>>(new Map());
  const [slotTimeMap, setSlotTimeMap] = useState<Map<string, string>>(new Map());
  const [currentSocietyId, setCurrentSocietyId] = useState<string>(
    searchParams.get("societyId") || ""
  );
  const [selectedSocietyIds, setSelectedSocietyIds] = useState<string[]>([]);
  const [showSocietyModal, setShowSocietyModal] = useState(false);
  const [pendingSlotInfo, setPendingSlotInfo] = useState<{ date: string; hour: number } | null>(null);
  const [pendingRepeatSlots, setPendingRepeatSlots] = useState<Set<string>>(new Set());

  // New UI state
  const [filterTutors, setFilterTutors] = useState<string[]>([]);
  const [filterSoc, setFilterSoc] = useState("");
  const [currentView, setCurrentView] = useState<"tutor" | "society">("tutor");
  const [activeDay, setActiveDay] = useState(0);
  const [showAssignSocModal, setShowAssignSocModal] = useState(false);
  const [showOpenPanel, setShowOpenPanel] = useState(false);
  const [openPanelSoc, setOpenPanelSoc] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [editSlotInfo, setEditSlotInfo] = useState<{ date: string; hour: number } | null>(null);
  // Batch open slots: key = "date-hour", value = { startTime, endTime }
  const [pendingOpenSlots, setPendingOpenSlots] = useState<Map<string, { date: string; hour: number; startTime: string; endTime: string }>>(new Map());
  const [showBatchSocModal, setShowBatchSocModal] = useState(false);
  const [batchSocIds, setBatchSocIds] = useState<string[]>([]);

  const toast = {
    success: (msg: string) => { setToastMsg(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 2800); },
    error: (msg: string) => { setToastMsg(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 2800); }
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

  // Societies come from tutor.societies (fetched with allTutorsInfo)

  useEffect(() => {
    const fetchTutorList = async () => {
      setLoading(true);
      try {
        const response = await fetch("/Api/salesHead/tutorsList");
        const data = await response.json();
        if (data.success && data.tutors) {
          setTutorList(data.tutors);
        }
      } catch (error) {
        console.error("Error fetching tutor list:", error);
        toast.error("Failed to load tutors");
      } finally {
        setLoading(false);
      }
    };
    fetchTutorList();
  }, []);

  // Fetch full data for a single selected tutor
  const fetchSelectedTutorData = async (tutorId?: string) => {
    const id = tutorId || selectedTutor;
    if (!id) return;
    try {
      const response = await fetch(`/Api/salesHead/allTutorsInfo?tutorId=${id}`);
      const data = await response.json();
      if (data.success && data.tutors && data.tutors.length > 0) {
        setTutors(data.tutors);
      }
    } catch (error) {
      console.error("Error fetching tutor data:", error);
    }
  };

  // Load full data when tutor is selected
  useEffect(() => {
    if (selectedTutor) {
      fetchSelectedTutorData(selectedTutor);
    } else {
      setTutors([]);
    }
  }, [selectedTutor]);

  const fetchClasses = async (tutorId?: string) => {
    const id = tutorId || selectedTutor;
    if (!id) {
      setClasses([]);
      return;
    }
    try {
      const response = await fetch(`/Api/classes?userid=${id}`);
      const data = await response.json();
      if (data.classData) {
        setClasses(data.classData);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
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
    const newSocietyMap = new Map<string, string[]>();
    const newKeyToIdMap = new Map<string, string>();
    const newTimeMap = new Map<string, string>();

    tutor.slotsAvailable.forEach((slot) => {
      try {
        // Filter by society if a filter is active
        if (currentSocietyId && slot.societyIds && slot.societyIds.length > 0) {
          if (!slot.societyIds.includes(currentSocietyId)) return;
        }
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

        // Format the actual slot time from the API
        const timeStr = `${format(startLocal, "h:mm a")} – ${format(endLocal, "h:mm a")}`;

        // Calculate which hour rows this slot occupies
        // If end has minutes > 0, the slot extends into that hour row
        const loopEndHour = endLocal.getMinutes() > 0 ? endHour + 1 : endHour;
        // Ensure sub-hour slots (e.g. 12:20–12:50) still mark at least one row
        const effectiveEnd = Math.max(loopEndHour, startHour + 1);

        for (let hour = startHour; hour < effectiveEnd; hour++) {
          const key = `${slotDate}-${hour}`;
          newSlots.set(key, "available");
          newTimeMap.set(key, timeStr);
          // Map this grid key to the DB slot _id for deletion
          if (slot._id) {
            newKeyToIdMap.set(key, slot._id);
          }
          if (slot.societyNames && slot.societyNames.length > 0) {
            const existing = newSocietyMap.get(key) || [];
            const merged = [...new Set([...existing, ...slot.societyNames])];
            newSocietyMap.set(key, merged);
          }
        }
      } catch (error) {
        console.error("Error processing slot:", error);
      }
    });

    setSlots(newSlots);
    setSlotSocietyMap(newSocietyMap);
    setSlotKeyToIdMap(newKeyToIdMap);
    setSlotTimeMap(newTimeMap);
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




  const changeWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const handleSlotChange = async (date: string, hour: number, status: "available" | "unavailable") => {
    const key = `${date}-${hour}`;

    if (status === "unavailable") {
      // Check if this slot exists in DB (has a mapped _id)
      const slotDbId = slotKeyToIdMap.get(key);
      if (slotDbId && selectedTutor) {
        if (!confirm('Remove this slot from the database?')) return;
        try {
          const res = await fetch('/Api/salesHead/demoSlots', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tutorId: selectedTutor, slotId: slotDbId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to remove slot');

          // Refresh tutor data to get updated slots
          await fetchSelectedTutorData(selectedTutor);
          toast.success('Slot removed successfully!');
        } catch (err: any) {
          toast.error(err.message || 'Failed to remove slot');
        }
        return;
      }

      // Just a locally-added slot (not yet saved) — remove from local state
      const newSlots = new Map(slots);
      newSlots.delete(key);
      const newSelected = new Set(selectedSlots);
      newSelected.delete(key);
      setSelectedSlots(newSelected);
      setSlots(newSlots);
    } else {
      // Mark as selected — user will click "Save Slots" to pick societies
      const newSlots = new Map(slots);
      newSlots.set(key, "available");
      const newSelected = new Set(selectedSlots);
      newSelected.add(key);
      setSelectedSlots(newSelected);
      setSlots(newSlots);
    }
  };

  // Open society popup for all selected slots
  const handleSaveSelectedSlots = () => {
    if (!selectedTutor) return alert("Please select a tutor");
    if (selectedSlots.size === 0) return alert("Please select at least one slot");
    setPendingSlotInfo(null);
    setPendingRepeatSlots(new Set());
    setSelectedSocietyIds([]);
    setShowSocietyModal(true);
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

  const applyRepeatPattern = async () => {

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

    const tutor = tutors.find(t => t._id === selectedTutor);
    const tutorTimezone = tutor?.timezone || userTimezone;

    // Build map: "dayOfWeek-hour" → societyIds from the original slot
    const templateSocieties = new Map<string, string[]>();
    selectedSlots.forEach(key => {
      const slotDbId = slotKeyToIdMap.get(key);
      const parts = key.split("-");
      const hour = parseInt(parts[parts.length - 1]);
      const date = parts.slice(0, 3).join("-");
      const dow = parseISO(date).getDay();

      if (slotDbId && tutor) {
        const slot = tutor.slotsAvailable.find((s: any) => s._id === slotDbId);
        if (slot?.societyIds) {
          templateSocieties.set(`${dow}-${hour}`, slot.societyIds);
        }
      }
    });

    // Generate new slots grouped by their societyIds
    // key = JSON.stringify(societyIds), value = [{startTime, endTime}]
    const slotsGroupedBySociety = new Map<string, { startTime: string; endTime: string }[]>();
    let totalCount = 0;


    let cur = new Date(startDate);
    while (cur <= endDate) {
      const curDow = cur.getDay();
      const shouldInclude = repeatType === "daily" || selectedDays.includes(curDow);

      if (shouldInclude) {
        selectedSlots.forEach(key => {
          const parts = key.split("-");
          const origDate = parts.slice(0, 3).join("-");
          const hour = parseInt(parts[parts.length - 1]);
          const origDow = parseISO(origDate).getDay();

          if (repeatType === "daily" || origDow === curDow) {
            const dateStr = format(cur, 'yyyy-MM-dd');
            const newKey = `${dateStr}-${hour}`;

            // Skip if slot already exists in DB
            if (slotKeyToIdMap.has(newKey)) return;

            // Get society IDs from the original slot
            const societyIds = templateSocieties.get(`${origDow}-${hour}`) || [];
            const societyKey = JSON.stringify([...societyIds].sort());

            // Convert to UTC
            const [year, month, day] = dateStr.split('-').map(Number);
            const startLocal = new Date(year, month - 1, day, hour, 0, 0);
            const endLocal = new Date(year, month - 1, day, hour + 1, 0, 0);
            const startUTC = dateFnsTz.fromZonedTime(startLocal, tutorTimezone);
            const endUTC = dateFnsTz.fromZonedTime(endLocal, tutorTimezone);

            const existing = slotsGroupedBySociety.get(societyKey) || [];
            existing.push({ startTime: startUTC.toISOString(), endTime: endUTC.toISOString() });
            slotsGroupedBySociety.set(societyKey, existing);
            totalCount++;
          }
        });
      }
      cur = addDays(cur, 1);
    }

    if (totalCount === 0) {
      toast.error("No new slots to create (all already exist)");
      return;
    }

    // ✅ Check if any slots have no society assignment (NA slots selected by mistake)
    const hasEmptySocieties = Array.from(slotsGroupedBySociety.keys()).some(
      k => JSON.parse(k).length === 0
    );
    if (hasEmptySocieties) {
      toast.error("Some selected slots have no societies assigned. Please use 'Select More' on Open slots only.");
      setSaving(false);
      return;
    }

    setSaving(true);
    setShowRepeatModal(false);

    try {
      // One API call per unique society combination
      for (const [societyKey, slotsArr] of slotsGroupedBySociety) {
        const societyIds = JSON.parse(societyKey);
        const res = await fetch("/Api/salesHead/demoSlots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tutorId: selectedTutor, slots: slotsArr, societyIds }),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.message);
      }

      await fetchSelectedTutorData(selectedTutor);
      setSelectedSlots(new Set());
      toast.success(`${totalCount} slots repeated successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to repeat slots");
    } finally {
      setSaving(false);
    }
  };

  // Convert slot keys to API-ready slot objects
  const slotKeysToApiSlots = (keys: Iterable<string>): { startTime: string; endTime: string }[] => {
    const tutor = tutors.find((t) => t._id === selectedTutor);
    const tutorTimezone = tutor?.timezone || userTimezone;
    const result: { startTime: string; endTime: string }[] = [];

    for (const key of keys) {
      const parts = key.split("-");
      const hour = parseInt(parts[parts.length - 1]);
      const dateStr = parts.slice(0, 3).join("-");
      const [year, month, day] = dateStr.split('-').map(Number);

      const startLocal = new Date(year, month - 1, day, hour, 0, 0);
      const endLocal = new Date(year, month - 1, day, hour + 1, 0, 0);

      if (isNaN(startLocal.getTime()) || isNaN(endLocal.getTime())) continue;

      const startUTC = dateFnsTz.fromZonedTime(startLocal, tutorTimezone);
      const endUTC = dateFnsTz.fromZonedTime(endLocal, tutorTimezone);

      result.push({ startTime: startUTC.toISOString(), endTime: endUTC.toISOString() });
    }
    return result;
  };

  // Called when user confirms societies in the popup
  const handleSocietyConfirmAndSave = async () => {
    if (selectedSocietyIds.length === 0) return toast.error("Select at least one society");
    if (!selectedTutor) return toast.error("Please select a tutor");

    // Save ALL selected slots with the chosen societies
    const slotsToSave = slotKeysToApiSlots(selectedSlots);
    if (slotsToSave.length === 0) return toast.error("No slots to save");

    setSaving(true);
    setShowSocietyModal(false);

    try {
      const response = await fetch("/Api/salesHead/demoSlots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId: selectedTutor, slots: slotsToSave, societyIds: selectedSocietyIds }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save slots");

      toast.success("Slots saved successfully!");

      // Refresh tutor data
      await fetchSelectedTutorData(selectedTutor);

      // Reset pending state
      setPendingSlotInfo(null);
      setPendingRepeatSlots(new Set());
      setSelectedSlots(new Set());
      setSelectedSocietyIds([]);
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

  const handleOpenManageSocieties = () => {
    if (!selectedTutor) {
      toast.error("Please select a tutor first to manage their societies");
    } else {
      setShowAssignSocModal(true);
    }
  };



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
  // Compute week label
  const getWeekLabel = () => {
    const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const ref = new Date(currentDate.getTime());
    const day = ref.getDay();
    const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(ref); start.setDate(diff);
    const end = new Date(start); end.setDate(start.getDate() + 6);
    return `${start.getDate()} ${MO[start.getMonth()]} – ${end.getDate()} ${MO[end.getMonth()]} ${end.getFullYear()}`;
  };

  const getWeekDays = (): Date[] => {
    const ref = new Date(currentDate.getTime());
    const day = ref.getDay();
    const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(ref); startOfWeek.setDate(diff);
    const days = [];
    for (let i = 0; i < 7; i++) { const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i); days.push(d); }
    return days;
  };

  const allSocieties: Society[] = [...new Map(tutors.flatMap(t => t.societies || []).map(s => [s._id, s])).values()];
  const curTutor = tutors.find(t => t._id === selectedTutor);
  const curSocieties: Society[] = curTutor?.societies || [];

  const toggleTutorFilter = (id: string) => {
    setFilterTutors(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) {
    return (
      <div className="slot-page" style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 48, height: 48, border: "3px solid var(--p)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className="slot-page">
      <Navbar
        weekLabel={getWeekLabel()}
        onPrevWeek={() => changeWeek(-1)}
        onNextWeek={() => changeWeek(1)}
        onManageSocieties={handleOpenManageSocieties}
        onRepeat={handleOpenRepeatModal}
        selectedSlotCount={selectedSlots.size}
      />

      <FilterBar
        tutorList={tutorList}
        filterSoc={filterSoc}
        allSocieties={allSocieties}
        onSocFilterChange={setFilterSoc}
        onClearFilters={() => { setFilterSoc(""); }}
        onOpenSlotsPanel={() => setShowOpenPanel(true)}
        selectedSlotCount={selectedSlots.size}
        saving={saving}
        onSaveSlots={handleSaveSelectedSlots}
        onSelectTutor={setSelectedTutor}
        selectedTutor={selectedTutor}
        pendingOpenCount={pendingOpenSlots.size}
        onSaveAllOpen={() => {
          if (pendingOpenSlots.size === 0) return;
          setBatchSocIds([]);
          setShowBatchSocModal(true);
        }}
        selectedTutorSocieties={curSocieties}
      />

      <ViewTabs currentView={currentView} onSwitchView={setCurrentView} />

      <div className="sm-body">
        {/* Mobile bar */}
        <MobileBar
          tutorList={tutorList}
          selectedTutor={selectedTutor}
          onSelectTutor={setSelectedTutor}
          societies={curSocieties}
          onManageSocieties={handleOpenManageSocieties}
        />

        {/* Day tabs (mobile) */}
        <DayTabs weekDays={getWeekDays()} activeDay={activeDay} onSelectDay={setActiveDay} />

        {/* Desktop sidebar */}
        {currentView === "tutor" && (
          <TutorSidebar
            tutorList={tutorList}
            selectedTutor={selectedTutor}
            onSelectTutor={setSelectedTutor}
            onManageSocieties={handleOpenManageSocieties}
            filterTutors={filterTutors}
            selectedTutorSocieties={curSocieties}
          />
        )}

        {/* Grid (desktop) */}
        {currentView === "tutor" && (
          <SlotGrid
            slots={slots}
            classes={classes}
            tutors={tutors}
            selectedTutor={selectedTutor}
            currentDate={currentDate}
            userTimezone={userTimezone}
            slotSocietyMap={slotSocietyMap}
            slotTimeMap={slotTimeMap}
            selectedSlots={selectedSlots}
            onSlotClick={(date, hour) => setEditSlotInfo({ date, hour })}
            onViewClass={setViewClassDetails}
            onWeekChange={changeWeek}
            onToday={() => setCurrentDate(new Date())}
          />
        )}

        {/* Society fill view placeholder */}
        {currentView === "society" && (
          <div className="grid-area" style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
            <div style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Society Fill View</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Coming soon — select a society to see slot fill across all tutors</div>
            </div>
          </div>
        )}
      </div>

      {/* All existing modals */}
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
          onClose={() => { setShowEditClassModal(false); setEditingClass(null); setErrorMessage(""); }}
        />
      )}

      {showCancelModal && (
        <CancelClassModal
          cancellationReason={cancellationReason}
          isCancelling={isCancelling}
          errorMessage={errorMessage}
          onReasonChange={setCancellationReason}
          onConfirm={handleConfirmCancellation}
          onClose={() => { setShowCancelModal(false); setCancellingClassId(null); setCancellationReason(""); setErrorMessage(""); }}
        />
      )}

      {showSocietyModal && (() => {
        const tutorSocieties: Society[] = curTutor?.societies || [];
        return (
          <SocietyModal
            societies={tutorSocieties}
            selectedSocietyIds={selectedSocietyIds}
            saving={saving}
            onToggleSociety={(id) => setSelectedSocietyIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            onConfirm={handleSocietyConfirmAndSave}
            onClose={() => { setShowSocietyModal(false); setPendingSlotInfo(null); setPendingRepeatSlots(new Set()); }}
          />
        );
      })()}

      {viewClassDetails && (
        <ViewClassModal classItem={viewClassDetails} onClose={() => setViewClassDetails(null)} />
      )}

      {showAssignSocModal && (
        <AssignSocietiesModal
          tutors={tutors}
          initialTutorId={selectedTutor}
          onClose={() => setShowAssignSocModal(false)}
          onSaved={async () => {
            // Refresh tutor data
            await fetchSelectedTutorData(selectedTutor);
            toast.success("Societies assigned successfully!");
          }}
        />
      )}

      {showOpenPanel && (
        <OpenSlotsPanel
          tutors={tutors}
          allSocieties={allSocieties}
          selectedSoc={openPanelSoc}
          onSocChange={setOpenPanelSoc}
          onJumpToSlot={(tutorId) => { setSelectedTutor(tutorId); setShowOpenPanel(false); }}
          onClose={() => setShowOpenPanel(false)}
          slots={slots}
          slotSocietyMap={slotSocietyMap}
        />
      )}
      {editSlotInfo && (() => {
        const { date, hour } = editSlotInfo;
        const key = `${date}-${hour}`;
        const status = slots.get(key) || "unavailable";
        const socs = slotSocietyMap.get(key) || [];
        const socIds = curSocieties.filter(s => socs.includes(s.name)).map(s => s._id);
        const d = new Date(date);
        const dayName = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
        const formatH = (h: number) => {
          if (h < 12) return `${h}:00 AM`;
          if (h === 12) return `12:00 PM`;
          return `${h - 12}:00 PM`;
        };
        const slotClasses = getClassesForSlot(date, hour);

        // Compute proper initial status based on actual slot state
        const curTutor = tutors.find(t => t._id === selectedTutor);
        const regs = curTutor?.registrations || [];
        const tutorTz = curTutor?.timezone || userTimezone;

        // Find matching registration for this slot
        let matchingReg: RegistrationData | null = null;
        if (slotClasses.length > 0) {
          const classItem = slotClasses[0];
          const startLocal = dateFnsTz.toZonedTime(parseISO(classItem.startTime), tutorTz);
          const endLocal = dateFnsTz.toZonedTime(parseISO(classItem.endTime), tutorTz);
          matchingReg = regs.find((r) => {
            if (!r.demoDate) return false;
            try {
              const regStart = dateFnsTz.toZonedTime(parseISO(r.demoDate), tutorTz);
              return (regStart >= startLocal && regStart < endLocal) ||
                Math.abs(regStart.getTime() - startLocal.getTime()) < 60000;
            } catch { return false; }
          }) || null;
        }

        // Determine initial status
        let computedStatus: "na" | "open" | "demo" | "booked" | "edit";
        if (matchingReg) {
          computedStatus = matchingReg.paymentAmount > 0 ? "booked" : "demo";
        } else if (status === "available") {
          computedStatus = "open";
        } else {
          computedStatus = "na";
        }

        return (
          <EditSlotModal
            dateLabel={dayName}
            timeLabel={`${formatH(hour)} – ${formatH(hour + 1)}`}
            hour={hour}
            dateStr={date}
            societies={curSocieties}
            initialStatus={computedStatus}
            initialSocietyIds={socIds}
            slotClasses={slotClasses}
            initialRegistration={matchingReg}
            saving={saving}
            pendingCount={pendingOpenSlots.size}
            onClose={() => setEditSlotInfo(null)}
            onSelectMore={(st, et) => {
              const isExistingSlot = slotKeyToIdMap.has(key); // ✅ check if already in DB

              if (!isExistingSlot) {
                // New slot — add to pending open batch (needs society selection)
                setPendingOpenSlots(prev => {
                  const next = new Map(prev);
                  next.set(key, { date, hour, startTime: st, endTime: et });
                  return next;
                });
              }

              // Always add to selectedSlots (for repeat)
              setSelectedSlots(prev => {
                const next = new Set(prev);
                next.add(key);
                return next;
              });

              setEditSlotInfo(null);
              toast.success(
                isExistingSlot
                  ? `Slot queued for repeat (${selectedSlots.size + 1} total) — click 🔁 Repeat`
                  : `Slot added to batch (${pendingOpenSlots.size + 1} total)`
              );
            }}
            onDelete={async (registrationId: string) => {
              setSaving(true);
              try {
                const res = await fetch(`/Api/registration/${registrationId}`, {
                  method: "DELETE",
                });
                const result = await res.json();
                if (!result.success) throw new Error(result.message);
                // Refresh tutor data — slot stays open
                await fetchClasses(selectedTutor);
                await fetchSelectedTutorData(selectedTutor);
                toast.success("Registration and class deleted. Slot is now Open.");
                setEditSlotInfo(null);
              } catch (err: any) {
                console.error("Delete registration error:", err);
                toast.error(err.message || "Failed to delete registration");
              } finally {
                setSaving(false);
              }
            }}
            onSave={async (data: EditSlotData) => {
              setSaving(true);
              // Use editDate from the modal if the user changed it, else fall back to the grid date
              const effectiveDate = data.editDate || date;
              try {
                // If slot has a registration and user is switching to NA or Open,
                // delete the registration first (same as the delete button)
                if ((data.status === "na" || data.status === "open") && matchingReg) {
                  const regId = matchingReg._id;
                  const delRes = await fetch(`/Api/registration/${regId}`, {
                    method: "DELETE",
                  });
                  const delResult = await delRes.json();
                  if (!delResult.success) throw new Error(delResult.message || "Failed to delete registration");
                }

                if (data.status === "na") {
                  // Mark as unavailable — remove slot from DB
                  handleSlotChange(date, hour, "unavailable");
                  await fetchClasses(selectedTutor);
                  await fetchSelectedTutorData(selectedTutor);
                  toast.success(matchingReg ? "Registration deleted & slot marked as NA" : "Slot marked as NA");

                } else if (data.status === "open") {
                  const startISO = new Date(`${effectiveDate}T${data.startTime}:00`).toISOString();
                  const endISO = new Date(`${effectiveDate}T${data.endTime}:00`).toISOString();
                  const socIdsToSend = data.societyIds.length > 0 ? data.societyIds : curSocieties.map(s => s._id);

                  // Check if slot already exists in DB — use PUT to update, not POST to create
                  const existingSlotId = slotKeyToIdMap.get(key);
                  if (existingSlotId) {
                    // UPDATE existing slot
                    const res = await fetch("/Api/salesHead/demoSlots", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        tutorId: selectedTutor,
                        slotId: existingSlotId,
                        startTime: startISO,
                        endTime: endISO,
                        societyIds: socIdsToSend,
                      }),
                    });
                    const result = await res.json();
                    if (!result.success) throw new Error(result.message);
                    toast.success(matchingReg ? "Registration deleted & slot updated!" : "Slot updated successfully!");
                  } else {
                    // CREATE new slot (NA → Open)
                    const res = await fetch("/Api/salesHead/demoSlots", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        tutorId: selectedTutor,
                        slots: [{ startTime: startISO, endTime: endISO }],
                        societyIds: socIdsToSend,
                      }),
                    });
                    const result = await res.json();
                    if (!result.success) throw new Error(result.message);
                    toast.success(matchingReg ? "Registration deleted & slot opened!" : "Slot opened with societies saved!");
                  }

                  // Refresh tutor data
                  await fetchClasses(selectedTutor);
                  await fetchSelectedTutorData(selectedTutor);

                } else if (data.status === "demo") {
                  if (data.registrationId) {
                    // Existing registration — update via PUT
                    const updateBody: any = {
                      name: data.name,
                      participantName: data.participantName,
                      contactNumber: data.contactNumber,
                      email: data.email || "",
                      age: data.age ? parseInt(data.age) : null,
                      notes: data.notes,
                      societyName: data.societyName || "",
                      instrument: data.instrument,
                      address: data.address,
                      payment: { amount: 0, status: "Pending" },
                      demoDate: new Date(`${effectiveDate}T${data.startTime}:00`).toISOString(),
                      demoTime: formatH(parseInt(data.startTime.split(":")[0])),
                    };
                    const res = await fetch(`/Api/registration/${data.registrationId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(updateBody),
                    });
                    const result = await res.json();
                    if (!result.success) throw new Error(result.message);

                    // Also update the linked class time if it exists
                    if (matchingReg?.classId) {
                      const tutor = tutors.find(t => t._id === selectedTutor);
                      const tz = tutor?.timezone || userTimezone;
                      await fetch(`/Api/classes?classId=${matchingReg.classId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: slotClasses.length > 0 ? slotClasses[0].title : "Free Trial",
                          description: slotClasses.length > 0 ? (slotClasses[0].description || "") : "",
                          date: effectiveDate,
                          startTime: data.startTime,
                          endTime: data.endTime,
                          timezone: tz,
                          updateIntent: "edit",
                        }),
                      });
                    }
                  } else {
                    // No existing registration — create new via bookTrial
                    const res = await fetch("/Api/public/bookTrial", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: data.name,
                        phone: data.contactNumber,
                        email: data.email || "",
                        pname: data.participantName,
                        age: data.age ? parseInt(data.age) : null,
                        notes: data.notes,
                        consent: true,
                        society: { name: data.societyName || "", city: data.city || "" },
                        hobby: { name: data.instrument },
                        tutorId: selectedTutor,
                        date: new Date(`${effectiveDate}T${data.startTime}:00`).toISOString(),
                        slotTime: formatH(hour),
                        duration: data.duration,
                        address: data.address,
                      }),
                    });
                    const result = await res.json();
                    if (!result.success) throw new Error(result.message);
                  }
                  await fetchClasses(selectedTutor);
                  await fetchSelectedTutorData(selectedTutor);
                  toast.success("Demo booked successfully!");

                } else if (data.status === "booked") {
                  if (data.registrationId) {
                    // Existing registration — update all fields + payment via PUT
                    const updateBody: any = {
                      name: data.name,
                      participantName: data.participantName,
                      contactNumber: data.contactNumber,
                      email: data.email || "",
                      age: data.age ? parseInt(data.age) : null,
                      notes: data.notes,
                      societyName: data.societyName || "",
                      instrument: data.instrument,
                      address: data.address,
                      payment: { amount: parseInt(data.paymentAmount) || 0, status: "Done" },
                      demoDate: new Date(`${effectiveDate}T${data.startTime}:00`).toISOString(),
                      demoTime: formatH(parseInt(data.startTime.split(":")[0])),
                    };
                    const res = await fetch(`/Api/registration/${data.registrationId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(updateBody),
                    });
                    const result = await res.json();

                    // Also update the linked class time if it exists
                    if (matchingReg?.classId) {
                      const tutor = tutors.find(t => t._id === selectedTutor);
                      const tz = tutor?.timezone || userTimezone;
                      await fetch(`/Api/classes?classId=${matchingReg.classId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: slotClasses.length > 0 ? slotClasses[0].title : "Free Trial",
                          description: slotClasses.length > 0 ? (slotClasses[0].description || "") : "",
                          date: effectiveDate,
                          startTime: data.startTime,
                          endTime: data.endTime,
                          timezone: tz,
                          updateIntent: "edit",
                        }),
                      });
                    }
                    if (!result.success) throw new Error(result.message);
                  } else {
                    // No existing registration — create new via bookTrial
                    const res = await fetch("/Api/public/bookTrial", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: data.name,
                        phone: data.contactNumber,
                        email: data.email || "",
                        pname: data.participantName,
                        age: data.age ? parseInt(data.age) : null,
                        notes: data.notes,
                        consent: true,
                        society: { name: data.societyName || "", city: data.city || "" },
                        hobby: { name: data.instrument },
                        tutorId: selectedTutor,
                        date: new Date(`${effectiveDate}T${data.startTime}:00`).toISOString(),
                        slotTime: formatH(hour),
                        duration: data.duration,
                        address: data.address,
                        payment: { amount: parseInt(data.paymentAmount) || 0, status: "Done" },
                      }),
                    });
                    const result = await res.json();
                    if (!result.success) throw new Error(result.message);
                  }
                  await fetchClasses(selectedTutor);
                  await fetchSelectedTutorData(selectedTutor);
                  toast.success("Booking saved with payment!");

                } else if (data.status === "edit") {
                  // Edit existing registration via PUT /Api/registration/[id]
                  if (!data.registrationId) throw new Error("No registration to edit");
                  const updateBody: any = {
                    name: data.name,
                    participantName: data.participantName,
                    contactNumber: data.contactNumber,
                    email: data.email,
                    age: data.age ? parseInt(data.age) : null,
                    instrument: data.instrument,
                    city: data.city,
                    societyName: data.societyName,
                    notes: data.notes,
                    address: data.address,
                  };
                  if (data.paymentAmount) {
                    updateBody.payment = { amount: parseInt(data.paymentAmount), status: "Done" };
                  }
                  // Update demoDate and demoTime on the registration
                  updateBody.demoDate = new Date(`${effectiveDate}T${data.startTime}:00`).toISOString();
                  updateBody.demoTime = formatH(parseInt(data.startTime.split(":")[0]));

                  const res = await fetch(`/Api/registration/${data.registrationId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateBody),
                  });
                  const result = await res.json();
                  if (!result.success) throw new Error(result.message);

                  // Also update the linked class time if it exists
                  if (matchingReg?.classId) {
                    const tutor = tutors.find(t => t._id === selectedTutor);
                    const tz = tutor?.timezone || userTimezone;
                    await fetch(`/Api/classes?classId=${matchingReg.classId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: slotClasses.length > 0 ? slotClasses[0].title : "Free Trial",
                        description: slotClasses.length > 0 ? (slotClasses[0].description || "Free Trial") : "Free Trial",
                        date: effectiveDate,
                        startTime: data.startTime,
                        endTime: data.endTime,
                        timezone: tz,
                        updateIntent: "edit",
                      }),
                    });
                  }

                  // Also update the demo slot time if it changed
                  const existingSlotId2 = slotKeyToIdMap.get(key);
                  if (existingSlotId2) {
                    const startISO = new Date(`${effectiveDate}T${data.startTime}:00`).toISOString();
                    const endISO = new Date(`${effectiveDate}T${data.endTime}:00`).toISOString();
                    await fetch("/Api/salesHead/demoSlots", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        tutorId: selectedTutor,
                        slotId: existingSlotId2,
                        startTime: startISO,
                        endTime: endISO,
                      }),
                    });
                  }

                  await fetchClasses(selectedTutor);
                  await fetchSelectedTutorData(selectedTutor);
                  toast.success("Registration updated successfully!");
                }

                setEditSlotInfo(null);
              } catch (err: any) {
                console.error("EditSlot save error:", err);
                toast.error(err.message || "Failed to save");
              } finally {
                setSaving(false);
              }
            }}
          />
        );
      })()}

      {/* Batch society selection for multi-slot open */}
      {showBatchSocModal && (() => {
        const tutorSocieties: Society[] = curTutor?.societies || [];
        return (
          <SocietyModal
            societies={tutorSocieties}
            selectedSocietyIds={batchSocIds}
            saving={saving}
            slotCount={pendingOpenSlots.size}
            onToggleSociety={(id) => setBatchSocIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            onConfirm={async () => {
              if (batchSocIds.length === 0 && pendingOpenSlots.size > 0) {
                toast.error("Please select at least one society");
                return;
              }
              setSaving(true);
              try {
                // Build slots array from pending
                const slotsArr = Array.from(pendingOpenSlots.values()).map(s => ({
                  startTime: new Date(`${s.date}T${s.startTime}:00`).toISOString(),
                  endTime: new Date(`${s.date}T${s.endTime}:00`).toISOString(),
                }));

                const res = await fetch("/Api/salesHead/demoSlots", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tutorId: selectedTutor,
                    slots: slotsArr,
                    societyIds: batchSocIds,
                  }),
                });
                const result = await res.json();
                if (!result.success) throw new Error(result.message);

                // Mark all pending as available locally — single batch update
                const socNames = batchSocIds
                  .map(id => curSocieties.find(sc => sc._id === id)?.name)
                  .filter(Boolean) as string[];

                setSlots(prev => {
                  const next = new Map(prev);
                  pendingOpenSlots.forEach((s, key) => {
                    next.set(key, "available");
                  });
                  return next;
                });

                setSlotSocietyMap(prev => {
                  const next = new Map(prev);
                  pendingOpenSlots.forEach((_s, key) => {
                    next.set(key, socNames);
                  });
                  return next;
                });

                // Clear batch
                setPendingOpenSlots(new Map());
                setSelectedSlots(new Set());
                setShowBatchSocModal(false);
                toast.success(`${slotsArr.length} slots opened successfully!`);
              } catch (err: any) {
                console.error("Batch save error:", err);
                toast.error(err.message || "Failed to save slots");
              } finally {
                setSaving(false);
              }
            }}
            onClose={() => setShowBatchSocModal(false)}
          />
        );
      })()}

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
};

const TutorAvailabilitySlotsWrapper = () => (
  <Suspense fallback={
    <div className="slot-page" style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 48, height: 48, border: "3px solid #5C16C5", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  }>
    <TutorAvailabilitySlots />
  </Suspense>
);

export default TutorAvailabilitySlotsWrapper;
