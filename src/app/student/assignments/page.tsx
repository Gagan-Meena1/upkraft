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
  X,
  CheckCircle, // Add this
} from "lucide-react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Link from "next/link";

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
    assignments: Assignment[];
  };
}

export default function TutorAssignments() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("Monthly");
  const [tutorInfo, setTutorInfo] = useState<{
    username: string;
    totalAssignments: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "pending" | "completed" | "correction" | "approved" // Add 'approved'
  >("pending");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // No need to get userId - API will extract from token
        const response = await fetch("/Api/assignment");

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
        } else {
          throw new Error(data.message || "Failed to fetch assignments");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Filter assignments based on status
  const pendingAssignments = assignments.filter(
    (assignment) => assignment.currentAssignmentStatus === "PENDING"
  );

  const submittedAssignments = assignments.filter(
    (assignment) => assignment.currentAssignmentStatus === "SUBMITTED"
  );

  const correctionAssignments = assignments.filter(
    (assignment) => assignment.currentAssignmentStatus === "CORRECTION"
  );

  // NEW: Filter for approved assignments
  const approvedAssignments = assignments.filter(
    (assignment) => assignment.currentAssignmentStatus === "APPROVED"
  );

  // Function to handle assignment status update
  const handleStatusChange = async (
    assignmentId: string,
    currentStatus: boolean
  ) => {
    setUpdatingStatus(assignmentId);

    try {
      const response = await fetch(
        `/Api/assignment/singleAssignment?assignmentId=${assignmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentAssignmentStatus: "SUBMITTED",
            studentSubmissionMessage: submitMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update assignment status");
      }

      const data = await response.json();

      if (data.success) {
        // Update the local state
        setAssignments((prevAssignments) =>
          prevAssignments.map((assignment) =>
            assignment._id === assignmentId
              ? { ...assignment, status: !currentStatus }
              : assignment
          )
        );
      } else {
        throw new Error(data.message || "Failed to update assignment status");
      }
    } catch (err) {
      console.error("Error updating assignment status:", err);
      alert("Failed to update assignment status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
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
          body: formData, // Use FormData instead of JSON
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit assignment");
      }

      // Update local state to reflect the submission
      setAssignments((prevAssignments) =>
        prevAssignments.map((assignment) =>
          assignment._id === selectedAssignmentId
            ? {
              ...assignment,
              currentAssignmentStatus: "SUBMITTED",
              studentSubmissionMessage: submitMessage,
              submissionFileUrl:
                data.data.submissions?.find(
                  (s) => s.studentId === assignment.class?._id
                )?.fileUrl || "",
            }
            : assignment
        )
      );
      setShowSubmitModal(false);
    } catch (err: any) {
      setSubmitError(
        err.message || "Failed to submit assignment. Please try again."
      );
    } finally {
      setIsSubmittingModal(false);
    }
  };

  if (isLoading) {
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
            onClick={() => window.location.reload()}
            className="!mt-4 !px-4 !py-2 !bg-red-600 !text-white !rounded !hover:bg-red-700 !transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-box">
      <div className="assignments-list-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head d-flex align-items-center gap-2">
            <Link href=""
              onClick={handleBackToTutor}
              className='link-text back-btn'
            >
              <ChevronLeft />
            </Link>
            <h2 className="m-0 mb-0">Assignments</h2>
          </div>
          <div className="right-head d-flex align-items-center gap-2 flex-md-nowrap flex-wrap">
            {tutorInfo && (
              <p className="!text-gray-600 !mt-2">
                Welcome back, {tutorInfo.username}!
              </p>
            )}
          </div>
        </div>
      </div>
      <hr className="hr-light" />

      {/* Status Toggle Tabs */}
      <div className='h-100 position-relative practice-studio-sec p-0'>
        <div className='tab-sec-music payment-summary-sec'>
          <div className="btn-tabs tab-sec-music">
            <ul className="mb-3 nav nav-tabs">
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`nav-link d-flex align-items-center gap-2  ${activeTab === "pending"
                    ? "active"
                    : ""
                    }`}
                >
                  Pending Assignments
                  {pendingAssignments.length > 0 && (
                    <span
                      className={`pending-box ${activeTab === "pending"
                        ? ""
                        : ""
                        }`}
                    >
                      {pendingAssignments.length}
                    </span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`nav-link d-flex align-items-center gap-2 ${activeTab === "completed"
                    ? "active"
                    : ""
                    }`}
                >
                  Completed Assignments
                  {submittedAssignments.length > 0 && (
                    <span
                      className={`pending-box ${activeTab === "completed"
                        ? ""
                        : ""
                        }`}
                    >
                      {submittedAssignments.length}
                    </span>
                  )}
                </button>
              </li>
              {/* NEW: Approved Tab Button */}
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab("approved")}
                  className={`nav-link d-flex align-items-center gap-2 ${activeTab === "approved"
                    ? "active"
                    : ""
                    }`}
                >
                  <CheckCircle size={18} />
                  Approved
                  {approvedAssignments.length > 0 && (
                    <span
                      className={`pending-box ${activeTab === "approved"
                        ? ""
                        : ""
                        }`}
                    >
                      {approvedAssignments.length}
                    </span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab("correction")}
                  className={`nav-link d-flex align-items-center gap-2 ${activeTab === "correction"
                    ? "active"
                    : ""
                    }`}
                >
                  Sent for Correction
                  {correctionAssignments.length > 0 && (
                    <span
                      className={`pending-box ${activeTab === "correction"
                        ? ""
                        : ""
                        }`}
                    >
                      {correctionAssignments.length}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>

          {/* Assignments List */}
          <div className="new-tabs-telwind-sec">
            {(activeTab === "pending"
              ? pendingAssignments
              : activeTab === "completed"
                ? submittedAssignments
                : activeTab === "approved" // Add this condition
                  ? approvedAssignments
                  : correctionAssignments
            ).length === 0 ? (
              <div className="p-12 text-center">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {activeTab === "pending"
                    ? "No Pending Assignments"
                    : activeTab === "completed"
                      ? "No Completed Assignments"
                      : activeTab === "approved" // Add this message
                        ? "No Approved Assignments"
                        : "No Assignments for Correction"}
                </h2>
              </div>
            ) : (
              <div className="row mt-4">
                {(activeTab === "pending"
                  ? pendingAssignments
                  : activeTab === "completed"
                    ? submittedAssignments
                    : activeTab === "approved" // Add this condition
                      ? approvedAssignments
                      : correctionAssignments
                ).map((assignment) => (
                  <div
                    key={assignment._id}
                    className=" col-md-12 mb-4"
                  >
                    <div className="my-archieve-card">
                      <div className="top-archieve-card d-flex align-items-center gap-2 justify-content-between mb-4">
                        <div className="left-box d-flex align-items-center gap-2 justify-content-between">
                          {/* Checkbox for completion */}
                          <div className="left-right-text-btn d-flex align-items-center gap-2 position-relative">
                            <div className="checkbx">
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
                                className="checkbox-box "
                                title={
                                  assignment.currentAssignmentStatus === "SUBMITTED" ||
                                    assignment.currentAssignmentStatus === "APPROVED"
                                    ? "Already submitted"
                                    : "Submit assignment"
                                }
                              />
                              <span className="checkmark"></span>
                            </div>
                            <h3
                              className={`p-0 m-0 !text-sm ${assignment.status
                                ? ""
                                : ""
                                }`}
                            >
                              {assignment.course.title} - {assignment.title}
                            </h3>
                          </div>

                          <div className="sub-both-box d-flex align-items-center gap-3">
                            <span className="">
                              {assignment.course.category}
                            </span>
                            {assignment.status && (
                              <span className="text-box-sub text-green-text d-flex align-items-center gap-1">
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
                        </div>

                        <div className="right-box d-flex align-items-center gap-2">
                          <button className="video-btn-play">
                            <Trash2 size={18} />
                          </button>

                          <button className="Dropdown-btn">
                            <Edit size={18} />
                          </button>
                          <button className="btn-evaluated d-flex align-items-center gap-2">
                            <Eye size={16} />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between flex-wrap gap-2 mb-4">
                        <div className="item-card-box d-flex align-items-center gap-2">
                          <div className="icons-text-box d-flex align-items-center gap-2">
                            <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              Assigned Date:
                            </span>
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            {formatDate(assignment.createdAt)}
                          </div>
                        </div>
                        <div className="item-card-box d-flex align-items-center gap-2">
                          <div className="icons-text-box d-flex align-items-center gap-2">
                            <Clock size={16} className="text-gray-400 flex-shrink-0" />
                            <span
                              className={`text-sm text-gray-600 whitespace-nowrap}`}
                            >
                              Deadline:
                            </span>
                          </div>
                          <div className="flex items-center gap-2 min-w-0 text-sm font-semibold px-2 py-0.5 rounded-full text-red-600 bg-red-50">
                             {formatDeadline(assignment.deadline)}
                          </div>
                        </div>
                        <div className="item-card-box d-flex align-items-center gap-2">
                          <div className="icons-text-box d-flex align-items-center gap-2">
                            <span
                              className={`text-sm text-gray-600 whitespace-nowrap}`}
                            >
                              Last date of Submission:{" "}
                              
                            </span>
                          </div>
                          <div className="flex items-center gap-2 min-w-0 text-sm ">
                            {formatDate(assignment.deadline)}
                          </div>
                        </div>

                        <div className="!flex !items-center !gap-2 !mb-4">
                          <User size={16} className="!text-gray-500" />
                          <span className="!text-sm !text-gray-600">
                            Students:
                          </span>
                          <div className="!flex !items-center !gap-2">
                            {/* Fixed: Add null check and default empty array */}
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
                            {/* Fixed: Add null check for totalAssignedStudents and assignedStudents */}
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

                      <div className="border-t border-gray-100">
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
            )}
          </div>

          {/* Custom Assignment Submission Modal */}
          {showSubmitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowSubmitModal(false)}
              />
              {/* Modal Panel */}
              <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
                {/* Header */}
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
                {/* Body */}
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
                {/* Footer */}
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
      </div>
    </div>
  );
}
