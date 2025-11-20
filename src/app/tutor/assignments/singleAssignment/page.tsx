"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Download,
  Users,
  BookOpen,
  Music,
  Gauge,
  Zap,
  Home,
  X,
  Upload,
  Star, // Add Star icon
} from "lucide-react";
import Link from "next/link";
import { Button } from "react-bootstrap";

interface Student {
  userId: string;
  username: string;
  email: string;
  submissionStatus: "PENDING" | "SUBMITTED" | "APPROVED" | "CORRECTION";
  submissionMessage: string; // will hold API studentMessage
  submissionFileUrl: string;
  submissionFileName: string;
  tutorRemarks: string;
  submittedAt?: string;
  rating?: number; // ADD THIS
  ratingMessage?: string; // ADD THIS
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status?: boolean;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  songName?: string;
  metronome?: number;
  speed?: number;
  practiceStudio?: boolean;
  class: {
    _id: string;
    title: string;
    description: string;
    startTime?: string;
    endTime?: string;
  };
  course: {
    _id: string;
    title: string;
    category: string;
  };
  assignedStudents: Student[];
  totalAssignedStudents: number;
  submissions?: any[]; // Add submissions array
}

// Separate component that uses useSearchParams
function AssignmentDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "submitted" | "approved" | "pending" | "correction"
  >("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [approvalLoading, setApprovalLoading] = useState(false);

  // NEW: correction modal state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionMessage, setCorrectionMessage] = useState("");
  const [correctionForStudentId, setCorrectionForStudentId] = useState<
    string | null
  >(null);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [correctionFile, setCorrectionFile] = useState<File | null>(null); // NEW

  // NEW: approve modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveForStudentId, setApproveForStudentId] = useState<string | null>(null);
  const [approveRatingValue, setApproveRatingValue] = useState<number>(5);
  const [approveRatingMessage, setApproveRatingMessage] = useState<string>("");
  const [approveError, setApproveError] = useState<string | null>(null);

  // ADD: helper to detect editing mode
  const isEditingRating = approveForStudentId
    ? assignment?.assignedStudents.find(s => s.userId === approveForStudentId)?.submissionStatus === "APPROVED"
    : false;

  // UPDATED: openApproveModal (accept edit flag)
  const openApproveModal = (studentId: string, isEdit = false) => {
    setApproveForStudentId(studentId);
    const existing = assignment?.assignedStudents.find(s => s.userId === studentId);
    if (isEdit && existing) {
      if (existing.rating != null) setApproveRatingValue(existing.rating);
      else setApproveRatingValue(5);
      setApproveRatingMessage(existing.ratingMessage || "");
    } else {
      // fresh approval
      setApproveRatingValue(5);
      setApproveRatingMessage("");
    }
    setApproveError(null);
    setShowApproveModal(true);
  };

  const submitApprove = async () => {
    if (!approveForStudentId) return;
    setApprovalLoading(true);
    setApproveError(null);
    try {
      const response = await fetch(
        `/Api/assignment/singleAssignment?assignmentId=${assignmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: approveForStudentId,
            action: "APPROVED",
            rating: approveRatingValue,
            ratingMessage: approveRatingMessage,
            tutorRemarks: approveRatingMessage || "Well done!",
          }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save rating");
      }
      setAssignment(prev => mergeAssignment(prev, data.data)); // immediate UI update
      setShowApproveModal(false);
      setApproveForStudentId(null);
      setApproveRatingValue(5);
      setApproveRatingMessage("");
    } catch (err: any) {
      setApproveError(err.message || "Failed to save rating");
    } finally {
      setApprovalLoading(false);
    }
  };

  // Helper to safely merge server payload with local state
  const mergeAssignment = (
    prev: Assignment | null,
    server: any
  ): Assignment => {
    const base: Assignment = {
      ...(prev as any),
      ...(server as any),
    };

    const assigned =
      (server?.assignedStudents?.length
        ? server.assignedStudents
        : prev?.assignedStudents) || [];

    const submissions =
      server?.submissions !== undefined
        ? server.submissions
        : prev?.submissions || [];

    const mergedStudents: Student[] = assigned.map((st: any) => {
      const sub = submissions.find((s: any) => {
        const sid =
          s?.studentId?._id?.toString?.() ??
          s?.studentId?.toString?.() ??
          s?.studentId;
        return sid === st.userId;
      });

      return {
        userId: st.userId,
        username: st.username,
        email: st.email,
        submissionStatus: sub?.status ?? st.submissionStatus ?? "PENDING",
        submissionMessage: sub?.studentMessage ?? st.submissionMessage ?? "",
        submissionFileUrl: sub?.fileUrl ?? st.submissionFileUrl ?? "",
        submissionFileName: sub?.fileName ?? st.submissionFileName ?? "",
        tutorRemarks: sub?.tutorRemarks ?? st.tutorRemarks ?? "",
        submittedAt: sub?.submittedAt ?? st.submittedAt,
        rating: sub?.rating, // ADD THIS
        ratingMessage: sub?.ratingMessage, // ADD THIS
      };
    });

    return {
      ...base,
      assignedStudents: mergedStudents,
      submissions,
    };
  };

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      if (!assignmentId) {
        setError("Assignment ID not provided");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/Api/assignment/singleAssignment?assignmentId=${assignmentId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch assignment details");
        }

        const data = await response.json();

        if (data.success) {
          // Merge server data with submission details
          setAssignment((prev) => mergeAssignment(prev, data.data));
        } else {
          throw new Error(data.message || "Failed to fetch assignment details");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentDetail();
  }, [assignmentId]);

  // Filter students based on submission status
  const filteredStudents =
    assignment?.assignedStudents?.filter((student) => {
      if (activeTab === "all") return true;
      return student.submissionStatus === activeTab.toUpperCase();
    }) || [];

  const selectedSubmission = assignment?.assignedStudents?.find(
    (s) => s.userId === selectedStudentId
  );

  // Handle tutor actions (approve/correction)
  const handleTutorAction = async (
    studentId: string,
    action: "APPROVED" | "CORRECTION",
    tutorRemarks?: string
  ) => {
    setApprovalLoading(true);
    try {
      const response = await fetch(
        `/Api/assignment/singleAssignment?assignmentId=${assignmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            action,
            tutorRemarks:
              tutorRemarks ??
              (action === "CORRECTION"
                ? "Please revise and resubmit."
                : "Well done!"),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Update failed");
      }

      setAssignment((prev) => mergeAssignment(prev, data.data));
    } catch (error: any) {
      console.error("Error updating submission:", error);
      alert(error.message || "Failed to update submission status");
    } finally {
      setApprovalLoading(false);
    }
  };

  // NEW: open/close helpers
  const openCorrectionModal = (studentId: string) => {
    setCorrectionForStudentId(studentId);
    setCorrectionMessage("");
    setCorrectionError(null);
    setShowCorrectionModal(true);
  };
  const closeCorrectionModal = () => {
    if (!approvalLoading) {
      setShowCorrectionModal(false);
      setCorrectionForStudentId(null);
      setCorrectionMessage("");
      setCorrectionError(null);
    }
  };
  const submitCorrection = async () => {
    if (!correctionMessage.trim()) {
      setCorrectionError("Please enter a message.");
      return;
    }
    if (!correctionForStudentId) return;

    setApprovalLoading(true);
    try {
      let response, data;
      if (correctionFile) {
        // Use FormData if file is attached
        const formData = new FormData();
        formData.append("studentId", correctionForStudentId);
        formData.append("action", "CORRECTION");
        formData.append("tutorRemarks", correctionMessage);
        formData.append("correctionFile", correctionFile);
        formData.append("submissionMessage", "SUBMITTED");

        response = await fetch(
          `/Api/assignment/singleAssignment?assignmentId=${assignmentId}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        // Fallback to JSON if no file
        response = await fetch(
          `/Api/assignment/singleAssignment?assignmentId=${assignmentId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: correctionForStudentId,
              action: "CORRECTION",
              tutorRemarks: correctionMessage,
            }),
          }
        );
      }
      data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send correction");
      }
      setAssignment((prev) => mergeAssignment(prev, data.data));
      setShowCorrectionModal(false);
      setCorrectionForStudentId(null);
      setCorrectionFile(null);
    } catch (err: any) {
      setCorrectionError(err.message || "Failed to send correction");
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleDownloadFile = () => {
    if (assignment?.fileUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = assignment.fileUrl;
      link.download = assignment.fileName || "assignment-file";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadSubmission = (fileUrl: string, fileName: string) => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "submission-file";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Overdue";
    } else if (diffDays === 0) {
      return "Due Today";
    } else if (diffDays === 1) {
      return "1 Day Left";
    } else if (diffDays <= 7) {
      return `${diffDays} Days Left`;
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `${weeks} Week${weeks > 1 ? "s" : ""} Left`;
    } else {
      const months = Math.ceil(diffDays / 30);
      return `${months} Month${months > 1 ? "s" : ""} Left`;
    }
  };

  const getDeadlineColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-600 bg-red-50";
    if (diffDays <= 2) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Link
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
            href="/tutor/assignments"
          >
            <ArrowLeft size={20} />
            Back to Assignments
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FileText size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Assignment Not Found
            </h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="!p-6 !bg-gray-50 !min-h-screen">
      <div className="!max-w-4xl !mx-auto">
        {/* Back Button */}
        <Link
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
          href="/tutor/assignments"
        >
          <ArrowLeft size={20} />
          Back to Assignments
        </Link>

        {/* Header Card */}
        <div className="!bg-white !rounded-lg !shadow-sm !p-6 !mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="!w-16 !h-16 !bg-purple-100 !rounded-full !flex !items-center !justify-center">
                <BookOpen size={32} className="!text-purple-600" />
              </div>
              <div>
                <h1 className="!text-2xl !font-bold !text-gray-900 !mb-1">
                  {assignment?.title || "Loading..."}
                </h1>
                <p className="!text-gray-600">
                  {assignment?.course?.title || ""}{" "}
                  {assignment?.course?.title && assignment?.class?.title
                    ? "•"
                    : ""}{" "}
                  {assignment?.class?.title || ""}
                </p>
              </div>
            </div>
            <div className="!flex !items-center !gap-2">
              {assignment?.course?.category && (
                <span className="!px-3 !py-1 !text-sm !font-medium !bg-blue-100 !text-blue-800 !rounded-full">
                  {assignment.course.category}
                </span>
              )}
              {assignment?.status && (
                <span className="!px-3 !py-1 !text-sm !font-medium !bg-green-100 !text-green-800 !rounded-full">
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Assignment Info Grid - Two rows: original 3 fields, then 4 new fields */}
          <div className="!space-y-4">
            {/* First Row: Original Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="!flex !items-center !gap-3 !p-3 !bg-gray-50 !rounded-lg">
                <Calendar size={20} className="!text-purple-500" />
                <div>
                  <p className="!text-sm !text-gray-600">Assigned Date</p>
                  <p className="!font-medium !text-gray-800">
                    {assignment?.createdAt
                      ? formatDate(assignment.createdAt)
                      : "Loading..."}
                  </p>
                </div>
              </div>

              <div className="!flex !items-center !gap-3 !p-3 !bg-gray-50 !rounded-lg">
                <Clock size={20} className="!text-orange-500" />
                <div>
                  <p className="!text-sm !text-gray-600">Deadline</p>
                  <p className="!font-medium !text-gray-800">
                    {assignment?.deadline
                      ? formatDate(assignment.deadline)
                      : "Loading..."}
                  </p>
                </div>
              </div>

              <div className="!flex !items-center !gap-3 !p-3 !bg-gray-50 !rounded-lg">
                <Users size={20} className="!text-blue-500" />
                <div>
                  <p className="!text-sm !text-gray-600">Students</p>
                  <p className="!font-medium !text-gray-800">
                    {assignment?.totalAssignedStudents || 0} Students
                  </p>
                </div>
              </div>
            </div>

            {/* Second Row: New Music Fields */}
            <div className="!grid !grid-cols-1 md:!grid-cols-4 !gap-4">
              {/* Song Name Field */}
              <div className="!flex !items-center !gap-3 !p-3 !bg-gray-50 !rounded-lg">
                <Music size={20} className="!text-green-500" />
                <div>
                  <p className="!text-sm !text-gray-600">Song Name</p>
                  <p className="!font-medium !text-gray-800">
                    {assignment?.songName || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Metronome Percentage Field */}
              <div className="!flex !items-center !gap-3 !p-3 !bg-gray-50 !rounded-lg">
                <Gauge size={20} className="!text-indigo-500" />
                <div>
                  <p className="!text-sm !text-gray-600">Metronome</p>
                  <p className="!font-medium !text-gray-800">
                    {assignment?.metronome !== undefined
                      ? `${assignment.metronome}`
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {/* Speed Field */}
              <div className="!flex !items-center !gap-3 !p-3 !bg-gray-50 !rounded-lg">
                <Zap size={20} className="!text-yellow-500" />
                <div>
                  <p className="!text-sm !text-gray-600">Speed</p>
                  <p className="!font-medium !text-gray-800">
                    {assignment?.speed || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Practice Studio Field */}
              <div className="!flex !items-center !gap-3 !p-3 !bg-gray-50 !rounded-lg">
                <Home size={20} className="!text-pink-500" />
                <div>
                  <p className="!text-sm !text-gray-600">Practice Studio</p>
                  <p className="!font-medium !text-gray-800">
                    {assignment?.practiceStudio !== undefined
                      ? assignment.practiceStudio
                        ? "Yes"
                        : "No"
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deadline Status */}
          <div className="!mt-4">
            {assignment?.deadline && (
              <div
                className={`!inline-flex !items-center !gap-2 !px-3 !py-1 !rounded-full !text-sm !font-medium ${getDeadlineColor(
                  assignment.deadline
                )}`}
              >
                <Clock size={16} />
                {formatDeadline(assignment.deadline)}
              </div>
            )}
          </div>
        </div>

        {/* Assignment Instructions */}
        <div className="!bg-white !rounded-lg !shadow-sm !p-6 !mb-6">
          <h2 className="!text-xl !font-semibold !text-gray-900 !mb-4">
            Assignment Instructions
          </h2>

          {/* Assignment description from API */}
          <div className="!text-gray-700 !whitespace-pre-wrap">
            {assignment?.description || "No instructions provided"}
          </div>
        </div>

        {/* File Attachment */}
        {assignment?.fileUrl && (
          <div className="!bg-white !rounded-lg !shadow-sm !p-6 !mb-6">
            <h2 className="!text-xl !font-semibold !text-gray-900 !mb-4">
              Assignment Files
            </h2>
            <div className="!flex !items-center !gap-3 !p-4 !border !border-gray-200 !rounded-lg">
              <FileText size={24} className="!text-purple-500" />
              <div className="!flex-1">
                <p className="!font-medium !text-gray-900">
                  {assignment.fileName || "Attached file"}
                </p>
                <p className="!text-sm !text-gray-600">Attached file</p>
              </div>
              <button
                onClick={handleDownloadFile}
                className="!px-4 !py-2 !bg-purple-600 !text-white !rounded-lg !hover:bg-purple-700 !transition-colors !flex !items-center !gap-2"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        )}

        {/* Assigned Students */}
        <div className="!bg-white !rounded-lg !shadow-sm !p-6">
          <h2 className="!text-xl !font-semibold !text-gray-900 !mb-4">
            Assigned Students ({assignment?.totalAssignedStudents || 0})
          </h2>

          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit mb-6 gap-2">
            <Button
              onClick={() => setActiveTab("all")}
              className={`!px-6 !py-2 !rounded-md !font-medium !transition-all ${
                activeTab === "all"
                  ? "!bg-purple-600 !text-white !shadow"
                  : "!text-gray-700 hover:!text-purple-700 !bg-gray-100"
              }`}
            >
              All ({assignment?.assignedStudents?.length || 0})
            </Button>
            <Button
              onClick={() => setActiveTab("pending")}
              className={`!px-6 !py-2 !rounded-md !font-medium !transition-all ${
                activeTab === "pending"
                  ? "!bg-gray-500 !text-white !shadow"
                  : "!text-gray-700 hover:!text-gray-600 !bg-gray-100"
              }`}
            >
              Pending (
              {assignment?.assignedStudents?.filter(
                (s) => s.submissionStatus === "PENDING"
              ).length || 0}
              )
            </Button>
            <Button
              onClick={() => setActiveTab("submitted")}
              className={`!px-6 !py-2 !rounded-md !font-medium !transition-all ${
                activeTab === "submitted"
                  ? "!bg-blue-500 !text-white !shadow"
                  : "!text-gray-700 hover:!text-blue-600 !bg-gray-100"
              }`}
            >
              Submitted (
              {assignment?.assignedStudents?.filter(
                (s) => s.submissionStatus === "SUBMITTED"
              ).length || 0}
              )
            </Button>
            <Button
              onClick={() => setActiveTab("approved")}
              className={`!px-6 !py-2 !rounded-md !font-medium !transition-all ${
                activeTab === "approved"
                  ? "!bg-green-600 !text-white !shadow"
                  : "!text-gray-700 hover:!text-green-700 !bg-gray-100"
              }`}
            >
              Approved (
              {assignment?.assignedStudents?.filter(
                (s) => s.submissionStatus === "APPROVED"
              ).length || 0}
              )
            </Button>
            <Button
              onClick={() => setActiveTab("correction")}
              className={`!px-6 !py-2 !rounded-md !font-medium !transition-all ${
                activeTab === "correction"
                  ? "!bg-orange-500 !text-white !shadow"
                  : "!text-gray-700 hover:!text-orange-600 !bg-gray-100"
              }`}
            >
              Correction (
              {assignment?.assignedStudents?.filter(
                (s) => s.submissionStatus === "CORRECTION"
              ).length || 0}
              )
            </Button>
          </div>

          {/* Students List */}
          {filteredStudents.length > 0 ? (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.userId}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedStudentId === student.userId
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200"
                  }`}
                  onClick={() =>
                    setSelectedStudentId(
                      student.userId === selectedStudentId
                        ? null
                        : student.userId
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="!w-10 !h-10 !rounded-full !bg-purple-100 !flex !items-center !justify-center">
                        <User size={20} className="!text-purple-600" />
                      </div>
                      <div>
                        <p className="!font-medium !text-gray-900">
                          {student.username}
                        </p>
                        <p className="!text-sm !text-gray-600">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 relative">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          student.submissionStatus === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : student.submissionStatus === "CORRECTION"
                            ? "bg-orange-100 text-orange-700"
                            : student.submissionStatus === "SUBMITTED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {student.submissionStatus}
                      </span>
                      {student.submissionFileName && (
                        <FileText size={16} className="text-purple-500" />
                      )}
                    </div>
                  </div>

                  {/* Submission Details (shown when selected) */}
                  {selectedStudentId === student.userId &&
                    student.submissionStatus !== "PENDING" && (
                      <div className="mt-4 p-4 bg-white border rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Submission Details
                        </h4>

                        {/* RATING AND FEEDBACK (NEW) */}
                        {student.submissionStatus === "APPROVED" &&
                          student.rating != null && (
                            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <div className="flex items-start justify-between">
                                <label className="text-sm font-medium text-purple-800 block mb-2">
                                  Final Rating & Feedback
                                </label>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openApproveModal(student.userId, true);
                                  }}
                                  className="text-xs px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 transition"
                                  disabled={approvalLoading}
                                >
                                  Edit
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Star
                                  className="text-yellow-500"
                                  fill="currentColor"
                                  size={20}
                                />
                                <span className="text-lg font-bold text-purple-900">
                                  {student.rating}
                                </span>
                                <span className="text-gray-600">/ 10</span>
                              </div>
                              {student.ratingMessage && (
                                <div className="text-gray-800 whitespace-pre-wrap text-sm">
                                  {student.ratingMessage}
                                </div>
                              )}
                            </div>
                          )}

                        {/* Student Message */}
                        {student.submissionMessage && (
                          <div className="mb-4">
                            <label className="!text-sm !font-medium !text-gray-600 !block !mb-2">
                              Student Message:
                            </label>
                            <div className="!bg-gray-50 !p-3 !rounded-lg !text-gray-800 !whitespace-pre-wrap">
                              {student.submissionMessage}{" "}
                              {/* FIX: was student.studentMessage */}
                            </div>
                          </div>
                        )}

                        {/* File Download */}
                        {student.submissionFileUrl && (
                          <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600 block mb-2">
                              Submitted File:
                            </label>
                            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <FileText size={20} className="text-purple-500" />
                              <div className="flex-1">
                                <p className="!font-medium !text-gray-900">
                                  {student.submissionFileName ||
                                    "Submitted file"}
                                </p>
                                <p className="!text-sm !text-gray-600">
                                  {student.submittedAt
                                    ? `Submitted on ${new Date(
                                        student.submittedAt
                                      ).toLocaleDateString()}`
                                    : "Submission file"}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadSubmission(
                                    student.submissionFileUrl,
                                    student.submissionFileName
                                  );
                                }}
                                className="!px-4 !py-3 !bg-purple-600 !text-white !rounded-lg hover:!bg-purple-700 !transition-colors !flex !items-center !gap-2"
                              >
                                <Download size={16} />
                                Download
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Tutor Remarks */}
                        {student.tutorRemarks && (
                          <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600 block mb-2">
                              Tutor Remarks:
                            </label>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-gray-800">
                              {student.tutorRemarks}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons (only for submitted assignments) */}
                        {student.submissionStatus === "SUBMITTED" && (
                          <div className="flex gap-3 pt-3 border-t">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openApproveModal(student.userId, false);
                              }}
                              disabled={approvalLoading}
                              className="!px-4 !py-3 !bg-green-600 !text-white !rounded-lg hover:!bg-green-700 !transition-colors disabled:!opacity-50 !flex !items-center !gap-2"
                            >
                              {approvalLoading && approveForStudentId === student.userId
                                ? "Opening..."
                                : "Approve"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openCorrectionModal(student.userId);
                              }}
                              disabled={approvalLoading}
                              className="!px-4 !py-3 !bg-orange-600 !text-white !rounded-lg hover:!bg-orange-700 !transition-colors disabled:!opacity-50 !flex !items-center !gap-2"
                            >
                              {approvalLoading && correctionForStudentId === student.userId
                                ? "Processing..."
                                : "Send for Correction"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <div className="!text-center !py-8 !text-gray-500">
              No students found for this filter
            </div>
          )}
        </div>
      </div>

      {/* NEW: Correction Message Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeCorrectionModal}
          />
          {/* Panel */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-purple-700">
              <h2 className="text-lg font-bold text-white">
                Send for Correction
              </h2>
              <button
                onClick={closeCorrectionModal}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                disabled={approvalLoading}
              >
                <X size={22} />
              </button>
            </div>
            {/* Body */}
            <div className="px-6 py-6">
              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-700">
                  Message to student
                </label>
                <textarea
                  className="!w-full !border !rounded !p-2 focus:!ring-2 focus:!ring-purple-500 focus:!border-transparent !transition-all"
                  rows={4}
                  placeholder="Explain what needs to be improved..."
                  value={correctionMessage}
                  onChange={(e) => setCorrectionMessage(e.target.value)}
                  disabled={approvalLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-700">
                  Attach File (optional)
                </label>
                <label
                  htmlFor="correctionFileInput"
                  className="block cursor-pointer border-2 border-dashed border-purple-300 rounded-xl p-6 bg-gray-50 hover:border-purple-500 transition-all text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-purple-400 mb-2" />
                    <span className="text-gray-600 font-medium">
                      {correctionFile
                        ? correctionFile.name
                        : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      All file types accepted
                    </span>
                  </div>
                  <input
                    id="correctionFileInput"
                    type="file"
                    onChange={(e) =>
                      setCorrectionFile(e.target.files?.[0] || null)
                    }
                    disabled={approvalLoading}
                    className="opacity-0 cursor-pointer"
                    tabIndex={-1}
                  />
                </label>
                {correctionFile && (
                  <div className="text-sm text-gray-600 mt-2">
                    Selected file:{" "}
                    <span className="font-medium">{correctionFile.name}</span>
                  </div>
                )}
              </div>
              {correctionError && (
                <div className="text-red-600 text-sm mb-2">
                  {correctionError}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={closeCorrectionModal}
                disabled={approvalLoading}
                className="!px-4 !py-2 !rounded-lg !text-gray-700 !bg-gray-100 hover:!bg-gray-200 !font-medium !transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitCorrection}
                disabled={approvalLoading}
                className="!px-4 !py-2 !rounded-lg !bg-orange-600 !text-white !font-semibold hover:!bg-orange-700 !transition-all disabled:!opacity-50"
              >
                {approvalLoading ? "Sending..." : "Send Correction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Approve (rating) modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !approvalLoading && setShowApproveModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-600 to-green-700">
              <h2 className="text-lg font-bold text-white">
                {isEditingRating ? "Edit Rating" : "Approve & Rate"}
              </h2>
              <button
                onClick={() => !approvalLoading && setShowApproveModal(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                disabled={approvalLoading}
              >
                <X size={22} />
              </button>
            </div>
            <div className="px-6 py-6">
              <label className="block font-medium mb-2 text-gray-700">
                Rating:{" "}
                <span className="text-purple-700 font-semibold">
                  {approveRatingValue}
                </span>
                /10
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={approveRatingValue}
                onChange={(e) => setApproveRatingValue(Number(e.target.value))}
                disabled={approvalLoading}
                className="w-full mb-4"
              />
              <label className="block font-medium mb-2 text-gray-700">
                {isEditingRating ? "Update Feedback Message" : "Feedback Message (optional)"}
              </label>
              <textarea
                rows={4}
                className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Write constructive feedback..."
                value={approveRatingMessage}
                onChange={(e) => setApproveRatingMessage(e.target.value)}
                disabled={approvalLoading}
              />
              {approveError && (
                <div className="text-red-600 text-sm mt-2">{approveError}</div>
              )}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => !approvalLoading && setShowApproveModal(false)}
                  disabled={approvalLoading}
                  className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApprove}
                  disabled={approvalLoading}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {approvalLoading
                    ? (isEditingRating ? "Updating..." : "Saving...")
                    : (isEditingRating ? "Update Rating" : "Approve & Save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading component for Suspense fallback
function AssignmentDetailLoading() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function AssignmentDetail() {
  return (
    <Suspense fallback={<AssignmentDetailLoading />}>
      <AssignmentDetailContent />
    </Suspense>
  );
}
