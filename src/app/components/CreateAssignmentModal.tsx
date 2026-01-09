"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Calendar,
  Music,
  BookOpen,
  Users,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Course {
  _id: string;
  title: string;
  category?: string;
}

interface Student {
  _id: string;
  username: string;
  email: string;
}

interface Class {
  _id: string;
  title: string;
  description?: string;
}

interface Song {
  _id: string;
  title: string;
  artist?: string;
  genre?: string;
  difficulty?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  fileUrl?: string;
  fileName?: string;
  songName?: string;
  practiceStudio?: boolean;
  speed?: string;
  metronome?: string;
  loop?: string;
  course: {
    _id: string;
    title: string;
  };
  class: {
    _id: string;
    title: string;
  };
  userId?: string[];
}

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  courses: Course[];
  classes: Class[];
  editingAssignment?: Assignment | null;
}

type ExtraAssignment = {
  title: string;
  description: string;
  deadline: string;
  course: string;
  class: string;
  selectedStudents: string[];
  songName?: string;
  customSongName?: string;
  assignmentFile?: File | null;
  // per-extra lists so UI for extra matches main assignment
  courseClasses?: Class[];
  availableStudents?: Student[];
};

export default function CreateAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  courses,
  classes,
  editingAssignment,
}: CreateAssignmentModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem("assignmentDefaults")
          : null;
      const defaults = saved ? JSON.parse(saved) : {};
      return {
        title: "",
        deadline: "",
        description: "",
        songName: "",
        customSongName: "",
        course: defaults.course || "",
        class: defaults.class || "",
        speed: defaults.speed || "100%",
        metronome: defaults.metronome || "100%",
        loop: defaults.loop || "Set A",
      };
    } catch {
      return {
        title: "",
        deadline: "",
        description: "",
        songName: "",
        customSongName: "",
        course: "",
        class: "",
        speed: "100%",
        metronome: "100%",
        loop: "Set A",
      };
    }
  });

  const [extraAssignments, setExtraAssignments] = useState<ExtraAssignment[]>(
    []
  );

  const [musicSheet, setMusicSheet] = useState<File | null>(null);
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [practiceStudio, setPracticeStudio] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [coursesOptions, setCoursesOptions] = useState<Course[]>([]);
  const [classesOptions, setClassesOptions] = useState<Class[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [songSearchResults, setSongSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSongResults, setShowSongResults] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const songInputRef = useRef<HTMLDivElement>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const initialSnapshotRef = useRef<any>(null);

  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  };

  const isAssignmentChanged = () => {
    if (!editingAssignment) return true;
    const init = initialSnapshotRef.current;
    if (!init) return false;

    const f = formData;
    const keys = [
      "title",
      "description",
      "deadline",
      "songName",
      "customSongName",
      "course",
      "class",
      "speed",
      "metronome",
      "loop",
    ];
    for (const k of keys) {
      if ((f as any)[k] !== init.formData[k]) return true;
    }

    if (practiceStudio !== init.practiceStudio) return true;

    const currStudents = [...selectedStudents].sort();
    const initStudents = [...(init.selectedStudents || [])].sort();
    if (!arraysEqual(currStudents, initStudents)) return true;

    if (assignmentFile || musicSheet) return true;

    return false;
  };

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const init = async () => {
      if (editingAssignment) {
        const deadlineDate = new Date(editingAssignment.deadline);
        const formattedDeadline = isNaN(deadlineDate.getTime())
          ? ""
          : deadlineDate.toISOString().split("T")[0];

        setFormData((prev) => ({
          ...prev,
          title: editingAssignment.title || "",
          deadline: formattedDeadline,
          description: editingAssignment.description || "",
          songName: editingAssignment.songName || "",
          customSongName: "",
          course: editingAssignment.course?._id || prev.course || "",
          speed: editingAssignment.speed || prev.speed || "100%",
          metronome:
            editingAssignment.metronome || prev.metronome || "100%",
          loop: editingAssignment.loop || prev.loop || "Set A",
        }));

        setPracticeStudio(Boolean(editingAssignment.practiceStudio));

        if (editingAssignment.course?._id) {
          setCoursesOptions((prev) => {
            if (!prev.find((c) => c._id === editingAssignment.course._id)) {
              return [
                ...prev,
                {
                  _id: editingAssignment.course._id,
                  title: editingAssignment.course.title,
                },
              ];
            }
            return prev;
          });

          try {
            await fetchClassesAndStudents(editingAssignment.course._id);
            setFormData((prev) => ({
              ...prev,
              class: editingAssignment.class?._id || prev.class || "",
            }));
          } catch (e) {
            // ignore
          }
        }

        if (editingAssignment.userId && Array.isArray(editingAssignment.userId)) {
          setSelectedStudents(editingAssignment.userId);
        }

        initialSnapshotRef.current = {
          formData: {
            title: editingAssignment.title || "",
            deadline: formattedDeadline,
            description: editingAssignment.description || "",
            songName: editingAssignment.songName || "",
            customSongName: "",
            course: editingAssignment.course?._id || "",
            class: editingAssignment.class?._id || "",
            speed: editingAssignment.speed || "100%",
            metronome: editingAssignment.metronome || "100%",
            loop: editingAssignment.loop || "Set A",
          },
          practiceStudio: Boolean(editingAssignment.practiceStudio),
          selectedStudents: Array.isArray(editingAssignment.userId)
            ? [...editingAssignment.userId]
            : [],
        };

        // reset extras when editing existing assignment
        setExtraAssignments([]);
      } else {
        try {
          const saved =
            typeof window !== "undefined"
              ? localStorage.getItem("assignmentDefaults")
              : null;
          const defaults = saved ? JSON.parse(saved) : {};
          setFormData((prev) => ({
            ...prev,
            course: defaults.course || prev.course || "",
            class: defaults.class || prev.class || "",
            speed: defaults.speed || prev.speed || "100%",
            metronome:
              defaults.metronome || prev.metronome || "100%",
            loop: defaults.loop || prev.loop || "Set A",
          }));
          setPracticeStudio(Boolean(defaults.practiceStudio));
        } catch {
          //
        }
        setMusicSheet(null);
        setAssignmentFile(null);
        setSelectedStudents([]);
        setExtraAssignments([]);
      }
    };

    init();
  }, [editingAssignment, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
            title: "",
            deadline: "",
            description: "",
            songName: "",
            customSongName: "",
            course: "",
            class: "",
            speed: "100%",
            metronome: "100%",
            loop: "Set A",
          });
      fetchCourses()
    };
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await fetch("/Api/tutors/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCoursesOptions(data.course || data.result || []);
    } catch (err) {
      console.error("Fetch courses error:", err);
      setCoursesOptions([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (formData.course) {
      fetchClassesAndStudents(formData.course);
    } else {
      setClassesOptions([]);
      setStudents([]);
      setSelectedStudents([]);
    }
  }, [formData.course]);

  const fetchClassesAndStudents = async (courseId: string) => {
    try {
      setLoadingClasses(true);
      setLoadingStudents(true);
      const res = await fetch(`/Api/tutors/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch classes and students");
      const data = await res.json();
      setClassesOptions(data.classDetails || data.classes || []);
      setStudents(data.enrolledStudents || []);
    } catch (err) {
      console.error("Fetch classes and students error:", err);
      setClassesOptions([]);
      setStudents([]);
      setSelectedStudents([]);
    } finally {
      setLoadingClasses(false);
      setLoadingStudents(false);
    }
  };

  const fetchClassesAndStudentsForExtra = async (index: number, courseId: string) => {
    setExtraAssignments((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        course: courseId,
        class: "",
        courseClasses: [],
        availableStudents: [],
        selectedStudents: [],
      };
      return copy;
    });

    try {
      const res = await fetch(`/Api/tutors/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch classes and students for extra");
      const data = await res.json();
      setExtraAssignments((prev) => {
        const copy = [...prev];
        const slot = copy[index];
        if (!slot) return prev;
        slot.courseClasses = data.classDetails || data.classes || [];
        slot.availableStudents = data.enrolledStudents || [];
        slot.selectedStudents = [];
        copy[index] = slot;
        return copy;
      });
    } catch (err) {
      console.error("Fetch extra classes/students error:", err);
      setExtraAssignments((prev) => {
        const copy = [...prev];
        const slot = copy[index];
        if (!slot) return prev;
        slot.courseClasses = [];
        slot.availableStudents = [];
        slot.selectedStudents = [];
        copy[index] = slot;
        return copy;
      });
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAllStudents = () => {
    const allStudentIds = students.map((student) => student._id);
    setSelectedStudents(allStudentIds);
  };

  const handleClearAllStudents = () => {
    setSelectedStudents([]);
  };

  const addExtraAssignment = () => {
    setExtraAssignments((prev) => [
      ...prev,
      {
        title: formData.title || "",
        description: "",
        deadline: "",
        course: formData.course || "",
        class: formData.class || "",
        selectedStudents: [],
        songName: "",
        customSongName: "",
        assignmentFile: null,
        courseClasses: formData.course ? classesOptions : [],
        availableStudents: formData.course ? students : [],
      },
    ]);
  };

  const removeExtraAssignment = (index: number) => {
    setExtraAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExtraAssignmentField = (
    index: number,
    field: keyof ExtraAssignment,
    value: any
  ) => {
    setExtraAssignments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });

    // If course changed for extra, fetch its classes & students
    if (field === "course" && value) {
      fetchClassesAndStudentsForExtra(index, String(value));
    }
  };

  const toggleExtraStudent = (slotIndex: number, studentId: string) => {
    setExtraAssignments((prev) => {
      const copy = [...prev];
      const slot = copy[slotIndex];
      if (!slot) return prev;
      const setIds = new Set(slot.selectedStudents || []);
      if (setIds.has(studentId)) setIds.delete(studentId);
      else setIds.add(studentId);
      // create a new slot object to avoid mutating nested state
      const newSlot = { ...slot, selectedStudents: Array.from(setIds) };
      copy[slotIndex] = newSlot;
      return copy;
    });
  };

  const handleExtraSelectAll = (index: number) => {
    setExtraAssignments((prev) => {
      const copy = [...prev];
      const slot = copy[index];
      if (!slot) return prev;
      slot.selectedStudents = (slot.availableStudents || []).map((s) => s._id);
      const newSlot = { ...slot, selectedStudents: (slot.availableStudents || []).map((s) => s._id) };
      copy[index] = newSlot;
      return copy;
    });
  };

  const handleExtraClearAll = (index: number) => {
    setExtraAssignments((prev) => {
      const copy = [...prev];
      const slot = copy[index];
      if (!slot) return prev;
      slot.selectedStudents = [];
      const newSlot = { ...slot, selectedStudents: [] };
      copy[index] = newSlot;
      return copy;
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/Api/users/user");
        if (!res.ok) return;
        const data = await res.json();
        const id =
          data?.data?._id ||
          data?.user?._id ||
          data?.user?._id ||
          data?._id ||
          null;
        if (id) setCurrentUserId(id.toString());
      } catch (e) {
        console.warn("Failed to fetch current user id:", e);
      }
    };
    fetchCurrentUser();
  }, [isOpen]);

  useEffect(() => {
    const searchTerm = formData.songName.trim();
    if (searchTerm.length > 2 && !selectedSong) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      setIsSearching(true);
      setShowSongResults(true);
      searchTimeoutRef.current = setTimeout(() => searchSongs(searchTerm), 600);
    } else {
      setSongSearchResults([]);
      setShowSongResults(false);
      setIsSearching(false);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        setIsSearching(false);
      }
    };
  }, [formData.songName, selectedSong]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        songInputRef.current &&
        !songInputRef.current.contains(event.target as Node)
      ) {
        setShowSongResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchSongs = async (searchTerm: string) => {
    try {
      setIsSearching(true);
      const res = await fetch(
        `/Api/searchSong?q=${encodeURIComponent(searchTerm)}`
      );
      if (!res.ok) throw new Error("Failed to search songs");
      const data = await res.json();
      setSongSearchResults(data.songs || []);
      setShowSongResults(true);
    } catch (err) {
      console.error(err);
      setSongSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setFormData({
      ...formData,
      songName: `${song.title} - ${song.artist}`,
      customSongName: "",
    });
    setShowSongResults(false);
    setSongSearchResults([]);
  };

  const clearSongSelection = () => {
    setSelectedSong(null);
    setFormData({ ...formData, songName: "", customSongName: "" });
    setSongSearchResults([]);
    setShowSongResults(false);
  };

  const handleMusicSheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setMusicSheet(e.target.files[0]);
  };

  const handleAssignmentFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0])
      setAssignmentFile(e.target.files[0]);
  };

  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [searchTermGlobal, setSearchTermGlobal] = useState("");

  const handleSubmit = async () => {
  if (!formData.title.trim())
    return setError("Please enter an assignment title");
    if (!formData.course) return setError("Please select a course");
    if (!formData.class) return setError("Please select a class");
    if (selectedStudents.length === 0)
      return setError("Please select at least one student");

    // Validate per-student fields
    const missingDeadline = selectedStudents.filter(
      (id) => !perStudentFields[id]?.deadline
    );
    if (missingDeadline.length > 0)
      return setError("Please set a deadline for all selected students");

    const missingDescription = selectedStudents.filter(
      (id) => !(perStudentFields[id]?.description || "").trim()
    );
    if (missingDescription.length > 0)
      return setError("Please enter a description for all selected students");

    setIsSubmitting(true);
    setError(null);

    try {
      const isEditing = !!editingAssignment;

      if (isEditing) {
        // ...existing edit logic...
        // (no change needed for editing)
      } else {
        // Group students by assignment data
        type AssignmentKey = string;
        const groupMap: Record<AssignmentKey, { studentIds: string[], fields: any }> = {};

        for (const studentId of selectedStudents) {
          const fields = perStudentFields[studentId];
          // Create a key based on assignment data (excluding studentId)
          const key = JSON.stringify({
            deadline: fields.deadline,
            description: fields.description,
            assignmentFileName: fields.assignmentFile?.name || "",
          });
          if (!groupMap[key]) {
            groupMap[key] = { studentIds: [], fields };
          }
          groupMap[key].studentIds.push(studentId);
        }

        const createdIds: string[] = [];

        for (const key in groupMap) {
          const { studentIds, fields } = groupMap[key];
          const fd = new FormData();
          fd.append("title", formData.title);
          fd.append("description", fields.description);
          fd.append("deadline", new Date(fields.deadline).toISOString());
          fd.append("courseId", formData.course);
          fd.append("classId", formData.class);

          const idsForThis = Array.from(
            new Set([
              ...studentIds.map((id) => String(id)),
              ...(currentUserId ? [String(currentUserId)] : []),
            ])
          );
          fd.append("studentIds", JSON.stringify(idsForThis));

          const finalSongName = selectedSong
            ? `${selectedSong.title} - ${selectedSong.artist}`
            : formData.customSongName || formData.songName;
          if (finalSongName) fd.append("songName", finalSongName);

          fd.append("practiceStudio", practiceStudio ? "true" : "false");
          fd.append("speed", (formData as any).speed || "100%");
          fd.append("metronome", (formData as any).metronome || "100%");
          fd.append("loop", (formData as any).loop || "Set A");

          if (musicSheet) fd.append("musicSheet", musicSheet);
          if (fields.assignmentFile) fd.append("assignmentFile", fields.assignmentFile);

          const res = await fetch(
            `/Api/assignment?classId=${formData.class}&courseId=${formData.course}`,
            { method: "POST", body: fd }
          );
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.warn("Failed to create assignment for students:", studentIds, errData);
            continue;
          }
          const result = await res.json().catch(() => null);
          if (result?.success && result?.data?._id) {
            createdIds.push(String(result.data._id));
          }
        }

        // ...existing reset and navigation logic...
        const defaultsToSave = {
          course: formData.course,
          class: formData.class,
          practiceStudio: practiceStudio,
          speed: (formData as any).speed || "100%",
          metronome: (formData as any).metronome || "100%",
          loop: (formData as any).loop || "Set A",
        };
        localStorage.setItem("assignmentDefaults", JSON.stringify(defaultsToSave));

        setFormData({
          title: "",
          deadline: "",
          description: "",
          songName: "",
          customSongName: "",
          course: "",
          class: "",
          speed: "100%",
          metronome: "100%",
          loop: "Set A",
        });
        setMusicSheet(null);
        setAssignmentFile(null);
        setPracticeStudio(false);
        setSelectedSong(null);
        setExtraAssignments([]);
        if (onSuccess) onSuccess();
        onClose();

        /* if (createdIds[0]) {
          router.push(
            `/tutor/assignments/singleAssignment?assignmentId=${createdIds[0]}`
          );
        } */
        return;
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [commonFields, setCommonFields] = useState({
    deadline: "",
    description: "",
    assignmentFile: null as File | null,
  });

  const [perStudentFields, setPerStudentFields] = useState<{
    [studentId: string]: {
      deadline: string;
      description: string;
      assignmentFile: File | null;
      sameAsAbove?: boolean; // added
      useCommon?: boolean;   // legacy, unused now
    };
  }>(
    {}
  );

  // Helper: current selected students in visible order
  const getSelectedOrderedIds = () =>
    students.filter((s) => selectedStudents.includes(s._id)).map((s) => s._id);

  // Helper: enforce "same as above" chain across selected students
  const enforceSameAsAboveChain = (
    state: typeof perStudentFields
  ): typeof perStudentFields => {
    const ordered = getSelectedOrderedIds();
    const next = { ...state };
    for (let i = 0; i < ordered.length; i++) {
      const id = ordered[i];
      if (i > 0 && next[id]?.sameAsAbove) {
        const prevId = ordered[i - 1];
        const prev = next[prevId] || {
          deadline: "",
          description: "",
          assignmentFile: null,
        };
        next[id] = {
          ...next[id],
          deadline: prev.deadline,
          description: prev.description,
          assignmentFile: prev.assignmentFile,
        };
      }
    }
    return next;
  };

  const handleSameAsAboveToggle = (studentId: string, checked: boolean) => {
    setPerStudentFields((prev) => {
      const ordered = getSelectedOrderedIds();
      const idx = ordered.indexOf(studentId);
      if (idx <= 0) {
        // no previous student to copy from; force off
        return {
          ...prev,
          [studentId]: { ...prev[studentId], sameAsAbove: false },
        };
      }
      const prevId = ordered[idx - 1];
      const prevFields =
        prev[prevId] || ({ deadline: "", description: "", assignmentFile: null } as any);
      const next = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          sameAsAbove: checked,
          deadline: checked
            ? prevFields.deadline
            : prev[studentId]?.deadline || "",
          description: checked
            ? prevFields.description
            : prev[studentId]?.description || "",
          assignmentFile: checked
            ? prevFields.assignmentFile
            : prev[studentId]?.assignmentFile || null,
        },
      };
      return enforceSameAsAboveChain(next);
    });
  };

  const handlePerStudentFieldChange = (
    studentId: string,
    field: "deadline" | "description" | "assignmentFile",
    value: any
  ) => {
    setPerStudentFields((prev) => {
      const next = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [field]: value,
          sameAsAbove: false, // user typed -> break the link
        },
      };
      return enforceSameAsAboveChain(next);
    });
  };

  // When students change, ensure we keep state for selected ones and enforce chain
  useEffect(() => {
    setPerStudentFields((prev) => {
      const updated: typeof prev = {};
      selectedStudents.forEach((id) => {
        updated[id] =
          prev[id] || {
            deadline: "",
            description: "",
            assignmentFile: null,
            sameAsAbove: false,
          };
      });
      return enforceSameAsAboveChain(updated);
    });
  }, [selectedStudents]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 border-b border-purple-500">
          <button
            onClick={onClose}
            className="!absolute top-6 right-6 !p-2 !text-white/80 !hover:text-white !hover:bg-white/10 !rounded-lg !transition-all"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
          <h2 className="!text-3xl !font-bold !text-white !mb-2">
            {editingAssignment ? "Edit Assignment" : "Create New Assignment"}
          </h2>
          <p className="!text-purple-100 !text-sm">
            {editingAssignment
              ? "Update the details below to modify this assignment"
              : "Fill in the details below to create a new assignment for students"}
          </p>
        </div>

        {error && (
          <div className="!mx-8 !mt-4 !p-4 !bg-red-50 !border !border-red-200 !rounded-lg">
            <p className="!text-sm !text-red-600">{error}</p>
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(95vh-200px)] custom-scrollbar">
          <div className="p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assignment Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Midterm Project"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="!w-full !px-4 !py-3 !border !border-gray-300 !rounded-xl focus:!ring-2 focus:!ring-purple-500 focus:!border-transparent !transition-all !text-gray-900 !placeholder:text-gray-400"
                disabled={isSubmitting}
              />
            </div>

            {/* Course & Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="!text-sm !font-semibold !text-gray-700 !mb-2 !flex !items-center !gap-2">
                  <BookOpen size={16} className="text-purple-600" /> Select
                  Course *
                </label>
                <select
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                  className="!w-full !px-4 !py-3 !border !border-gray-300 !rounded-xl focus:!ring-2 focus:!ring-purple-500 focus:!border-transparent !transition-all !text-gray-900 !bg-white !appearance-none !cursor-pointer"
                  disabled={isSubmitting || loadingCourses}
                >
                  <option value="">
                    {loadingCourses ? "Loading courses..." : "Choose a course"}
                  </option>
                  {coursesOptions.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="!text-sm !font-semibold !text-gray-700 !mb-2 !flex !items-center !gap-2">
                  <Users size={16} className="text-purple-600" /> Select Class *
                </label>
                <select
                  value={formData.class}
                  onChange={(e) =>
                    setFormData({ ...formData, class: e.target.value })
                  }
                  className="!w-full !px-4 !py-3 !border !border-gray-300 !rounded-xl focus:!ring-2 focus:!ring-purple-500 focus:!border-transparent !transition-all !text-gray-900 !bg-white !appearance-none !cursor-pointer"
                  disabled={isSubmitting || loadingClasses || !formData.course}
                >
                  <option value="">
                    {loadingClasses ? "Loading classes..." : "Choose a class"}
                  </option>
                  {classesOptions.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students Selection */}
            {formData.course && (
              <div>
                <label className="!text-sm !font-semibold !text-gray-700 !mb-2 !flex !items-center !gap-2">
                  <UserCheck size={16} className="text-purple-600" /> Select
                  Students *
                </label>

                {loadingStudents ? (
                  <div className="!p-4 !text-center !border !border-gray-200 !rounded-xl">
                    <p className="!text-sm !text-gray-500">Loading students...</p>
                  </div>
                ) : students.length > 0 ? (
                  <div className="!border !border-gray-200 !rounded-xl !p-4">
                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-3 pb-3 border-b border-gray-200">
                      <button
                        type="button"
                        onClick={handleSelectAllStudents}
                        disabled={isSubmitting}
                        className="!px-4 !py-2 !text-sm !bg-purple-50 !text-purple-600 !rounded-lg hover:!bg-purple-100 !transition-all !font-medium disabled:!opacity-50"
                      >
                        Select All ({students.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllStudents}
                        disabled={isSubmitting}
                        className="!px-4 !py-2 !text-sm !bg-gray-50 !text-gray-600 !rounded-lg hover:!bg-gray-100 !transition-all !font-medium disabled:!opacity-50"
                      >
                        Clear All
                      </button>
                      <div className="ml-auto text-sm text-gray-600 flex items-center">
                        Selected:{" "}
                        <span className="font-semibold ml-1">
                          {selectedStudents.length}
                        </span>
                      </div>
                    </div>

                    {/* Students List with per-student fields */}
                    <div className="max-h-96 overflow-y-auto space-y-4">
                      {(() => {
                        const orderedSelectedIds = students
                          .filter((s) => selectedStudents.includes(s._id))
                          .map((s) => s._id);

                        return students.map((student, index) => {
                          const checked = selectedStudents.includes(student._id);
                          const fields = perStudentFields[student._id] || {
                            deadline: "",
                            description: "",
                            assignmentFile: null,
                            sameAsAbove: false,
                          };
                          const idxInOrdered = orderedSelectedIds.indexOf(student._id);
                          const isFirstSelected = idxInOrdered === 0;

                          return (
                            <div
                              key={student._id}
                              className="border-b last:border-b-0"
                            >
                              {/* Header row with checkbox, name, and same for all/above */}
                              <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                                <div className="flex items-center gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleStudentToggle(student._id)}
                                    disabled={isSubmitting}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                  />
                                  <div>
                                    <div className="font-medium text-gray-800">
                                      {student.username}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {student.email}
                                    </div>
                                  </div>
                                </div>

                                {checked && isFirstSelected && (
                                  <label className="flex items-center gap-2 text-sm font-medium text-purple-700 cursor-pointer whitespace-nowrap ml-4">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 accent-purple-600 rounded"
                                      checked={orderedSelectedIds.slice(1).every(id => perStudentFields[id]?.sameAsAbove)}
                                      onChange={(e) => {
                                        const shouldCheck = e.target.checked;
                                        setPerStudentFields((prev) => {
                                          const next = { ...prev };
                                          const firstFields = prev[orderedSelectedIds[0]] || {
                                            deadline: "",
                                            description: "",
                                            assignmentFile: null,
                                          };
                                          orderedSelectedIds.slice(1).forEach(id => {
                                            next[id] = {
                                              ...prev[id],
                                              sameAsAbove: shouldCheck,
                                              deadline: shouldCheck ? firstFields.deadline : prev[id]?.deadline || "",
                                              description: shouldCheck ? firstFields.description : prev[id]?.description || "",
                                              assignmentFile: shouldCheck ? firstFields.assignmentFile : prev[id]?.assignmentFile || null,
                                            };
                                          });
                                          return enforceSameAsAboveChain(next);
                                        });
                                      }}
                                    />
                                    Same for all
                                  </label>
                                )}

                                {checked && !isFirstSelected && (
                                  <label className="flex items-center gap-2 text-sm font-medium text-purple-700 cursor-pointer whitespace-nowrap ml-4">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 accent-purple-600 rounded"
                                      checked={Boolean(fields.sameAsAbove)}
                                      onChange={(e) =>
                                        handleSameAsAboveToggle(
                                          student._id,
                                          e.target.checked
                                        )
                                      }
                                    />
                                    Same as above
                                  </label>
                                )}
                              </div>

                              {/* Fields row - only show if checked and not using same as above */}
                              {checked && !fields.sameAsAbove && (
                                <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-b">
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                      Deadline
                                    </label>
                                    <input
                                      type="date"
                                      value={fields.deadline}
                                      onChange={(e) =>
                                        handlePerStudentFieldChange(
                                          student._id,
                                          "deadline",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                      Description
                                    </label>
                                    <textarea
                                      value={fields.description}
                                      onChange={(e) =>
                                        handlePerStudentFieldChange(
                                          student._id,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border rounded text-sm"
                                      rows={2}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                      Assignment File
                                    </label>
                                    <input
                                      type="file"
                                      onChange={(e) =>
                                        handlePerStudentFieldChange(
                                          student._id,
                                          "assignmentFile",
                                          e.target.files?.[0] || null
                                        )
                                      }
                                      className="w-full text-xs text-gray-700"
                                    />
                                    {fields.assignmentFile && (
                                      <p className="mt-1 text-xs text-gray-600 truncate">
                                        {fields.assignmentFile.name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="!p-4 !text-center !border !border-gray-200 !rounded-xl">
                    <p className="!text-sm !text-gray-500">
                      No students enrolled in this course
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* REMOVE these fields: Deadline, Description, Assignment File */}
            {/* Deadline */}
            {/* <div>
              <label className="!text-sm !font-semibold !text-gray-700 !mb-2 !flex !items-center !gap-2">
                <Calendar size={16} className="!text-purple-600" /> Deadline *
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="!w-full !px-4 !py-3 !border !border-gray-300 !rounded-xl focus:!ring-2 focus:!ring-purple-500 focus:!border-transparent !transition-all !text-gray-900"
                disabled={isSubmitting}
              />
            </div> */}

            {/* Description */}
            {/* <div>
              <label className="!block !text-sm !font-semibold !text-gray-700 !mb-2">
                Assignment Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="!w-full !px-4 !py-3 !border !border-gray-300 !rounded-xl focus:!ring-2 focus:!ring-purple-500 focus:!border-transparent !transition-all !text-gray-900 !placeholder:text-gray-400 !resize-none"
                disabled={isSubmitting}
              />
            </div> */}

            {/* Assignment File Upload */}
            {/* <div>
                <label className="!block !text-sm !font-semibold !text-gray-700 !mb-2 !flex !items-center !gap-2">
                  <Upload size={16} className="!text-purple-600" /> Assignment
                  File
                </label>
                <div className="relative !border-2 !border-dashed !border-gray-300 !rounded-xl !p-6 !hover:border-purple-400 !transition-all !bg-gray-50">
                  <input
                    type="file"
                    onChange={handleAssignmentFileChange}
                    disabled={isSubmitting}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="assignmentFileInput"
                  />
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      {assignmentFile
                        ? assignmentFile.name
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      All file types accepted
                    </p>
                  </div>
                </div>

                {editingAssignment?.fileName && !assignmentFile && (
                  <div className="text-sm text-gray-600 mt-2">
                    Current file:{" "}
                    <span className="font-medium">
                      {editingAssignment.fileName}
                    </span>
                  </div>
                )}
              </div> */}

            {/* Common fields for all students */}
            {/* {selectedStudents.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Common Assignment Fields
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={commonFields.deadline}
                      onChange={(e) =>
                        handleCommonFieldChange("deadline", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={commonFields.description}
                      onChange={(e) =>
                        handleCommonFieldChange("description", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assignment File
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        handleCommonFieldChange(
                          "assignmentFile",
                          e.target.files?.[0] || null
                        )
                      }
                      className="w-full text-sm text-gray-700"
                    />
                    {commonFields.assignmentFile && (
                      <p className="mt-2 text-xs text-gray-600 truncate">
                        Selected file:{" "}
                        <span className="font-medium">
                          {commonFields.assignmentFile.name}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )} */}

            {/* Per-student fields */}
            {/* {selectedStudents.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Per Student Assignment Fields
                </h4>
                <div className="space-y-6">
                  {selectedStudents.map((studentId) => {
                    const student = students.find((s) => s._id === studentId);
                    const fields = perStudentFields[studentId] || {
                      deadline: "",
                      description: "",
                      assignmentFile: null,
                      useCommon: false,
                    };
                    return (
                      <div key={studentId} className="p-4 border rounded bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{student?.username}</span>
                          <span className="text-xs text-gray-500">
                            {student?.email}
                          </span>
                          <label className="ml-auto flex items-center gap-1 text-xs text-purple-700 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fields.useCommon}
                              onChange={(e) =>
                                handlePerStudentFieldChange(
                                  studentId,
                                  "useCommon",
                                  e.target.checked
                                )
                              }
                            />
                            Use common fields above
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Deadline
                            </label>
                            <input
                              type="date"
                              value={fields.useCommon ? commonFields.deadline : fields.deadline}
                              onChange={(e) =>
                                handlePerStudentFieldChange(
                                  studentId,
                                  "deadline",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border rounded"
                              disabled={fields.useCommon}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={fields.useCommon ? commonFields.description : fields.description}
                              onChange={(e) =>
                                handlePerStudentFieldChange(
                                  studentId,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border rounded"
                              disabled={fields.useCommon}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Assignment File
                            </label>
                            <input
                              type="file"
                              onChange={(e) =>
                                handlePerStudentFieldChange(
                                  studentId,
                                  "assignmentFile",
                                  e.target.files?.[0] || null
                                )
                              }
                              className="w-full text-sm text-gray-700"
                              disabled={fields.useCommon}
                            />
                            {fields.assignmentFile && !fields.useCommon && (
                              <p className="mt-2 text-xs text-gray-600 truncate">
                                Selected file:{" "}
                                <span className="font-medium">
                                  {fields.assignmentFile.name}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )} */}

            {/* Submit */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || (editingAssignment ? !isAssignmentChanged() : false)}
                className={
                  "!px-6 !py-3 !rounded-xl !font-semibold !transition-all " +
                  (isSubmitting || (editingAssignment ? !isAssignmentChanged() : false)
                    ? "!bg-purple-200 !text-purple-300 !cursor-not-allowed !border !border-purple-100"
                    : "!bg-purple-600 !text-white hover:!bg-purple-700")
                }
              >
                {isSubmitting
                  ? editingAssignment
                    ? "Updating..."
                    : "Creating..."
                  : editingAssignment
                  ? "Update Assignment"
                  : "Create Assignment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
