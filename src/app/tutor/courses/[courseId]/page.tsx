"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  BookOpen,
  Upload,
  FileText,
  IndianRupee,
  BarChart3,
  Trash2,
  Edit,
  X,
  Clock,
  Copy,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import {
  formatInTz,
  formatTimeRangeInTz,
  getUserTimeZone,
} from "@/helper/time";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Curriculum {
  sessionNo: string;
  topic: string;
  tangibleOutcome: string;
}

interface Class {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  recordingUrl?: string;
  reasonForReschedule?: string;
  reasonForCancelation?: string;
  status?: string;
}

interface CourseDetailsData {
  courseId: string;
  courseDetails: {
    _id: string;
    title: string;
    description: string;
    duration: string;
    price: number;
    curriculum: Curriculum[];
  };
  classDetails: Class[];
  academyId: string | null;
}

interface EditClassForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  reasonForReschedule?: string;
}

type StatusFilter = "all" | "scheduled" | "rescheduled" | "canceled" | "completed";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 10;

// ─── Main Component ───────────────────────────────────────────────────────────

const CourseDetailsPage = () => {
  // ── Data State ──
  const [courseData, setCourseData] = useState<CourseDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState<string | null>(null);

  // ── UI State ──
  const [activeTab, setActiveTab] = useState<"classes" | "curriculum">("classes");
  const [uploadLoading, setUploadLoading] = useState<{ [key: string]: boolean }>({});
  const [copyingClassId, setCopyingClassId] = useState<string | null>(null);

  // ── Pagination & Filters ──
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showFilters, setShowFilters] = useState(false);

  // ── Edit Modal ──
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editForm, setEditForm] = useState<EditClassForm>({
    title: "", description: "", startTime: "", endTime: "", date: "", reasonForReschedule: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");
  const [hasTimeChanged, setHasTimeChanged] = useState(false);
  const [originalDateTime, setOriginalDateTime] = useState({ date: "", startTime: "", endTime: "" });

  // ── Delete Modal ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const params = useParams();
  const router = useRouter();

  // ─── Fetch course + timezone in parallel (single load, no double call) ────

  useEffect(() => {
    if (!params.courseId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [courseRes, userRes] = await Promise.all([
          fetch(`/Api/tutors/courses/${params.courseId}`),
          fetch("/Api/users/user"),
        ]);

        if (!courseRes.ok) throw new Error("Failed to fetch course details");

        const [courseJson, userJson] = await Promise.all([
          courseRes.json(),
          userRes.ok ? userRes.json() : Promise.resolve(null),
        ]);

        if (cancelled) return;
        setCourseData(courseJson);
        setAcademyId(courseJson.academyId || null);
        if (userJson?.user?.timezone) setUserTimezone(userJson.user.timezone);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [params.courseId]);

  // ─── Refresh after mutations ──────────────────────────────────────────────

  const refreshCourse = useCallback(async () => {
    const res = await fetch(`/Api/tutors/courses/${params.courseId}`);
    if (res.ok) setCourseData(await res.json());
  }, [params.courseId]);

  // ─── Timezone helpers ─────────────────────────────────────────────────────

  const getTimezone = useCallback(() => userTimezone || getUserTimeZone(), [userTimezone]);

  const formatDateTime = useCallback((startTime: string, endTime: string) => {
    const tz = getTimezone();
    return {
      date: formatInTz(startTime, tz, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      time: formatTimeRangeInTz(startTime, endTime, tz),
    };
  }, [getTimezone]);

  const extractDateTimeForForm = useCallback((dateTimeString: string) => {
    const tz = getTimezone();
    const date = new Date(dateTimeString);
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const parts = fmt.formatToParts(date);
    const get = (t: string) => parts.find(p => p.type === t)?.value || "";
    return {
      dateStr: `${get("year")}-${get("month")}-${get("day")}`,
      timeStr: `${get("hour")}:${get("minute")}`,
    };
  }, [getTimezone]);

  // ─── Filtered & Paginated Classes ─────────────────────────────────────────

  const filteredClasses = useMemo(() => {
    if (!courseData) return [];
    let list = [...courseData.classDetails];

    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const diff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      return sortDirection === "asc" ? diff : -diff;
    });

    return list;
  }, [courseData, statusFilter, searchQuery, sortDirection]);

  const totalPages = Math.ceil(filteredClasses.length / PAGE_SIZE);

  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredClasses.slice(start, start + PAGE_SIZE);
  }, [filteredClasses, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, sortDirection]);

  // ─── Status counts ────────────────────────────────────────────────────────

  const statusCounts = useMemo(() => {
    if (!courseData) return {} as Record<string, number>;
    return courseData.classDetails.reduce((acc, c) => {
      const s = c.status || "scheduled";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [courseData]);

  // ─── Edit handlers ────────────────────────────────────────────────────────

  const handleEditClass = useCallback((cls: Class) => {
    const start = extractDateTimeForForm(cls.startTime);
    const end = extractDateTimeForForm(cls.endTime);
    setOriginalDateTime({ date: start.dateStr, startTime: start.timeStr, endTime: end.timeStr });
    setEditForm({
      title: cls.title,
      description: cls.description,
      startTime: start.timeStr,
      endTime: end.timeStr,
      date: start.dateStr,
      reasonForReschedule: cls.reasonForReschedule || "",
    });
    setEditingClass(cls);
    setShowEditModal(true);
    setEditError("");
    setHasTimeChanged(false);
  }, [extractDateTimeForForm]);

  const validateDateTime = (date: string, startTime: string, endTime: string) => {
    if (!date || !startTime || !endTime) return "";
    const [y, mo, d] = date.split("-").map(Number);
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    return new Date(y, mo - 1, d, eh, em) <= new Date(y, mo - 1, d, sh, sm)
      ? "End time must be after start time"
      : "";
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...editForm, [name]: value };
    setEditForm(updated);
    if (["date", "startTime", "endTime"].includes(name)) {
      setHasTimeChanged(
        updated.date !== originalDateTime.date ||
        updated.startTime !== originalDateTime.startTime ||
        updated.endTime !== originalDateTime.endTime
      );
      setEditError(validateDateTime(updated.date, updated.startTime, updated.endTime));
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    const validationErr = validateDateTime(editForm.date, editForm.startTime, editForm.endTime);
    if (validationErr) { setEditError(validationErr); return; }
    if (hasTimeChanged && !editForm.reasonForReschedule?.trim()) {
      setEditError("Please provide a reason for rescheduling"); return;
    }
    setIsUpdating(true);
    setEditError("");
    try {
      const res = await fetch(`/Api/classes?classId=${editingClass._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          date: editForm.date,
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          reasonForReschedule: hasTimeChanged ? editForm.reasonForReschedule : "",
          timezone: getTimezone(),
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed to update class"); }
      toast.success("Class updated successfully!");
      setShowEditModal(false);
      setEditingClass(null);
      await refreshCourse();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update class");
    } finally {
      setIsUpdating(false);
    }
  };

  // ─── Delete handlers ──────────────────────────────────────────────────────

  const handleDeleteClass = useCallback((cls: Class) => {
    setDeletingClass(cls);
    setDeleteReason("");
    setDeleteError("");
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteClass = async () => {
    if (!deletingClass) return;
    if (!deleteReason.trim()) { setDeleteError("Please provide a reason for cancellation"); return; }
    try {
      const res = await fetch(`/Api/classes?classId=${deletingClass._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reasonForCancellation: deleteReason, timezone: getTimezone() }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed to cancel class"); }
      toast.success("Class canceled and students notified!");
      setShowDeleteModal(false);
      setDeletingClass(null);
      setDeleteReason("");
      await refreshCourse();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to cancel class");
    }
  };

  // ─── Copy handler ─────────────────────────────────────────────────────────

  const copyClass = useCallback(async (cls: Class) => {
    if (copyingClassId) return;
    setCopyingClassId(cls._id);
    try {
      const start = extractDateTimeForForm(cls.startTime);
      const end = extractDateTimeForForm(cls.endTime);
      const formData = new FormData();
      formData.append("title", `${cls.title} - copied`);
      formData.append("description", cls.description || "");
      formData.append("date", start.dateStr);
      formData.append("startTime", start.timeStr);
      formData.append("endTime", end.timeStr);
      formData.append("courseId", String(params.courseId || ""));
      formData.append("timezone", getTimezone());
      const res = await fetch("/Api/classes", { method: "POST", body: formData });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || err.message || "Failed to copy class"); }
      toast.success("Class duplicated!");
      await refreshCourse();
    } catch (err: any) {
      toast.error(err.message || "Failed to copy class");
    } finally {
      setCopyingClassId(null);
    }
  }, [copyingClassId, extractDateTimeForForm, params.courseId, getTimezone, refreshCourse]);

  // ─── File upload ──────────────────────────────────────────────────────────

  const handleFileChange = async (classId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    if (file.size > 800 * 1024 * 1024) { toast.error("File size must be less than 800MB"); return; }
    setUploadLoading(prev => ({ ...prev, [classId]: true }));
    try {
      const presignedRes = await axios.post("/Api/upload/presigned-url", { fileName: file.name, fileType: file.type, classId });
      const { publicUrl, uploadUrl } = presignedRes.data;
      await axios.put(uploadUrl, file, { headers: { "Content-Type": file.type } });
      toast.success("Recording uploaded successfully!");
      await axios.post("/Api/classes/update", { classId, recordingUrl: publicUrl });
      axios.post(`/Api/proxy/evaluate-video?item_id=${classId}`).catch(() => {});
      axios.post(`/Api/proxy/generate-highlights?item_id=${classId}`).catch(() => {});
      router.refresh();
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      toast.error(axiosErr.response?.data?.error || "Failed to upload recording.");
    } finally {
      setUploadLoading(prev => ({ ...prev, [classId]: false }));
      const ref = fileInputRefs.current[classId];
      if (ref) ref.value = "";
    }
  };

  // ─── Delete course ────────────────────────────────────────────────────────

  const handleDeleteCourse = async () => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/Api/tutors/courses?courseId=${params.courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");
      toast.success("Course deleted successfully");
      router.push("/tutor/courses");
    } catch {
      toast.error("Failed to delete course");
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="!min-h-screen !bg-gradient-to-br !from-gray-100 !via-gray-200 !to-gray-300 !flex !items-center !justify-center !p-4">
        <div className="!text-lg !sm:text-2xl !font-semibold !text-gray-700 !text-center">
          Loading Course Details...
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────

  if (error || !courseData) {
    return (
      <div className="!min-h-screen !bg-gradient-to-br !from-gray-100 !via-gray-200 !to-gray-300 !flex !items-center !justify-center !p-4">
        <div className="!bg-white !p-6 !sm:p-8 !rounded-xl !shadow-lg !text-center !max-w-md !w-full">
          <div className="!text-xl !sm:text-2xl !font-semibold !text-red-600 !mb-4">Error Loading Course</div>
          <p className="!text-gray-700 !mb-6 !text-sm !sm:text-base">{error}</p>
          <Link href="/tutor" className="!inline-block !px-4 !sm:px-6 !py-2 !sm:py-3 !bg-gradient-to-r !from-blue-500 !to-purple-600 !text-white !rounded-lg !hover:from-blue-600 !hover:to-purple-700 !transition-colors !text-sm !sm:text-base">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-gray-100 !via-gray-200 !to-gray-300 !p-3 !sm:p-6">
      <div className="!max-w-6xl !mx-auto">

        {/* Header */}
        <header className="!mb-6 !sm:mb-8">
          <div className="!flex !flex-col !sm:flex-row !sm:justify-between !sm:items-center !gap-4">
            <div className="!flex !items-center !space-x-3 !sm:space-x-4">
              <Link href="/tutor/courses" className="!p-2 !rounded-full !bg-gray-200 !hover:bg-gray-300 !transition-colors !shadow-md !flex-shrink-0">
                <ChevronLeft className="!text-gray-700 !w-5 !h-5 !sm:w-6 !sm:h-6" />
              </Link>
              <h1 className="!text-xl !sm:text-2xl !lg:text-3xl !font-bold !text-gray-800 !break-words">
                {courseData.courseDetails.title}
              </h1>
            </div>
            <div className="!flex !flex-col !sm:flex-row !items-stretch !sm:items-center !gap-2 !sm:gap-3">
              {!academyId && (
                <Link href={`/tutor/classes/?courseId=${courseData.courseDetails._id}`}>
                  <button className="!w-full !sm:w-auto !bg-gray-700 !hover:bg-gray-800 !text-white !px-3 !sm:px-4 !py-2 !rounded-md !font-medium !transition-colors !shadow-md !flex !items-center !justify-center !gap-2 !text-sm !sm:text-base">
                    <Upload size={16} className="!sm:w-[18px] !sm:h-[18px]" />
                    Create Class
                  </button>
                </Link>
              )}
              {!academyId && (
                <button
                  onClick={handleDeleteCourse}
                  className="!w-full !sm:w-auto !border !border-gray-300 !bg-white !text-gray-700 !hover:bg-red-50 !hover:text-red-600 !hover:border-red-200 !px-3 !sm:px-4 !py-2 !rounded-md !font-medium !transition-all !duration-200 !flex !items-center !justify-center !gap-2 !shadow-sm !text-sm !sm:text-base"
                >
                  <Trash2 size={16} className="!sm:w-[18px] !sm:h-[18px]" />
                  Delete Course
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Course Overview */}
        <section className="!bg-white !rounded-xl !shadow-lg !p-4 !sm:p-6 !mb-6 !sm:mb-8">
          <div className="!flex !flex-col !sm:flex-row !sm:justify-between !sm:items-center !mb-4 !gap-3">
            <h2 className="!text-lg !sm:text-xl !font-semibold !text-gray-800 !flex !items-center">
              <BookOpen className="!mr-2 !text-gray-600 !w-5 !h-5 !sm:w-6 !sm:h-6" />
              Course Overview
            </h2>
            <div className="!text-gray-600 !text-sm !sm:text-base">
              <div className="!flex !flex-col !sm:flex-row !gap-2 !sm:gap-4">
                <span><span className="!font-medium">Duration:</span> {courseData.courseDetails.duration}</span>
                <span>
                  <span className="!font-medium">Price:</span>{" "}
                  <IndianRupee className="!text-xs !scale-70 !inline-block !transform" />
                  {courseData.courseDetails.price}
                </span>
              </div>
            </div>
          </div>
          <p className="!text-gray-600 !text-sm !sm:text-base !leading-relaxed">
            {courseData.courseDetails.description}
          </p>
        </section>

        {/* Tab Navigation */}
        <div className="!mb-6">
          <div className="!flex !bg-white !rounded-lg !shadow-md !p-1 !max-w-md !mx-auto !sm:mx-0">
            <button
              onClick={() => setActiveTab("classes")}
              className={`!flex-1 !py-2 !px-4 !rounded-md !font-medium !transition-all !duration-200 !text-sm !sm:text-base ${
                activeTab === "classes" ? "!bg-blue-500 !text-white !shadow-md" : "!text-gray-600 !hover:text-gray-800"
              }`}
            >
              Classes
            </button>
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`!flex-1 !py-2 !px-4 !rounded-md !font-medium !transition-all !duration-200 !text-sm !sm:text-base ${
                activeTab === "curriculum" ? "!bg-blue-500 !text-white !shadow-md" : "!text-gray-600 !hover:text-gray-800"
              }`}
            >
              Curriculum
            </button>
          </div>
        </div>

        {/* ── CLASSES TAB ── */}
        {activeTab === "classes" && (
          <section>
            {/* Search & Filter Bar */}
            <div className="!bg-white !rounded-xl !shadow-md !p-3 !sm:p-4 !mb-4">
              <div className="!flex !flex-col !sm:flex-row !gap-3">
                {/* Search */}
                <div className="!relative !flex-1">
                  <Search className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !text-gray-400 !w-4 !h-4" />
                  <input
                    type="text"
                    placeholder="Search classes by title or description..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="!w-full !pl-9 !pr-8 !py-2 !border !border-gray-300 !rounded-md !text-sm !text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="!absolute !right-2 !top-1/2 !-translate-y-1/2 !text-gray-400 !hover:text-gray-600">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="!flex !items-center !gap-2">
                  {/* Filter toggle */}
                  <button
                    onClick={() => setShowFilters(f => !f)}
                    className={`!flex !items-center !gap-2 !px-3 !py-2 !rounded-md !border !text-sm !font-medium !transition-all ${
                      showFilters || statusFilter !== "all"
                        ? "!bg-blue-50 !border-blue-300 !text-blue-700"
                        : "!border-gray-300 !text-gray-600 !hover:bg-gray-50 !bg-white"
                    }`}
                  >
                    <Filter size={14} />
                    Filter
                    {statusFilter !== "all" && <span className="!w-2 !h-2 !rounded-full !bg-blue-500" />}
                  </button>

                  {/* Sort toggle */}
                  <button
                    onClick={() => setSortDirection(d => d === "asc" ? "desc" : "asc")}
                    className="!flex !items-center !gap-1 !px-3 !py-2 !rounded-md !border !border-gray-300 !bg-white !text-sm !font-medium !text-gray-600 !hover:bg-gray-50 !transition-all"
                    title={sortDirection === "asc" ? "Oldest first" : "Newest first"}
                  >
                    <Calendar size={14} />
                    {sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Status filter chips */}
              {showFilters && (
                <div className="!flex !flex-wrap !gap-2 !mt-3 !pt-3 !border-t !border-gray-100">
                  {(["all", "scheduled", "rescheduled", "canceled", "completed"] as StatusFilter[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`!px-3 !py-1 !rounded-full !text-xs !font-semibold !transition-all !capitalize ${
                        statusFilter === s ? "!bg-blue-500 !text-white" : "!bg-gray-100 !text-gray-600 !hover:bg-gray-200"
                      }`}
                    >
                      {s === "all" ? `All (${courseData.classDetails.length})` : `${s} (${statusCounts[s] || 0})`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results summary */}
            <div className="!flex !items-center !mb-3 !px-1">
              <p className="!text-sm !text-gray-500">
                Showing{" "}
                <span className="!font-semibold !text-gray-700">
                  {filteredClasses.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredClasses.length)}
                </span>{" "}
                of <span className="!font-semibold !text-gray-700">{filteredClasses.length}</span> classes
                {statusFilter !== "all" && (
                  <span className="!ml-1 !text-blue-600">· filtered by <em>{statusFilter}</em></span>
                )}
              </p>
            </div>

            {/* Class Cards */}
            <div className="!space-y-4 !sm:space-y-6">
              {paginatedClasses.length === 0 ? (
                <div className="!bg-white !rounded-xl !shadow-md !p-12 !text-center">
                  <Search className="!w-10 !h-10 !text-gray-300 !mx-auto !mb-3" />
                  <p className="!text-gray-500 !font-medium !text-lg">No classes found</p>
                  <p className="!text-gray-400 !text-sm !mt-1">Try adjusting your search or filters</p>
                  <button
                    onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                    className="!mt-4 !text-blue-500 !text-sm !hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                paginatedClasses.map(classSession => (
                  <ClassCard
                    key={classSession._id}
                    classSession={classSession}
                    formatDateTime={formatDateTime}
                    isUploading={uploadLoading[classSession._id] || false}
                    isCopying={copyingClassId === classSession._id}
                    courseId={String(courseData.courseDetails._id)}
                    fileInputRefs={fileInputRefs}
                    onEdit={handleEditClass}
                    onDelete={handleDeleteClass}
                    onCopy={copyClass}
                    onFileChange={handleFileChange}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="!flex !items-center !justify-center !gap-2 !mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="!px-4 !py-2 !bg-white !rounded-md !border !border-gray-300 !text-sm !font-medium !text-gray-600 !hover:bg-gray-50 disabled:!opacity-40 disabled:!cursor-not-allowed !transition-all"
                >
                  Previous
                </button>

                <div className="!flex !items-center !gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce((acc: (number | "...")[], p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={`ellipsis-${i}`} className="!px-2 !text-gray-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={`!w-9 !h-9 !rounded-md !text-sm !font-medium !transition-all ${
                            currentPage === p
                              ? "!bg-blue-500 !text-white !shadow-sm"
                              : "!bg-white !border !border-gray-300 !text-gray-600 !hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="!px-4 !py-2 !bg-white !rounded-md !border !border-gray-300 !text-sm !font-medium !text-gray-600 !hover:bg-gray-50 disabled:!opacity-40 disabled:!cursor-not-allowed !transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        )}

        {/* ── CURRICULUM TAB ── */}
        {activeTab === "curriculum" && (
          <section>
            <h2 className="!text-xl !sm:text-2xl !font-bold !text-gray-800 !mb-4 !sm:mb-6">
              Course Curriculum
            </h2>
            <div className="!bg-white !rounded-xl !shadow-lg !p-4 !sm:p-6">
              {courseData.courseDetails.curriculum?.length > 0 ? (
                <div className="!space-y-4">
                  {courseData.courseDetails.curriculum.map((item, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          Lesson {item.sessionNo}
                        </span>
                        <h3 className="!text-lg !font-semibold !text-gray-800">{item.topic}</h3>
                      </div>
                      <p className="!text-gray-600 !mt-2 !text-sm !sm:text-base">
                        <span className="!font-medium">Outcome:</span> {item.tangibleOutcome}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="!text-center !py-8">
                  <BookOpen className="!mx-auto !h-12 !w-12 !text-gray-400 !mb-4" />
                  <p className="!text-gray-500 !text-lg">No curriculum available</p>
                  <p className="!text-gray-400 !text-sm">The curriculum for this course hasn't been set up yet.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Edit Modal ── */}
        {showEditModal && editingClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 text-gray-800 flex items-center justify-center p-4 z-50">
            <div className="!bg-white !rounded-xl !shadow-xl !max-w-md !w-full !max-h-[90vh] !overflow-y-auto">
              <div className="!p-6">
                <div className="!flex !justify-between !items-center !mb-4">
                  <h3 className="!text-lg !font-semibold !text-gray-800">Edit Class</h3>
                  <button onClick={() => setShowEditModal(false)} className="!p-1 !hover:bg-gray-100 !rounded-full !transition-colors">
                    <X size={20} className="!text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleUpdateClass} className="!space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text" name="title" value={editForm.title} onChange={handleEditFormChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description" value={editForm.description} onChange={handleEditFormChange} rows={3} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date" name="date" value={editForm.date} onChange={handleEditFormChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time" name="startTime" value={editForm.startTime} onChange={handleEditFormChange} required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time" name="endTime" value={editForm.endTime} onChange={handleEditFormChange} required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Reschedule reason — only shown when date/time changes */}
                  {hasTimeChanged && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Reschedule <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="reasonForReschedule"
                        value={editForm.reasonForReschedule || ""}
                        onChange={handleEditFormChange}
                        rows={3}
                        placeholder="Please provide a reason for rescheduling this class..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Students will be notified about this reschedule</p>
                    </div>
                  )}

                  {editError && (
                    <div className="!text-red-600 !text-sm !bg-red-50 !p-3 !rounded-md">{editError}</div>
                  )}

                  <div className="!flex !gap-3 !pt-4">
                    <button
                      type="button" onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit" disabled={isUpdating || !!editError}
                      className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                        isUpdating || editError
                          ? "!bg-gray-400 !cursor-not-allowed !text-white"
                          : "!bg-blue-500 !hover:bg-blue-600 !text-white"
                      }`}
                    >
                      {isUpdating ? (
                        <div className="flex items-center justify-center">
                          <Clock className="animate-spin mr-2" size={16} />
                          Updating...
                        </div>
                      ) : "Update Class"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Modal ── */}
        {showDeleteModal && deletingClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 text-gray-800 flex items-center justify-center p-4 z-50">
            <div className="!bg-white !rounded-xl !shadow-xl !max-w-md !w-full">
              <div className="!p-6">
                <div className="!flex !justify-between !items-center !mb-4">
                  <h3 className="!text-lg !font-semibold !text-gray-800">Cancel Class</h3>
                  <button
                    onClick={() => { setShowDeleteModal(false); setDeletingClass(null); setDeleteReason(""); setDeleteError(""); }}
                    className="!p-1 !hover:bg-gray-100 !rounded-full !transition-colors"
                  >
                    <X size={20} className="!text-gray-500" />
                  </button>
                </div>

                <div className="!mb-4">
                  <p className="!text-gray-700 !mb-2">
                    You are about to cancel: <strong>{deletingClass.title}</strong>
                  </p>
                  <p className="!text-sm !text-gray-600">All enrolled students will be notified via email about this cancellation.</p>
                </div>

                <div className="!mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Cancellation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
                    rows={4} placeholder="Please provide a reason for cancelling this class..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                {deleteError && (
                  <div className="!text-red-600 !text-sm !bg-red-50 !p-3 !rounded-md !mb-4">{deleteError}</div>
                )}

                <div className="!flex !gap-3">
                  <button
                    onClick={() => { setShowDeleteModal(false); setDeletingClass(null); setDeleteReason(""); setDeleteError(""); }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Keep Class
                  </button>
                  <button
                    onClick={confirmDeleteClass}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                  >
                    Cancel Class
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ─── ClassCard — memoized to prevent re-renders on unrelated state changes ────

interface ClassCardProps {
  classSession: Class;
  formatDateTime: (s: string, e: string) => { date: string; time: string };
  isUploading: boolean;
  isCopying: boolean;
  courseId: string;
  fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  onEdit: (cls: Class) => void;
  onDelete: (cls: Class) => void;
  onCopy: (cls: Class) => void;
  onFileChange: (classId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ClassCard = React.memo(({
  classSession, formatDateTime, isUploading, isCopying,
  courseId, fileInputRefs, onEdit, onDelete, onCopy, onFileChange,
}: ClassCardProps) => {
  const { date, time } = formatDateTime(classSession.startTime, classSession.endTime);
  const isCanceled = classSession.status === "canceled";

  // Diagonal strikethrough overlay — exactly as original
  const CanceledOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-xl">
      <div
        className="absolute inset-0"
        style={{
          background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(220, 53, 69, 0.15) 10px, rgba(220, 53, 69, 0.15) 20px)",
        }}
      />
      <div
        className="absolute top-0 left-0"
        style={{
          background: "rgba(220, 53, 69, 0.5)",
          height: "3px",
          width: "141%",
          transform: "rotate(45deg)",
          transformOrigin: "top left",
          boxShadow: "0 0 5px rgba(220, 53, 69, 0.3)",
        }}
      />
    </div>
  );

  return (
    <div className="!bg-white !rounded-xl !shadow-md !hover:shadow-xl !transition-shadow">
      <div className="!p-4 !sm:p-6">

        {/* ── Mobile Layout ── */}
        <div className="block lg:hidden !text-gray-800">
          <div className="relative">
            {isCanceled && <CanceledOverlay />}
            <div className={isCanceled ? "opacity-50 grayscale" : ""}>
              <div className="!flex !gap-3">
                {/* Action icons — left column */}
                <div className="!flex !flex-col !gap-2">
                  {!isCanceled && (
                    <button
                      onClick={() => onEdit(classSession)}
                      className="!p-1 !text-blue-500 !hover:text-blue-700 !hover:bg-blue-50 !rounded-full !transition-colors"
                      title="Edit class"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(classSession)}
                    disabled={isCanceled}
                    className={`!p-1 !rounded-full !transition-colors ${
                      isCanceled ? "!text-gray-400 !cursor-not-allowed" : "!text-red-500 !hover:text-red-700 !hover:bg-red-50"
                    }`}
                    title={isCanceled ? "Already canceled" : "Delete class"}
                  >
                    <Trash2 size={16} />
                  </button>
                  {!isCanceled && (
                    <button
                      onClick={() => onCopy(classSession)}
                      disabled={isCopying}
                      className="!p-1 !text-gray-600 !hover:text-gray-800 !hover:bg-gray-50 !rounded-full !transition-colors"
                      title="Copy class"
                    >
                      {isCopying
                        ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700" />
                        : <Copy size={16} />}
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 !space-y-4">
                  {/* Date block */}
                  <div className="!bg-gray-100 !rounded-lg !p-3 !text-center">
                    <div className="!text-sm !font-bold !text-gray-800">{date}</div>
                    <div className="!text-xs !text-gray-600">{time}</div>
                  </div>

                  <div>
                    <h3 className="!text-lg !font-semibold !text-gray-800 !mb-2">{classSession.title}</h3>
                    <p className="!text-gray-600 !text-sm !leading-relaxed">{classSession.description}</p>
                  </div>

                  {/* Reschedule reason */}
                  {classSession.reasonForReschedule && classSession.status === "rescheduled" && (
                    <div className="!mt-3 !bg-yellow-50 !border-l-4 !border-yellow-400 !p-3 !rounded">
                      <div className="!flex !items-start !gap-2">
                        <AlertCircle className="!text-yellow-600 !flex-shrink-0 !mt-0.5" size={16} />
                        <div>
                          <p className="!text-xs !font-semibold !text-yellow-800 !mb-1">Rescheduled</p>
                          <p className="!text-xs !text-yellow-700">{classSession.reasonForReschedule}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancellation reason */}
                  {classSession.reasonForCancelation && isCanceled && (
                    <div className="!mt-3 !bg-red-50 !border-l-4 !border-red-400 !p-3 !rounded">
                      <div className="!flex !items-start !gap-2">
                        <AlertCircle className="!text-red-600 !flex-shrink-0 !mt-0.5" size={16} />
                        <div>
                          <p className="!text-xs !font-semibold !text-red-800 !mb-1">Canceled</p>
                          <p className="!text-xs !text-red-700">{classSession.reasonForCancelation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile action buttons */}
              {!isCanceled && (
                <div className="!flex !flex-col !gap-2 !ml-10 !mt-3">
                  <input
                    type="file" accept="video/*" className="hidden"
                    ref={el => { fileInputRefs.current[classSession._id] = el; }}
                    onChange={e => onFileChange(classSession._id, e)}
                  />
                  <div className="!flex !gap-2">
                    {classSession.recordingUrl && (
                      <Link
                        href={`/tutor/classQuality/${classSession._id}`}
                        className="flex-1 px-3 py-2 text-white rounded-lg transition-colors flex items-center justify-center text-xs"
                        style={{ backgroundColor: "purple" }}
                      >
                        <BarChart3 className="!mr-1" size={14} />
                        Quality
                      </Link>
                    )}
                    <button
                      onClick={() => fileInputRefs.current[classSession._id]?.click()}
                      disabled={isUploading}
                      className="flex-1 px-3 py-2 text-white rounded-lg transition-colors flex items-center justify-center text-xs"
                      style={{ backgroundColor: isUploading ? "blueviolet" : "blue" }}
                    >
                      <Upload className="!mr-1" size={14} />
                      {isUploading ? "Uploading..." : classSession.recordingUrl ? "Replace Recording" : "Upload Recording"}
                    </button>
                  </div>
                  <Link
                    href={`/tutor/createAssignment?classId=${classSession._id}&courseId=${courseId}`}
                    className="w-full px-3 py-2 hover:opacity-90 rounded-lg transition-all flex items-center justify-center text-xs font-medium shadow-sm"
                    style={{ backgroundColor: "#fb923c", color: "#ffffff" }}
                  >
                    <FileText className="mr-1" size={14} />
                    Add Assignment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Desktop Layout ── */}
        <div className="hidden lg:block">
          <div className="relative">
            {isCanceled && <CanceledOverlay />}
            <div className={isCanceled ? "opacity-50 grayscale" : ""}>
              <div className="!flex !gap-6 !items-center">
                {/* Action icons — left column */}
                <div className="!flex !flex-col !gap-2">
                  {!isCanceled && (
                    <button
                      onClick={() => onEdit(classSession)}
                      className="!p-1 !text-blue-500 !hover:text-blue-700 !hover:bg-blue-50 !rounded-full !transition-colors"
                      title="Edit class"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(classSession)}
                    disabled={isCanceled}
                    className={`!p-1 !rounded-full !transition-colors ${
                      isCanceled ? "!text-gray-400 !cursor-not-allowed" : "!text-red-500 !hover:text-red-700 !hover:bg-red-50"
                    }`}
                    title={isCanceled ? "Already canceled" : "Delete class"}
                  >
                    <Trash2 size={18} />
                  </button>
                  {!isCanceled && (
                    <button
                      onClick={() => onCopy(classSession)}
                      disabled={isCopying}
                      className="!p-1 !text-gray-600 !hover:text-gray-800 !hover:bg-gray-50 !rounded-full !transition-colors"
                      title="Copy class"
                    >
                      {isCopying
                        ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700" />
                        : <Copy size={18} />}
                    </button>
                  )}
                </div>

                {/* Date block */}
                <div className="!bg-gray-100 !rounded-lg !p-4 !text-center !min-w-[200px]">
                  <div className="!text-xl !font-bold !text-gray-800">{date}</div>
                  <div className="!text-gray-600">{time}</div>
                </div>

                {/* Session details */}
                <div className="flex-1">
                  <h3 className="!text-xl !font-semibold !text-gray-800 !mb-2">{classSession.title}</h3>
                  <p className="!text-gray-600">{classSession.description}</p>

                  {/* Reschedule reason */}
                  {classSession.reasonForReschedule && classSession.status === "rescheduled" && (
                    <div className="!mt-3 !bg-yellow-50 !border-l-4 !border-yellow-400 !p-3 !rounded">
                      <div className="!flex !items-start !gap-2">
                        <AlertCircle className="!text-yellow-600 !flex-shrink-0 !mt-0.5" size={18} />
                        <div>
                          <p className="!text-sm !font-semibold !text-yellow-800 !mb-1">Rescheduled</p>
                          <p className="!text-sm !text-yellow-700">{classSession.reasonForReschedule}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancellation reason */}
                  {classSession.reasonForCancelation && isCanceled && (
                    <div className="!mt-3 !bg-red-50 !border-l-4 !border-red-400 !p-3 !rounded">
                      <div className="!flex !items-start !gap-2">
                        <AlertCircle className="!text-red-600 !flex-shrink-0 !mt-0.5" size={18} />
                        <div>
                          <p className="!text-sm !font-semibold !text-red-800 !mb-1">Canceled</p>
                          <p className="!text-sm !text-red-700">{classSession.reasonForCancelation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop action buttons */}
                {!isCanceled && (
                  <div className="flex flex-col gap-3 min-w-[180px]">
                    <input
                      type="file" accept="video/*" className="hidden"
                      ref={el => { fileInputRefs.current[classSession._id] = el; }}
                      onChange={e => onFileChange(classSession._id, e)}
                    />
                    {classSession.recordingUrl && (
                      <Link
                        href={`/tutor/classQuality/${classSession._id}`}
                        className="px-4 py-2.5 hover:opacity-90 rounded-lg transition-all flex items-center justify-center text-sm font-medium shadow-lg"
                        style={{ backgroundColor: "purple", color: "#ffffff" }}
                      >
                        <BarChart3 className="mr-2" size={16} />
                        Class Quality
                      </Link>
                    )}
                    <button
                      onClick={() => fileInputRefs.current[classSession._id]?.click()}
                      disabled={isUploading}
                      className="px-4 py-2.5 rounded-lg transition-all flex items-center justify-center text-sm font-medium shadow-lg"
                      style={{
                        backgroundColor: isUploading ? "blueviolet" : "blue",
                        color: "#ffffff",
                      }}
                    >
                      <Upload className="mr-2" size={16} />
                      {isUploading ? "Uploading..." : classSession.recordingUrl ? "Replace Recording" : "Upload Recording"}
                    </button>
                    <Link
                      href={`/tutor/createAssignment?classId=${classSession._id}&courseId=${courseId}`}
                      className="px-4 py-2.5 hover:opacity-90 rounded-lg transition-all flex items-center justify-center text-sm font-medium shadow-lg"
                      style={{ backgroundColor: "blueviolet", color: "#ffffff" }}
                    >
                      <FileText className="mr-2" size={16} />
                      Add Assignment
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

ClassCard.displayName = "ClassCard";

export default CourseDetailsPage;