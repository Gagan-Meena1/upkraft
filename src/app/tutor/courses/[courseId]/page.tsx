"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import {
  formatInTz,
  formatTimeRangeInTz,
  getUserTimeZone,
} from "@/helper/time";

// TypeScript interfaces for type safety
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
}

interface EditClassForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
}

const CourseDetailsPage = () => {
  const [courseData, setCourseData] = useState<CourseDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeTab, setActiveTab] = useState<"classes" | "curriculum">(
    "classes"
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editForm, setEditForm] = useState<EditClassForm>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    date: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");
  const [userTimezone, setUserTimezone] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [copyingClass, setCopyingClass] = useState<Class | null>(null);
  const params = useParams();
  const router = useRouter();

  // Helper function to format date and time
  /*
const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  
  // Use UTC methods to get the EXACT stored time
   const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  // For weekday, create a date object in UTC
  const utcDate = new Date(Date.UTC(year, month, day));
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = weekdays[utcDate.getUTCDay()];
  const monthName = months[month];
  
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
  console.log('DISPLAYING FROM UTC:', {
    originalString: dateTimeString,
    displayTime: timeStr,
    displayDate: `${weekday}, ${monthName} ${day}, ${year}`
  });
  
  return {
    date: `${weekday}, ${monthName} ${day}, ${year}`,
    time: timeStr  // Exact stored time: "14:30"
  };
};
*/

  const formatDateTime = (startTime: string, endTime: string) => {
    const tz = userTimezone || getUserTimeZone();

    const date = formatInTz(startTime, tz, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const timeRange = formatTimeRangeInTz(startTime, endTime, tz);

    return {
      date,
      time: timeRange,
    };
  };

  // Helper function to extract date and time for form inputs
  const extractDateTimeForForm = (dateTimeString: string) => {
    const date = new Date(dateTimeString);

    // Use UTC methods to get the EXACT stored time
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    console.log("EXTRACTING FROM UTC:", {
      originalString: dateTimeString,
      extractedTime: `${hours}:${minutes}`,
      extractedDate: `${year}-${month}-${day}`,
    });

    return {
      dateStr: `${year}-${month}-${day}`, // Exact: "2024-01-15"
      timeStr: `${hours}:${minutes}`, // Exact: "14:30"
    };
  };

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/Api/tutors/courses/${params.courseId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch course details");
        }

        const data = await response.json();
        setCourseData(data);
        setAcademyId(data.academyId || null); // Add this line
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    if (params.courseId) {
      fetchCourseDetails();
    }
  }, [params.courseId]);

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

  // Handle edit class
  const handleEditClass = (classSession: Class) => {
    setEditingClass(classSession);

    // Extract EXACT values using UTC methods
    const startDateTime = extractDateTimeForForm(classSession.startTime);
    const endDateTime = extractDateTimeForForm(classSession.endTime);

    console.log("EDITING CLASS - EXTRACTED VALUES:", {
      startTime: startDateTime.timeStr,
      endTime: endDateTime.timeStr,
      date: startDateTime.dateStr,
    });

    setEditForm({
      title: classSession.title,
      description: classSession.description,
      startTime: startDateTime.timeStr, // Exact: "14:30"
      endTime: endDateTime.timeStr, // Exact: "16:00"
      date: startDateTime.dateStr, // Exact: "2024-01-15"
    });
    setShowEditModal(true);
    setEditError("");
  };

  // Handle form change for edit modal
  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedForm = { ...editForm, [name]: value };
    setEditForm(updatedForm);

    // Validate time if start time, end time, or date changes
    if (name === "startTime" || name === "endTime") {
      const validationError = validateDateTime(
        updatedForm.date,
        updatedForm.startTime,
        updatedForm.endTime
      );
      setEditError(validationError);
    }
  };

  // Validate date and time
  const validateDateTime = (
    date: string,
    startTime: string,
    endTime: string
  ) => {
    if (!date || !startTime || !endTime) return "";

    const [year, month, day] = date.split("-").map(Number);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startDateTime = new Date(
      year,
      month - 1,
      day,
      startHour,
      startMinute
    );
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);
    const currentDateTime = new Date();

    // if (startDateTime <= currentDateTime) {
    //   return 'Start time cannot be in the past';
    // }

    if (endDateTime <= startDateTime) {
      return "End time must be after start time";
    }

    return "";
  };

  // Handle update class
  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    setIsUpdating(true);
    setEditError("");

    try {
      if (editForm.endTime <= editForm.startTime) {
        throw new Error("End time must be after start time");
      }

      console.log("UPDATING CLASS - SENDING VALUES:", {
        date: editForm.date, // "2024-01-15"
        startTime: editForm.startTime, // "14:30"
        endTime: editForm.endTime, // "16:00"
      });

      const response = await fetch(`/Api/classes?classId=${editingClass._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          date: editForm.date, // Send exact: "2024-01-15"
          startTime: editForm.startTime, // Send exact: "14:30"
          endTime: editForm.endTime, // Send exact: "16:00"
          timezone:
            userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update class");
      }

      toast.success("Class updated successfully!");
      setShowEditModal(false);
      setEditingClass(null);

      // Refresh data
      const refreshResponse = await fetch(
        `/Api/tutors/courses/${params.courseId}`
      );
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setCourseData(refreshedData);
      }
    } catch (error) {
      console.error("Error updating class:", error);
      setEditError(
        error instanceof Error ? error.message : "Failed to update class"
      );
    } finally {
      setIsUpdating(false);
    }
  };
  // Handle delete class
  const handleDeleteClass = async (classId: string, classTitle: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the class "${classTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/Api/classes?classId=${classId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete class");
      }

      toast.success("Class deleted successfully!");

      // Refresh the course data
      const refreshResponse = await fetch(
        `/Api/tutors/courses/${params.courseId}`
      );
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setCourseData(refreshedData);
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete class"
      );
    }
  };

  // Handle file upload
  const handleFileChange = async (
    classId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    console.log("File selected:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    const maxSize = 800 * 1024 * 1024; // 800MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 800MB");
      return;
    }

    setUploadLoading((prev) => ({ ...prev, [classId]: true }));
    console.log(`[${classId}] Starting upload process...`);

    try {
      // 1. Get presigned URL
      console.log(`[${classId}] Requesting presigned URL...`);
      const presignedUrlResponse = await axios.post(
        "/Api/upload/presigned-url",
        {
          fileName: file.name,
          fileType: file.type,
          classId: classId,
        }
      );

      const { publicUrl } = presignedUrlResponse.data;
      console.log(`[${classId}] Public URL: ${publicUrl}`);

      // 2. Upload file directly to S3
      console.log(`[${classId}] Starting direct upload to S3...`);
      await axios.put(presignedUrlResponse.data.uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${progress}%`);
          }
        },
      });

      toast.success("Recording uploaded successfully!");
      console.log(`[${classId}] Direct upload to S3 completed.`);

      // 3. save the public URL in mongoDB
      console.log(
        `[${classId}] Notifying mongoDB to update class with public URL: ${publicUrl}`
      );
      await axios.post("/Api/classes/update", {
        classId,
        recordingUrl: publicUrl,
      });

      console.log(`[${classId}] recordingUrl updated in mongoDB.`);

      // 4. Trigger background processing
      toast("Video evaluation and performance video generation have started.");

      // Trigger evaluation process (fire-and-forget)
      axios
        .post(`/Api/proxy/evaluate-video?item_id=${classId}`)
        .catch((evalError) => {
          console.error(
            `[${classId}] Failed to start evaluation:`,
            evalError.message
          );
          // We don't show a toast here as the component might be unmounted.
        });

      // Trigger highlight generation process (fire-and-forget)
      axios
        .post(`/Api/proxy/generate-highlights?item_id=${classId}`)
        .catch((highlightError) => {
          console.error(
            `[${classId}] Failed to start highlight generation:`,
            highlightError.message
          );
        });

      router.refresh();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      console.error(`[${classId}] Upload process failed:`, error.message);
      toast.error(error.response?.data?.error || "Failed to upload recording.");
    } finally {
      setUploadLoading((prev) => ({ ...prev, [classId]: false }));
      console.log(`[${classId}] Upload process finished.`);
      const inputRef = fileInputRefs.current[classId];
      if (inputRef) {
        inputRef.value = "";
      }
    }
  };

  const triggerFileInput = (classId: string) => {
    const inputRef = fileInputRefs.current[classId];
    if (inputRef) inputRef.click();
  };

  const getButtonText = (classSession: Class, isUploading: boolean) => {
    if (isUploading) return "Uploading...";
    return classSession.recordingUrl ? "Replace Recording" : "Upload Recording";
  };

  // Add delete course handler
  const handleDeleteCourse = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/Api/tutors/courses?courseId=${params.courseId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      toast.success("Course deleted successfully");
      router.push("/tutor/courses");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  const copyClass = async (classSession: Class) => {
    try {
      setCopyingClass(classSession);
      console.log(classSession)
      const startDateTime = extractDateTimeForForm(classSession.startTime);
      const endDateTime = extractDateTimeForForm(classSession.endTime);

      const formData = new FormData();
    formData.append("title", `${classSession.title} - copied`);
    formData.append("description", classSession.description || "");
    formData.append("date", startDateTime.dateStr);
    formData.append("startTime", startDateTime.timeStr);
    formData.append("endTime", endDateTime.timeStr);
    formData.append("courseId", String(params.courseId || "")); // ADD THIS LINE
    const timezoneToSend = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    formData.append("timezone", timezoneToSend);

      // Create duplicate
      const res = await fetch(`/Api/classes`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to copy class");
      }

      toast.success("Class duplicated!");
      const refreshed = await fetch(`/Api/tutors/courses/${params.courseId}`);
      if (refreshed.ok) {
        const refreshedData = await refreshed.json();
        setCourseData(refreshedData);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to copy class");
    } finally {
      setCopyingClass(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="!min-h-screen !bg-gradient-to-br !from-gray-100 !via-gray-200 !to-gray-300 !flex !items-center !justify-center !p-4">
        <div className="!text-lg !sm:text-2xl !font-semibold !text-gray-700 !text-center">
          Loading Course Details...
        </div>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="!min-h-screen !bg-gradient-to-br !from-gray-100 !via-gray-200 !to-gray-300 !flex !items-center !justify-center !p-4">
        <div className="!bg-white !p-6 !sm:p-8 !rounded-xl !shadow-lg !text-center !max-w-md !w-full">
          <div className="!text-xl !sm:text-2xl !font-semibold !text-red-600 !mb-4">
            Error Loading Course
          </div>
          <p className="!text-gray-700 !mb-6 !text-sm !sm:text-base">{error}</p>
          <Link
            href="/tutor"
            className="!inline-block !px-4 !sm:px-6 !py-2 !sm:py-3 !bg-gradient-to-r !from-blue-500 !to-purple-600 !text-white !rounded-lg !hover:from-blue-600 !hover:to-purple-700 !transition-colors !text-sm !sm:text-base"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-gray-100 !via-gray-200 !to-gray-300 !p-3 !sm:p-6">
      <div className="!max-w-6xl !mx-auto">
        {/* Header with Back Button */}
        <header className="!mb-6 !sm:mb-8">
          <div className="!flex !flex-col !sm:flex-row !sm:justify-between !sm:items-center !gap-4">
            <div className="!flex !items-center !space-x-3 !sm:space-x-4">
              <Link
                href={`/tutor/courses`}
                className="!p-2 !rounded-full !bg-gray-200 !hover:bg-gray-300 !transition-colors !shadow-md !flex-shrink-0"
              >
                <ChevronLeft className="!text-gray-700 !w-5 !h-5 !sm:w-6 !sm:h-6" />
              </Link>
              <h1 className="!text-xl !sm:text-2xl !lg:text-3xl !font-bold !text-gray-800 !break-words">
                {courseData.courseDetails.title}
              </h1>
            </div>
            <div className="!flex !flex-col !sm:flex-row !items-stretch !sm:items-center !gap-2 !sm:gap-3">
              {!academyId && (
                <Link
                  href={`/tutor/classes/?courseId=${courseData.courseDetails._id}`}
                >
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
            <div>
              <h2 className="!text-lg !sm:text-xl !font-semibold !text-gray-800 !flex !items-center">
                <BookOpen className="!mr-2 !text-gray-600 !w-5 !h-5 !sm:w-6 !sm:h-6" />
                Course Overview
              </h2>
            </div>
            <div className="!text-gray-600 !text-sm !sm:text-base">
              <div className="!flex !flex-col !sm:flex-row !gap-2 !sm:gap-4">
                <span>
                  <span className="!font-medium">Duration:</span>{" "}
                  {courseData.courseDetails.duration}
                </span>
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
                activeTab === "classes"
                  ? "!bg-blue-500 !text-white !shadow-md"
                  : "!text-gray-600 !hover:text-gray-800"
              }`}
            >
              Classes
            </button>
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`!flex-1 !py-2 !px-4 !rounded-md !font-medium !transition-all !duration-200 !text-sm !sm:text-base ${
                activeTab === "curriculum"
                  ? "!bg-blue-500 !text-white !shadow-md"
                  : "!text-gray-600 !hover:text-gray-800"
              }`}
            >
              Curriculum
            </button>
          </div>
        </div>

        {/* Classes Section */}
        {activeTab === "classes" && (
          <section>
            <h2 className="!text-xl !sm:text-2xl !font-bold !text-gray-800 !mb-4 !sm:mb-6">
              Course Classes
            </h2>

            <div className="!space-y-4 !sm:space-y-6">
              {courseData.classDetails.map((classSession) => {
                const { date, time } = formatDateTime(
                  classSession.startTime,
                  classSession.endTime
                );
                const isUploading = uploadLoading[classSession._id] || false;

                return (
                  <div
                    key={classSession._id}
                    className="!bg-white !rounded-xl !shadow-md !hover:shadow-xl !transition-shadow"
                  >
                    <div className="!p-4 !sm:p-6">
                      {/* Mobile Layout */}
                      <div className="block lg:hidden !text-gray-800">
                        <div className="!flex !gap-3">
                          {/* Edit/Delete Icons on extreme left */}
                          <div className="!flex !flex-col !gap-2">
                            <button
                              onClick={() => handleEditClass(classSession)}
                              className="!p-1 !text-blue-500 !hover:text-blue-700 !hover:bg-blue-50 !rounded-full !transition-colors group relative"
                              title="Edit class"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteClass(
                                  classSession._id,
                                  classSession.title
                                )
                              }
                              className="!p-1 !text-red-500 !hover:text-red-700 !hover:bg-red-50 !rounded-full !transition-colors group relative"
                              title="Delete class"
                            >
                              <Trash2 size={16} />
                            </button>

                            {/* Copy icon below Delete (mobile) - icon only */}
                            <button
                              onClick={() => copyClass(classSession)}
                              className="!p-1 !text-gray-600 !hover:text-gray-800 !hover:bg-gray-50 !rounded-full !transition-colors"
                              title="Copy class"
                              disabled={!!copyingClass}
                            >
                              {copyingClass ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700"></div>
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </div>

                          {/* Content Area */}
                          <div className="flex-1 !space-y-4">
                            {/* Date and Time */}
                            <div className="!bg-gray-100 !rounded-lg !p-3 !text-center">
                              <div className="!text-sm !font-bold !text-gray-800">
                                {date}
                              </div>
                              <div className="!text-xs !text-gray-600">
                                {time}
                              </div>
                            </div>

                            {/* Session Details */}
                            <div>
                              <h3 className="!text-lg !font-semibold !text-gray-800 !mb-2">
                                {classSession.title}
                              </h3>
                              <p className="!text-gray-600 !text-sm !leading-relaxed">
                                {classSession.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="!flex !flex-col !gap-2 !ml-10">
                          {/* Hidden file input */}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            ref={(el) => {
                              fileInputRefs.current[classSession._id] = el;
                            }}
                            onChange={(e) =>
                              handleFileChange(classSession._id, e)
                            }
                          />

                          <div className="!flex !gap-2">
                            {/* Class Quality button */}
                            {classSession.recordingUrl && (
                              <Link
                                href={`/tutor/classQuality/${classSession._id}`}
                                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center text-xs"
                              >
                                <BarChart3 className="!mr-1" size={14} />
                                Quality
                              </Link>
                            )}

                            {/* Upload Recording button */}
                            <button
                              onClick={() => triggerFileInput(classSession._id)}
                              disabled={isUploading}
                              className={`flex-1 px-3 py-2 ${
                                isUploading
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-purple-500 hover:bg-purple-600"
                              } text-white rounded-lg transition-colors flex items-center justify-center text-xs`}
                            >
                              <Upload className="!mr-1" size={14} />
                              {getButtonText(classSession, isUploading)}
                            </button>

                            {/* Copy moved to icon column - removed duplicate textual copy button */}
                          </div>

                          {/* Assignment Button */}
                          <Link
                            href={`/tutor/createAssignment?classId=${classSession._id}&courseId=${courseData.courseDetails._id}`}
                            style={{
                              backgroundColor: "#fb923c",
                              color: "#ffffff",
                            }}
                            className="w-full px-3 py-2 hover:opacity-90 rounded-lg transition-all flex items-center justify-center text-xs font-medium shadow-sm"
                          >
                            <FileText className="mr-1" size={14} />
                            Add Assignment
                          </Link>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:block">
                        <div className="!flex !gap-6 !items-center">
                          {/* Edit/Delete Icons on extreme left */}
                          <div className="!flex !flex-col !gap-2">
                            <button
                              onClick={() => handleEditClass(classSession)}
                              className="!p-1 !text-blue-500 !hover:text-blue-700 !hover:bg-blue-50 !rounded-full !transition-colors group relative"
                              title="Edit class"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteClass(
                                  classSession._id,
                                  classSession.title
                                )
                              }
                              className="!p-1 !text-red-500 !hover:text-red-700 !hover:bg-red-50 !rounded-full !transition-colors group relative"
                              title="Delete class"
                            >
                              <Trash2 size={18} />
                            </button>
                            {/* Copy icon below Delete (desktop) - icon only */}
                            <button
                              onClick={() => copyClass(classSession)}
                              className="!p-1 !text-gray-600 !hover:text-gray-800 !hover:bg-gray-50 !rounded-full !transition-colors"
                              title="Copy class"
                              disabled={!!copyingClass}
                            >
                              {copyingClass ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700"></div>
                              ) : (
                                <Copy size={18} />
                              )}
                            </button>
                          </div>

                          {/* Date and Time */}
                          <div className="!bg-gray-100 !rounded-lg !p-4 !text-center !min-w-[200px]">
                            <div className="!text-xl !font-bold !text-gray-800">
                              {date}
                            </div>
                            <div className="!text-gray-600">{time}</div>
                          </div>

                          {/* Session Details */}
                          <div className="flex-1">
                            <h3 className="!text-xl !font-semibold !text-gray-800 !mb-2">
                              {classSession.title}
                            </h3>
                            <p className="!text-gray-600">
                              {classSession.description}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-3 min-w-[180px]">
                            {/* Hidden file input */}
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              ref={(el) => {
                                fileInputRefs.current[classSession._id] = el;
                              }}
                              onChange={(e) =>
                                handleFileChange(classSession._id, e)
                              }
                            />

                            {/* Class Quality button */}
                            {classSession.recordingUrl && (
                              <Link
                                href={`/tutor/classQuality/${classSession._id}`}
                                style={{
                                  backgroundColor: "purple",
                                  color: "#ffffff",
                                }}
                                className="px-4 py-2.5 hover:opacity-90 rounded-lg transition-all flex items-center justify-center text-sm font-medium shadow-lg"
                              >
                                <BarChart3 className="mr-2" size={16} />
                                Class Quality
                              </Link>
                            )}

                            {/* Upload Recording button */}
                            <button
                              onClick={() => triggerFileInput(classSession._id)}
                              disabled={isUploading}
                              style={{
                                backgroundColor: isUploading
                                  ? "blueviolet"
                                  : "blue",
                                color: "#ffffff",
                              }}
                              className={`px-4 py-2.5 rounded-lg transition-all flex items-center justify-center text-sm font-medium shadow-lg ${
                                isUploading
                                  ? "cursor-not-allowed"
                                  : "hover:opacity-90"
                              }`}
                            >
                              <Upload className="mr-2" size={16} />
                              {getButtonText(classSession, isUploading)}
                            </button>

                            {/* Copy Class button */}
                            {/* <button
                              onClick={() => copyClass(classSession._id)}
                              disabled={!!copyingClassId}
                              title="Copy class"
                              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-2 justify-center"
                            >
                              {copyingClassId === classSession._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700"></div>
                              ) : (
                                <Copy className="mr-2" size={16} />
                              )}
                              Copy
                            </button> */}

                            {/* Assignment Button */}
                            <Link
                              href={`/tutor/createAssignment?classId=${classSession._id}&courseId=${courseData.courseDetails._id}`}
                              style={{
                                backgroundColor: "blueviolet",
                                color: "#ffffff",
                              }}
                              className="px-4 py-2.5 hover:opacity-90 rounded-lg transition-all flex items-center justify-center text-sm font-medium shadow-lg"
                            >
                              <FileText className="mr-2" size={16} />
                              Add Assignment
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Curriculum Section */}
        {activeTab === "curriculum" && (
          <section>
            <h2 className="!text-xl !sm:text-2xl !font-bold !text-gray-800 !mb-4 !sm:mb-6">
              Course Curriculum
            </h2>

            <div className="!bg-white !rounded-xl !shadow-lg !p-4 !sm:p-6">
              {courseData.courseDetails.curriculum &&
              courseData.courseDetails.curriculum.length > 0 ? (
                <div className="!space-y-4">
                  {courseData.courseDetails.curriculum.map((item, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4 py-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          Lesson {item.sessionNo}
                        </span>
                        <h3 className="!text-lg !font-semibold !text-gray-800">
                          {item.topic}
                        </h3>
                      </div>
                      <p className="!text-gray-600 !mt-2 !text-sm !sm:text-base">
                        <span className="!font-medium">Outcome:</span>{" "}
                        {item.tangibleOutcome}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="!text-center !py-8">
                  <BookOpen className="!mx-auto !h-12 !w-12 !text-gray-400 !mb-4" />
                  <p className="!text-gray-500 !text-lg">
                    No curriculum available
                  </p>
                  <p className="!text-gray-400 !text-sm">
                    The curriculum for this course hasn't been set up yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Edit Class Modal */}
        {showEditModal && editingClass && (
          <div className="fixed inset-0 bg-black text-gray-800 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="!bg-white !rounded-xl !shadow-xl !max-w-md !w-full !max-h-[90vh] !overflow-y-auto">
              <div className="!p-6">
                <div className="!flex !justify-between !items-center !mb-4">
                  <h3 className="!text-lg !font-semibold !text-gray-800">
                    Edit Class
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="!p-1 !hover:bg-gray-100 !rounded-full !transition-colors"
                  >
                    <X size={20} className="!text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleUpdateClass} className="!space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={editForm.date}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={editForm.startTime}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={editForm.endTime}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {editError && (
                    <div className="!text-red-600 !text-sm !bg-red-50 !p-3 !rounded-md">
                      {editError}
                    </div>
                  )}

                  <div className="!flex !gap-3 !pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating || !!editError}
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
                      ) : (
                        "Update Class"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailsPage;
