"use client";
import React, { useState, useMemo , useEffect} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClassItem {
  _id: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface AssignmentHistory {
  date: Date;
  message: string;
  classIds:string[];
}

interface CreditEntry {
  courseId: string;
  credits: number;
  startTime?: AssignmentHistory[]; // ← Updated type
}

interface GroupedSlot {
  timeSlot: string;
  classes: ClassItem[];
  groupKey: string;
}

interface DayGroup {
  day: string;
  timeSlots: GroupedSlot[];
}

// Per-slot selection state
interface SlotSelection {
  mode: "all" | "count"; // "all" = select all, "count" = pick N nearest
  count: number; // used when mode === "count"
  manualOverrides: Record<string, boolean>; // classId → selected/deselected
}

export interface AssignPayload {
  classIds: string[];
  startDate: string;
  message: string;
  credits: number;
    isEdit?: boolean; // ← new
    classType?: 'makeup' | 'regularClass';

}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: AssignPayload) => void;
  classes: ClassItem[];
  loading: boolean;
  courseId: string | null;
  creditsPerCourse: CreditEntry[];
  simpleMode?: boolean;
   hideWarnings?: boolean;
 showClassType?: boolean;

}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];



function groupClasses(classList: ClassItem[]): DayGroup[] {
  const dayMap: Record<string, Record<string, ClassItem[]>> = {};

  classList.forEach((cls) => {
    const start = new Date(cls.startTime);
    const end = new Date(cls.endTime);
    const day = DAY_ORDER[start.getDay()];
    const timeSlot = `${start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    if (!dayMap[day]) dayMap[day] = {};
    if (!dayMap[day][timeSlot]) dayMap[day][timeSlot] = [];
    dayMap[day][timeSlot].push(cls);
  });

  return DAY_ORDER.filter((day) => dayMap[day]).map((day) => ({
    day,
    timeSlots: Object.entries(dayMap[day]).map(([timeSlot, classes]) => ({
      timeSlot,
      // Sort classes by startTime ascending (nearest first)
      classes: [...classes].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
      groupKey: `${day}__${timeSlot}`,
    })),
  }));
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "canceled":
      return "bg-red-500";
    case "rescheduled":
      return "bg-orange-500";
    default:
      return "bg-blue-500";
  }
}
function CountInput({
  initial,
  max,
  onCommit,
}: {
  initial: number;
  max: number;
  onCommit: (val: number) => void;
}) {
  const [raw, setRaw] = useState(String(initial));

  // Sync if parent resets (e.g. mode switch)
  useEffect(() => {
    setRaw(String(initial));
  }, [initial]);

  const commit = (str: string) => {
    const parsed = parseInt(str, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      const clamped = Math.min(parsed, max);
      setRaw(String(clamped));
      onCommit(clamped);
    } else {
      // revert to last valid
      setRaw(String(initial));
    }
  };



  return (
    <input
      type="number"
      min={1}
      max={max}
      value={raw}
      onChange={(e) => {
        e.stopPropagation();
        setRaw(e.target.value); // just track the raw string, don't commit yet
      }}
      onBlur={(e) => {
        e.stopPropagation();
        commit(e.target.value);
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-16 px-2 py-1 text-xs border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
    />
  );
}
// ─── Component ────────────────────────────────────────────────────────────────

export default function ClassSelectionModal({
  open,
  onClose,
  onConfirm,
  classes,
  loading,
  courseId,
  creditsPerCourse,
  simpleMode = false,
  hideWarnings = false,
   showClassType = false,
}: Props) {
  // Extra fields
  const [startDate, setStartDate] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [credits, setCredits] = useState<string>("");  // ← add this
  const [editingEntry, setEditingEntry] = useState<AssignmentHistory | null>(null);
const [classType, setClassType] = useState<'makeup' | 'regularClass'>('regularClass');

  

  // Per-slot selection: groupKey → SlotSelection
  const [slotSelections, setSlotSelections] = useState<
    Record<string, SlotSelection>
  >({});

  // ✅ ADD THIS: Toggle between form and history
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  // Which slots are "active" (the outer group checkbox)
  const [activeSlots, setActiveSlots] = useState<Set<string>>(new Set());

const filteredByStartDate = useMemo(() => {
  if (!startDate) return classes;
  const start = new Date(startDate);
   start.setHours(0, 0, 0, 0); // ✅ ensure start of day
  return classes.filter((cls) => new Date(cls.startTime) >= start);
}, [classes, startDate]);

const grouped = useMemo(() => groupClasses(filteredByStartDate), [filteredByStartDate]);
  // Credits remaining for this course
  const creditsRemaining = useMemo(() => {
    if (!courseId) return null;
    const entry = creditsPerCourse.find((c) => c.courseId === courseId);
    return entry ? entry.credits : null;
  }, [courseId, creditsPerCourse]);

// ✅ ADD THIS: Extract assignment history for current course
const assignmentHistory = useMemo(() => {
  if (!courseId) return [];
  const entry = creditsPerCourse.find((c) => c.courseId === courseId);
  return entry?.startTime || [];
}, [courseId, creditsPerCourse]);

const getEndDateForAssignment = (entry: AssignmentHistory): string => {
  const entryClassIds = (entry.classIds || []).map((id: string) => id.toString());
  
  if (entryClassIds.length === 0) return "N/A";

  const entryClasses = classes.filter((cls) =>
    entryClassIds.includes(cls._id.toString())
  );

  if (entryClasses.length === 0) return "N/A";

  const lastClass = entryClasses.reduce((latest, cls) => {
    return new Date(cls.startTime) > new Date(latest.startTime) ? cls : latest;
  });

  return new Date(lastClass.startTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ── Reset when modal opens/closes ──────────────────────────────────────────
React.useEffect(() => {
  if (!open) {
    setSlotSelections({});
    setActiveSlots(new Set());
    setStartDate("");
    setMessage("");
    setCredits("");
    setActiveTab("form");
    setEditingEntry(null);
    setClassType('regularClass');
  }
}, [open]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getSlotSelection = (groupKey: string): SlotSelection =>
    slotSelections[groupKey] ?? { mode: "all", count: 1, manualOverrides: {} };




// Add this useMemo near the other useMemos
// ✅ STEP 1: This must be ABOVE allSelectedClassIds
const alreadyAssignedClassIds = useMemo(() => {
  const usedIds = new Set<string>();
  assignmentHistory.forEach((entry) => {
    // ✅ No skip — block ALL already-assigned classes even in edit mode
    (entry.classIds || []).forEach((id: string) => usedIds.add(id.toString()));
  });
  return usedIds;
}, [assignmentHistory]);

// ✅ STEP 2: Now allSelectedClassIds can use alreadyAssignedClassIds
const allSelectedClassIds = useMemo(() => {
  const effectiveIdsForSlot = (slot: GroupedSlot): string[] => {
    if (!activeSlots.has(slot.groupKey)) return [];
    const sel = slotSelections[slot.groupKey] ?? { mode: "all", count: 1, manualOverrides: {} };
    const { mode, count, manualOverrides } = sel;

    const baseSelected = new Set<string>(
      mode === "all"
        ? slot.classes.map((c) => c._id)
        : slot.classes.slice(0, count).map((c) => c._id)
    );

    Object.entries(manualOverrides).forEach(([id, on]) => {
      if (on) baseSelected.add(id);
      else baseSelected.delete(id);
    });

    // ✅ Exclude already-assigned classes so they don't count
    alreadyAssignedClassIds.forEach((id) => baseSelected.delete(id));

    return [...baseSelected];
  };

  return grouped.flatMap((dg) => dg.timeSlots).flatMap(effectiveIdsForSlot);
}, [grouped, activeSlots, slotSelections, alreadyAssignedClassIds]);


const totalAvailableCredits = useMemo(() => {
  const newCredits = parseInt(credits, 10) || 0;
  if (editingEntry) {
    return newCredits; // ✅ edit mode: only new input credits
  }
  return (creditsRemaining || 0) + newCredits; // normal: existing + new
}, [creditsRemaining, credits, editingEntry]);

// ✅ ADD THIS: Check if credit limit exceeded
const isCreditsMatched = useMemo(() => {
  return allSelectedClassIds.length === totalAvailableCredits;
}, [allSelectedClassIds.length, totalAvailableCredits]);

// ✅ UPDATED: Full flexibility in simpleMode
const isValidSelection = useMemo(() => {
  if (simpleMode) {
    // Simple mode: FULL FLEXIBILITY - always valid
    return true;
  } else {
    // Normal mode: strict - must match exactly
    return allSelectedClassIds.length === totalAvailableCredits;
  }
}, [simpleMode, allSelectedClassIds.length, totalAvailableCredits]);

const creditsDifference = useMemo(() => {
  if (simpleMode) {
    // Simple mode: no validation needed
    return 0;
  } else {
    // Normal mode: check difference from exact match
    return totalAvailableCredits - allSelectedClassIds.length;
  }
}, [simpleMode, totalAvailableCredits, allSelectedClassIds.length]);



  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleSlotActive = (groupKey: string) => {
    setActiveSlots((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

const updateSlotMode = (groupKey: string, mode: "all" | "count") => {
  setSlotSelections((prev) => {
    const existing = prev[groupKey] ?? { mode: "all", count: 1, manualOverrides: {} };
    return {
      ...prev,
      [groupKey]: {
        ...existing,
        mode,
        count: mode === "count" ? 1 : existing.count,
        // DON'T clear manualOverrides - keep user's selections
        manualOverrides: existing.manualOverrides,
      },
    };
  });
};

// AFTER
const updateSlotCount = (groupKey: string, count: number) => {
  setSlotSelections((prev) => {
    const existing = prev[groupKey] ?? { mode: "count", count: 1, manualOverrides: {} };
    return {
      ...prev,
      [groupKey]: {
        ...existing,
        mode: "count",
        count,
        // DON'T clear manualOverrides - keep user's selections
        manualOverrides: existing.manualOverrides,
      },
    };
  });
};

const toggleClassOverride = (
  groupKey: string,
  classId: string,
  currentlySelected: boolean
) => {
  setSlotSelections((prev) => {
    const existing = getSlotSelection(groupKey);
    const overrides = { ...existing.manualOverrides };
    
    // Simply toggle the override - if currently selected, deselect it; if not, select it
    if (currentlySelected) {
      // Class is selected, so we want to deselect it
      overrides[classId] = false;
    } else {
      // Class is not selected, so we want to select it
      overrides[classId] = true;
    }
    
    return {
      ...prev,
      [groupKey]: { ...existing, manualOverrides: overrides },
    };
  });
};
 const handleConfirm = () => {
  onConfirm({
    classIds: allSelectedClassIds,
    startDate,
    message,
    credits: parseInt(credits, 10) || 0,
    isEdit: !!editingEntry,
    classType: showClassType ? classType : undefined,
  });
};

  if (!open) return null;


  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Select Classes to Assign
            </h2>
            {creditsRemaining !== null && (
              <p className="text-xs text-purple-600 mt-0.5 font-medium">
                Credits remaining for this course:{" "}
                <span className="font-bold">{creditsRemaining}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* ✅ ADD THIS: Tab Toggle Buttons */}
        {assignmentHistory.length > 0 && (
          <div className="px-6 pt-4 pb-0 border-b border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("form")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === "form"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                📝 Assign Classes
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === "history"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                📚 History ({assignmentHistory.length})
              </button>
            </div>
          </div>
        )}

        {/* ✅ MODIFIED: History Section - Only show when activeTab === "history" */}
        {assignmentHistory.length > 0 && activeTab === "history" && (
          <div className="px-6 py-4 flex-1 overflow-y-auto bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="space-y-3">
              {assignmentHistory.map((entry, idx) => {
                const startDate = new Date(entry.date);
const endDate = getEndDateForAssignment(entry);                
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Assignment number badge - moved to top */}
                        <div className="flex items-center gap-2 mb-2">
<span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-purple-600 bg-purple-100 rounded-full">
  Entry #{[...assignmentHistory]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .findIndex((e) => e.date === entry.date) + 1}
</span>
                          <span className="text-xs text-gray-400">
                            {startDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        
                        {/* Message */}
                        {entry.message && (
                          <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded border-l-2 border-purple-400">
                            💬 {entry.message}
                          </p>
                        )}
                        
                        {/* Dates */}
                        <div className="flex items-center gap-4 text-xs bg-white p-2 rounded border border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-purple-600">Start:</span>
                            <span className="text-gray-700">
                              {startDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <span className="text-gray-300">→</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-indigo-600">End:</span>
                            <span className="text-gray-700">{endDate}</span>
                          </div>
                        </div>

                        {/* Check if last class end is after now */}
{new Date(getEndDateForAssignment(entry)) > new Date() && (  <button
    onClick={() => {
      setEditingEntry(entry);
      setStartDate(new Date(entry.date).toISOString().split("T")[0]);
      setActiveTab("form");
    }}
    className="mt-2 text-xs text-purple-600 border border-purple-300 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-colors"
  >
    ✏️ Edit
  </button>
)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {(assignmentHistory.length === 0 || activeTab === "form") && (
          <>
          {/* Add this right before the <div className="px-6 pt-4 pb-2 border-b ... grid ..."> */}
{editingEntry && (
  <div className="px-6 pt-3 pb-0">
    <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-2.5 mb-3">
      <div className="flex items-center gap-2 text-sm text-purple-700 font-medium">
        ✏️ Editing Entry/Pacjage from{" "}
        {new Date(editingEntry.date).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          setEditingEntry(null);
          setStartDate("");
        }}
        className="text-xs text-purple-500 hover:text-purple-700 underline"
      >
        Cancel edit
      </button>
    </div>
  </div>
)}
     {/* ── Extra Fields ── */}
{!simpleMode && (
  <div className="px-6 py-2 border-b border-gray-100 flex flex-wrap items-end gap-3">
    
    {/* Start Date */}
    <div className="flex flex-col gap-0.5">
      <label className="text-xs font-semibold text-gray-500">
        Start Date <span className="text-red-400">*</span>
      </label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => { if (!editingEntry) setStartDate(e.target.value); }}
        readOnly={!!editingEntry}
        className={`px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 ${
          editingEntry ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
        }`}
      />
    </div>

    {/* Credits */}
    <div className="flex flex-col gap-0.5">
      <label className="text-xs font-semibold text-gray-500">Credits</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={1}
          placeholder="Credits..."
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          className={`w-24 px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
            !isValidSelection && allSelectedClassIds.length > 0
              ? "border-red-300 focus:ring-red-400"
              : "border-gray-200 focus:ring-purple-400"
          }`}
        />
{credits && (
  <p className="text-xs text-gray-500 mt-1">
    {editingEntry ? (
      <>
        Validating against{" "}
        <span className="font-semibold text-purple-600">
          {parseInt(credits, 10) || 0} new credits
        </span>
        {creditsRemaining !== null && (
          <span className="text-gray-400 ml-1">
            ({creditsRemaining} existing for reference)
          </span>
        )}
      </>
    ) : (
      <>
        Total: {creditsRemaining || 0} + {parseInt(credits, 10) || 0} ={" "}
        <span className="font-semibold text-purple-600">
          {totalAvailableCredits} credits
        </span>
      </>
    )}
  </p>
)}
      </div>
    </div>

    {/* Message */}
    <div className="flex flex-col gap-0.5 flex-1 min-w-[160px]">
      <label className="text-xs font-semibold text-gray-500">Message (optional)</label>
      <input
        type="text"
        placeholder="Add a note..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
      />
    </div>

  </div>
)}

{showClassType && (
  <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-4">
    <span className="text-xs font-semibold text-gray-500">Class Type:</span>
    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
      <input
        type="radio"
        name="classType"
        value="regularClass"
        checked={classType === 'regularClass'}
        onChange={() => setClassType('regularClass')}
        className="accent-purple-600"
      />
      <span className="text-gray-700">Regular Class</span>
    </label>
    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
      <input
        type="radio"
        name="classType"
        value="makeup"
        checked={classType === 'makeup'}
        onChange={() => setClassType('makeup')}
        className="accent-purple-600"
      />
      <span className="text-gray-700">Makeup Class</span>
    </label>
  </div>
)}

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mb-3" />
              <p className="text-gray-500 text-sm">Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">
                No upcoming classes found for this course.
              </p>
            </div>
          ) : (
            grouped.map((dayGroup) => (
              <div key={dayGroup.day} className="mb-6">
                {/* Day Header */}
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-100 rounded px-3 py-1.5 mb-3">
                  {dayGroup.day}
                </div>

                <div className="flex flex-col gap-3">
                  {dayGroup.timeSlots.map((slot) => {
                    const isActive = activeSlots.has(slot.groupKey);
                    const sel = getSlotSelection(slot.groupKey);
const effectiveIds = (() => {
  if (!isActive) return new Set<string>();
  const { mode, count, manualOverrides } = sel;
  const base = new Set<string>(
    mode === "all"
      ? slot.classes.map((c) => c._id)
      : slot.classes.slice(0, count).map((c) => c._id)
  );
  Object.entries(manualOverrides).forEach(([id, on]) => {
    if (on) base.add(id);
    else base.delete(id);
  });
  return base;
})();
                    return (
                      <div
                        key={slot.groupKey}
                        className={`rounded-xl border transition-all duration-150 ${
                          isActive
                            ? "border-purple-400 bg-purple-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        {/* ── Slot header row ── */}
                        <div
                          className="flex items-center justify-between px-4 py-3 cursor-pointer"
                          onClick={() => toggleSlotActive(slot.groupKey)}
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox */}
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                                isActive
                                  ? "bg-purple-600 border-purple-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {isActive && (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                >
                                  <path
                                    d="M2 6L5 9L10 3"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {slot.timeSlot}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {slot.classes.length} session
                            {slot.classes.length !== 1 ? "s" : ""}
                            {isActive && (
                              <span className="ml-2 text-purple-600 font-semibold">
                                ({effectiveIds.size} selected)
                              </span>
                            )}
                          </span>
                        </div>

                        {/* ── Expanded controls when active ── */}
                        {isActive && (
                          <div className="px-4 pb-4 border-t border-purple-100 pt-3">
                            {/* Mode selector */}
                            <div className="flex items-center gap-4 mb-3">
                              <span className="text-xs text-gray-500 font-semibold">
                                Classes to include:
                              </span>
                              {/* All */}
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                                <input
                                  type="radio"
                                  name={`mode-${slot.groupKey}`}
                                  checked={sel.mode === "all"}
                                  onChange={() =>
                                    updateSlotMode(slot.groupKey, "all")
                                  }
                                  className="accent-purple-600"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-gray-700">All ({slot.classes.length})</span>
                              </label>

                              {/* Count */}
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                                <input
                                  type="radio"
                                  name={`mode-${slot.groupKey}`}
                                  checked={sel.mode === "count"}
                                  onChange={() =>
                                    updateSlotMode(slot.groupKey, "count")
                                  }
                                  className="accent-purple-600"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-gray-700">Nearest</span>
                              </label>

                              {sel.mode === "count" && (
  <CountInput
    key={slot.groupKey}
    initial={sel.count}
    max={slot.classes.length}
    onCommit={(val) => updateSlotCount(slot.groupKey, val)}
  />
)}
                              
                            </div>

                            {/* After the mode selector div, add this: */}
{Object.keys(sel.manualOverrides).length > 0 && (
  <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
    <span className="text-xs text-purple-700">
      You have {Object.keys(sel.manualOverrides).length} manual override(s)
    </span>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setSlotSelections((prev) => ({
          ...prev,
          [slot.groupKey]: {
            ...sel,
            manualOverrides: {},
          },
        }));
      }}
      className="text-xs text-purple-600 hover:text-purple-800 underline"
    >
      Clear all overrides
    </button>
  </div>
)}

                            {/* Individual class pills — allow manual override */}
                            <div className="flex flex-wrap gap-2">
{slot.classes.map((cls, idx) => {
  const isSelected = effectiveIds.has(cls._id);
  const isAlreadyAssigned = alreadyAssignedClassIds.has(cls._id); // ✅
  const date = new Date(cls.startTime);
  const label = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <button
      key={cls._id}
      type="button"
      title={isAlreadyAssigned ? "Already assigned in another entry" : `${label} — ${cls.status}`}
      disabled={isAlreadyAssigned} // ✅ completely unclickable
      onClick={(e) => {
        e.stopPropagation();
        if (!isAlreadyAssigned) {
          toggleClassOverride(slot.groupKey, cls._id, isSelected);
        }
      }}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
        isAlreadyAssigned
          ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-50" // ✅ greyed out
          : isSelected
          ? "bg-purple-600 text-white border-purple-600"
          : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
      }`}
    >
      {sel.mode === "count" && idx < sel.count && (
        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-purple-200" : "bg-gray-300"}`} />
      )}
      {label}
      <span className={`w-1.5 h-1.5 rounded-full ml-0.5 ${getStatusColor(cls.status)}`} />
    </button>
  );
})}
                            </div>

                            <p className="text-xs text-gray-400 mt-2">
                              Click any date pill to manually include / exclude it.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

{/* ✅ UPDATED: Only show warnings in normal mode */}
       {!hideWarnings && !simpleMode && !isValidSelection && allSelectedClassIds.length > 0 && (
  <div className={`px-6 py-1.5 border-t text-xs font-medium flex items-center gap-2 ${
    creditsDifference > 0
      ? 'bg-orange-50 border-orange-200 text-orange-700'
      : 'bg-red-50 border-red-200 text-red-700'
  }`}>
    ⚠️ {creditsDifference > 0
      ? `Need ${creditsDifference} more class${creditsDifference !== 1 ? 'es' : ''}`
      : `${Math.abs(creditsDifference)} too many selected`}
  </div>
)}
   


        {/* ✅ NEW: Success Banner when matched */}
      {isCreditsMatched && allSelectedClassIds.length > 0 && (
  <div className="px-6 py-1.5 bg-green-50 border-t border-green-200 text-xs font-medium text-green-700 flex items-center gap-2">
    ✅ Perfect match — {allSelectedClassIds.length} classes for {totalAvailableCredits} credits
  </div>
)}
        </>
        )}

        

{/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {/* ✅ UPDATED: Different display based on simpleMode */}
            {simpleMode ? (
              /* Simple Mode: Just show count - no validation */
              <>
                <span className="font-semibold text-purple-700">
                  {allSelectedClassIds.length}
                </span>{" "}
                class
                {allSelectedClassIds.length !== 1 ? "es" : ""} selected
              </>
            ) : (
              /* Normal Mode: Show exact match status */
              <>
                <span className={`font-semibold ${
                  isValidSelection && allSelectedClassIds.length > 0
                    ? 'text-green-600'
                    : allSelectedClassIds.length > 0
                    ? 'text-orange-600'
                    : 'text-purple-700'
                }`}>
                  {allSelectedClassIds.length}
                </span>
                <span className="text-gray-600">
                  /{totalAvailableCredits}
                </span>{" "}
                class
                {allSelectedClassIds.length !== 1 ? "es" : ""} selected
                
                {allSelectedClassIds.length > 0 && totalAvailableCredits > 0 && (
                  <span className="ml-3 text-xs">
                    {isValidSelection ? (
                      <span className="text-green-600 font-semibold">✓ Perfect Match</span>
                    ) : creditsDifference > 0 ? (
                      <span className="text-orange-600 font-semibold">
                        Need {creditsDifference} more
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        {Math.abs(creditsDifference)} too many
                      </span>
                    )}
                  </span>
                )}
                
               {creditsRemaining !== null && (
  <span className="ml-3 text-xs text-gray-400">
    {editingEntry
      ? `(${creditsRemaining} existing — not counted)` // ✅ reference only
      : `(${creditsRemaining} existing + ${parseInt(credits, 10) || 0} new)`
    }
  </span>
)}
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                allSelectedClassIds.length === 0 || 
                (!simpleMode && !startDate) || 
                (!hideWarnings && !isValidSelection) // ✅ In simpleMode this is always true
              }
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm & Add ({allSelectedClassIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
    