"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
} from "lucide-react";
import { Button } from "react-bootstrap";

interface Student {
  userId: string;
  username: string;
  email: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status?: boolean;
  currentAssignmentStatus: "PENDING" | "SUBMITTED" | "APPROVED" | "CORRECTION";
  studentSubmissionMessage?: string;
  tutorRemarks?: string;
  submissionFileUrl?: string;
  submissionFileName?: string;
  correctionFileUrl?: string;
  correctionFileName?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
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
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    username: string;
    userCategory: string;
    totalAssignments: number;
    pendingCount?: number;
    completedCount?: number;
    assignments: Assignment[];
    currentPage?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export default function StudentAssignments() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tutorInfo, setTutorInfo] = useState<{
    username: string;
    totalAssignments: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "pending" | "completed" | "correction" | "approved"
  >("pending");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [correctionCount, setCorrectionCount] = useState(0);

  // Fetch assignments with pagination
  const fetchAssignments = async (page: number = 1, tab: string = "pending") => {
    try {
      setIsLoading(true);

      // For students, don't send status filter for approved/correction
      // Only send 'pending' or 'completed' to backend
      let statusFilter = '';
      if (tab === 'pending') {
        statusFilter = 'pending';
      } else if (tab === 'completed' || tab === 'approved' || tab === 'correction') {
        statusFilter = 'completed'; // Backend will return all non-pending
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/Api/assignment?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setAssignments(data.data.assignments);
        setTutorInfo({
          username: data.data.username,
          totalAssignments: data.data.totalAssignments,
        });
        setCurrentPage(data.data.currentPage || 1);
        setTotalPages(data.data.totalPages || 1);
        setTotalCount(data.data.totalAssignments);
        setPendingCount(data.data.pendingCount || 0);
        setCompletedCount(data.data.completedCount || 0);
        setSubmittedCount(data.data.submittedCount || 0);
        setApprovedCount(data.data.approvedCount || 0);
        setCorrectionCount(data.data.correctionCount || 0);
      } else {
        throw new Error(data.message || "Failed to fetch assignments");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments(currentPage, activeTab);
  }, [currentPage, activeTab]);

  // Filter assignments based on status (client-side for approved/correction)
  const pendingAssignments = assignments.filter(
    (assignment) => assignment.currentAssignmentStatus === "PENDING"
  );

  const submittedAssignments = assignments.filter(
    (assignment) => assignment.currentAssignmentStatus === "SUBMITTED"
  );

  const correctionAssignments = assignments.filter(
    (assignment) => assignment.currentAssignmentStatus === "CORRECTION"
  );

  const approvedAssignments = assignments.filter(
    (assignment) => assignment.currentAssignmentStatus === "APPROVED"
  );

  // Get counts for all tabs
  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'pending': return pendingAssignments.length;
      case 'completed': return submittedAssignments.length;
      case 'approved': return approvedAssignments.length;
      case 'correction': return correctionAssignments.length;
      default: return 0;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTabChange = (tab: "pending" | "completed" | "correction" | "approved") => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleViewDetail = (assignmentId: string) => {
    router.push(
      `/student/assignments/singleAssignment?assignmentId=${assignmentId}`
    );
  };

  const handleBackToTutor = () => {
    router.push("/student");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
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
      return "1 Day";
    } else if (diffDays <= 7) {
      return `${diffDays} Days`;
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `${weeks} Week${weeks > 1 ? "s" : ""}`;
    } else {
      const months = Math.ceil(diffDays / 30);
      return `${months} Month${months > 1 ? "s" : ""}`;
    }
  };

  const getDeadlineColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-600";
    if (diffDays <= 2) return "text-orange-600";
    return "text-gray-600";
  };

  // Open modal instead of direct status change
  const handleCheckboxClick = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setShowSubmitModal(true);
    setSubmitMessage("");
    setSubmitFile(null);
    setSubmitError(null);
  };

  // Modal submit handler
  const handleModalSubmit = async () => {
    if (!submitMessage.trim()) {
      setSubmitError("Please enter a message.");
      return;
    }

    setIsSubmittingModal(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("submissionMessage", submitMessage);
      if (submitFile) {
        formData.append("submissionFile", submitFile);
      }

      const response = await fetch(
        `/Api/assignment/singleAssignment?assignmentId=${selectedAssignmentId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit assignment");
      }

      // Refresh current page
      await fetchAssignments(currentPage, activeTab);
      setShowSubmitModal(false);
    } catch (err: any) {
      setSubmitError(
        err.message || "Failed to submit assignment. Please try again."
      );
    } finally {
      setIsSubmittingModal(false);
    }
  };

  if (isLoading && assignments.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="!bg-red-50 !border !border-red-200 !rounded-lg !p-6 !text-center">
          <FileText size={48} className="!text-red-400 !mx-auto !mb-4" />
          <h2 className="!text-xl !font-semibold !text-red-800 !mb-2">
            Error Loading Assignments
          </h2>
          <p className="!text-red-600">{error}</p>
          <button
            onClick={() => fetchAssignments(currentPage, activeTab)}
            className="!mt-4 !px-4 !py-2 !bg-red-600 !text-white !rounded !hover:bg-red-700 !transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentAssignments =
    activeTab === "pending" ? pendingAssignments :
      activeTab === "completed" ? submittedAssignments :
        activeTab === "approved" ? approvedAssignments :
          correctionAssignments;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="!mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToTutor}
              className="!p-2 !bg-gray-600 !text-white !rounded-lg !hover:bg-gray-700 !transition-colors !flex !items-center !justify-center"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="!text-2xl !font-bold !text-gray-900">Assignments</h1>
          </div>
        </div>
        {tutorInfo && (
          <p className="!text-gray-600 !mt-2">
            Welcome back, {tutorInfo.username}!
          </p>
        )}
      </div>

      {/* Status Toggle Tabs */}
      <div className="!mb-6">
        <div className="!flex !bg-gray-100 !p-1 !rounded-lg !w-fit !gap-1">
          <button
            onClick={() => handleTabChange("pending")}
            className={`!px-6 !py-3 !rounded-md !font-medium !transition-all !duration-300 !flex !items-center !justify-center !gap-2 ${activeTab === "pending"
                ? "!bg-purple-600 !text-white !shadow-md"
                : "!text-gray-600 !hover:text-gray-800"
              }`}
          >
            Pending
            <span
              className={`!px-2 !py-1 !text-xs !rounded-full ${activeTab === "pending"
                  ? "!bg-purple-300 !bg-opacity-20 !text-gray-900"
                  : "!bg-white !text-grey-600"
                }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("completed")}
            className={`!px-6 !py-3 !rounded-md !font-medium !transition-all !duration-300 !flex !items-center !justify-center !gap-2 ${activeTab === "completed"
                ? "!bg-purple-600 !text-white !shadow-md"
                : "!text-gray-600 !hover:text-gray-800"
              }`}
          >
            Submitted
            <span
              className={`!px-2 !py-1 !text-xs !rounded-full ${activeTab === "completed"
                  ? "!bg-purple-300 !bg-opacity-20 !text-gray-900"
                  : "!bg-white !text-grey-600"
                }`}
            >
              {submittedCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("approved")}
            className={`!px-6 !py-3 !rounded-md !font-medium !transition-all !duration-300 !flex !items-center !justify-center !gap-2 ${activeTab === "approved"
                ? "!bg-green-600 !text-white !shadow-md"
                : "!text-gray-600 !hover:text-green-800"
              }`}
          >
            <CheckCircle size={18} />
            Approved
            <span
              className={`!px-2 !py-1 !text-xs !rounded-full ${activeTab === "approved"
                  ? "!bg-green-300 !bg-opacity-20 !text-gray-900"
                  : "!bg-white !text-grey-600"
                }`}
            >
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("correction")}
            className={`!px-6 !py-3 !rounded-md !font-medium !transition-all !duration-300 !flex !items-center !justify-center !gap-2 ${activeTab === "correction"
                ? "!bg-orange-600 !text-white !shadow-md"
                : "!text-gray-600 !hover:text-orange-800"
              }`}
          >
            Sent for Correction
            <span
              className={`!px-2 !py-1 !text-xs !rounded-full ${activeTab === "correction"
                  ? "!bg-orange-300 !bg-opacity-20 !text-gray-900"
                  : "!bg-white !text-grey-600"
                }`}
            >
              {correctionCount}
            </span>
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : currentAssignments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {activeTab === "pending"
                ? "No Pending Assignments"
                : activeTab === "completed"
                  ? "No Submitted Assignments"
                  : activeTab === "approved"
                    ? "No Approved Assignments"
                    : "No Assignments for Correction"}
            </h2>
          </div>
        ) : (
          <>
            {/* Results counter */}
            <div className="d-flex justify-content-between align-items-center mb-3 px-4 pt-4">
              <p className="text-sm text-gray-600 m-0">
                Showing {currentAssignments.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize,
                  activeTab === 'pending' ? pendingCount :
                    activeTab === 'completed' ? submittedCount :
                      activeTab === 'approved' ? approvedCount :
                        correctionCount
                )} of {
                  activeTab === 'pending' ? pendingCount :
                    activeTab === 'completed' ? submittedCount :
                      activeTab === 'approved' ? approvedCount :
                        correctionCount
                } {
                  activeTab === 'pending' ? 'pending assignments' :
                    activeTab === 'completed' ? 'submitted assignments' :
                      activeTab === 'approved' ? 'approved assignments' :
                        'assignments for correction'
                }
              </p>
            </div>

            <div className="!divide-y !divide-gray-100">
              {currentAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="!p-6 hover:!bg-purple-100 !transition-colors"
                >
                  <div className="!flex !justify-between !items-start">
                    <div className="!flex !items-start !gap-4 !flex-1">
                      {/* Checkbox for marking as completed */}
                      <input
                        type="checkbox"
                        checked={
                          assignment.currentAssignmentStatus === "SUBMITTED" ||
                          assignment.currentAssignmentStatus === "APPROVED"
                        }
                        disabled={
                          assignment.currentAssignmentStatus === "SUBMITTED" ||
                          assignment.currentAssignmentStatus === "APPROVED" ||
                          updatingStatus === assignment._id
                        }
                        onChange={() => handleCheckboxClick(assignment._id)}
                        className="mr-3 accent-purple-600 w-5 h-5"
                        title={
                          assignment.currentAssignmentStatus === "SUBMITTED" ||
                            assignment.currentAssignmentStatus === "APPROVED"
                            ? "Already submitted"
                            : "Submit assignment"
                        }
                      />
                      <div className="!flex-1">
                        <div className="!flex !items-center !gap-3 !mb-2">
                          <h3
                            className={`!text-lg !font-semibold !text-[20px] ${assignment.status
                                ? "text-gray-500 "
                                : "text-gray-900"
                              }`}
                          >
                            {assignment.course.title} - {assignment.title}
                          </h3>
                          <span className="!px-2 !py-1 !text-xs !rounded-full">
                            {assignment.course.category}
                          </span>
                          {assignment.status && (
                            <span className="!px-2 !py-1 !text-xs !font-medium !bg-green-100 !text-green-800 !rounded-full !flex !items-center !gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Completed
                            </span>
                          )}
                        </div>

                        <div className="!flex !items-center !gap-6 !text-sm !text-gray-600 !mb-3">
                          <div className="!flex !items-center !gap-2">
                            <Calendar size={16} className="!text-purple-500" />
                            <span>
                              Assigned: {formatDate(assignment.createdAt)}
                            </span>
                          </div>
                          <div className="!flex !items-center !gap-2">
                            <Clock size={16} className="!text-orange-500" />
                            <span
                              className={`!font-medium ${getDeadlineColor(
                                assignment.deadline
                              )}`}
                            >
                              Deadline: {formatDeadline(assignment.deadline)}
                            </span>
                          </div>
                          <div className="!flex !items-center !gap-2">
                            <span>
                              Last date: {formatDate(assignment.deadline)}
                            </span>
                          </div>
                        </div>

                        <div className="!flex !items-center !gap-2 !mb-4">
                          <User size={16} className="!text-gray-500" />
                          <span className="!text-sm !text-gray-600">
                            Students:
                          </span>
                          <div className="!flex !items-center !gap-2">
                            {(assignment.assignedStudents || [])
                              .slice(0, 3)
                              .map((student, index) => (
                                <div
                                  key={student.userId}
                                  className="!flex !items-center !gap-2"
                                >
                                  <div className="!w-6 !h-6 !rounded-full !bg-purple-100 !flex !items-center !justify-center">
                                    <span className="!text-xs !font-medium !text-purple-700">
                                      {student.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="!ml-1 !text-sm !text-gray-700">
                                    {student.username}
                                  </span>
                                  {index <
                                    Math.min(
                                      (assignment.assignedStudents || []).length,
                                      3
                                    ) -
                                    1 && (
                                      <span className="!mx-1 !text-gray-400">
                                        •
                                      </span>
                                    )}
                                </div>
                              ))}
                            {(assignment.totalAssignedStudents || 0) > 3 && (
                              <span className="!text-sm !text-gray-500">
                                +{(assignment.totalAssignedStudents || 0) - 3}{" "}
                                more
                              </span>
                            )}
                          </div>
                        </div>

                        {assignment.fileUrl && (
                          <div className="!flex !items-center !gap-2 !text-sm !text-purple-600 !mb-4">
                            <FileText size={16} />
                            <span>Attachment: {assignment.fileName}</span>
                          </div>
                        )}

                        {activeTab === "correction" &&
                          assignment.tutorRemarks && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-orange-700 mb-1">
                                Tutor Remarks:
                              </label>
                              <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded text-gray-800 whitespace-pre-line">
                                {assignment.tutorRemarks}
                              </div>
                            </div>
                          )}
                        {activeTab === "correction" &&
                          assignment.correctionFileUrl &&
                          assignment.correctionFileName && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-orange-700 mb-1">
                                Correction File from Tutor:
                              </label>
                              <a
                                href={assignment.correctionFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 hover:bg-orange-100 transition-colors font-medium"
                                download={assignment.correctionFileName}
                              >
                                <FileText size={18} className="text-orange-500" />
                                {assignment.correctionFileName}
                              </a>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="!flex !items-center !gap-2 !ml-4">
                      <Button
                        onClick={() => handleViewDetail(assignment._id)}
                        className="!px-4 !py-2 !bg-purple-600 !text-white !text-sm !rounded-lg hover:!bg-purple-700 !transition-colors !flex !items-center !gap-2"
                      >
                        <Eye size={16} />
                        View Detail
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="d-flex flex-column align-items-center gap-3 mt-4 mb-4 pb-4">
                {/* Desktop Pagination */}
                <div className="d-none d-md-flex justify-content-center align-items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft size={18} />
                    <span className="d-none d-lg-inline">Previous</span>
                  </button>

                  <div className="d-flex gap-1">
                    {getPageNumbers().map((pageNum, index) => {
                      if (pageNum === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-3 py-2 d-flex align-items-center">
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum as number)}
                          className={`btn ${currentPage === pageNum
                              ? "btn-primary"
                              : "btn-outline-primary"
                            } px-3 py-2`}
                          style={{ minWidth: "45px" }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    <span className="d-none d-lg-inline">Next</span>
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Mobile Pagination */}
                <div className="d-flex d-md-none justify-content-between align-items-center w-100 px-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn btn-outline-primary d-flex align-items-center gap-1 px-2 py-2"
                    style={{
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft size={16} />
                    <span>Prev</span>
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline-primary d-flex align-items-center gap-1 px-2 py-2"
                    style={{
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

                <p className="text-sm text-gray-500 m-0 text-center">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Assignment Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSubmitModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-purple-700">
              <h2 className="text-lg font-bold text-white">
                Submit Assignment
              </h2>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                disabled={isSubmittingModal}
              >
                <X size={22} />
              </button>
            </div>
            <div className="px-6 py-6">
              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-700">
                  Message
                </label>
                <textarea
                  className="!w-full !border !rounded !p-2 focus:!ring-2 focus:!ring-purple-500 focus:!border-transparent !transition-all"
                  rows={4}
                  value={submitMessage}
                  onChange={(e) => setSubmitMessage(e.target.value)}
                  disabled={isSubmittingModal}
                  placeholder="Enter a message for your tutor..."
                />
              </div>
              <div className="mb-4">
                <label className="!block !font-medium !mb-2 !text-gray-700">
                  Upload File (max 10MB)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                  disabled={isSubmittingModal}
                  className="!block !w-full !text-sm !text-gray-700 file:!mr-4 file:!py-2 file:!px-4 file:!rounded file:!border-0 file:!text-sm file:!font-semibold file:!bg-purple-50 file:!text-purple-700 hover:file:!bg-purple-100"
                />
                {submitFile && (
                  <div className="text-sm text-gray-600 mt-1">
                    {submitFile.name}
                  </div>
                )}
              </div>
              {submitError && (
                <div className="text-red-600 text-sm mb-2">{submitError}</div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmittingModal}
                className="!px-4 !py-2 !rounded-lg !text-gray-700 !bg-gray-100 hover:!bg-gray-200 !font-medium !transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={isSubmittingModal}
                className="!px-4 !py-2 !rounded-lg !bg-purple-600 !text-white !font-semibold hover:!bg-purple-700 !transition-all disabled:!opacity-50"
              >
                {isSubmittingModal ? "Submitting..." : "Submit Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}