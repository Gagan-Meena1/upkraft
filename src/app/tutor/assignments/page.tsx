"use client";

import { useState, useEffect } from "react";
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
  Search,
  Music,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CreateAssignmentModal from "@/app/components/CreateAssignmentModal";
import Link from "next/link";
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

interface Course {
  _id: string;
  title: string;
  category?: string;
}

interface Class {
  _id: string;
  title: string;
  startTime?: string;
  endTime?: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "completed"
  >("all");
  const [updatingCompletion, setUpdatingCompletion] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
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

  const handleToggleComplete = async (
    assignmentId: string,
    currentStatus: boolean
  ) => {
    const action = currentStatus ? "incomplete" : "complete";
    const message = currentStatus
      ? "Mark this assignment as incomplete for the entire class?"
      : "Mark this assignment as complete for the entire class?";

    if (!confirm(message)) {
      return;
    }

    setUpdatingCompletion(assignmentId);

    try {
      const response = await fetch(
        `/Api/assignment/assignmentCompleteWholeClass?assignmentId=${assignmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update the local state to reflect the change - TOGGLE the status
        setAssignments((prevAssignments) =>
          prevAssignments.map((assignment) =>
            assignment._id === assignmentId
              ? { ...assignment, status: !currentStatus } // Changed from 'true' to '!currentStatus'
              : assignment
          )
        );
        alert(
          `Assignment marked as ${
            !currentStatus ? "complete" : "incomplete"
          } successfully!`
        );
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating assignment status:", error);
      alert("Failed to update assignment status. Please try again.");
    } finally {
      setUpdatingCompletion(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [classesData, setClassesData] = useState<Class[]>([]);

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

    if (diffDays < 0) return "text-red-600 bg-red-50";
    if (diffDays <= 2) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  const handleViewDetail = (assignmentId: string) => {
    window.location.href = `/tutor/assignments/singleAssignment?assignmentId=${assignmentId}`;
  };

  const handleEdit = (assignmentId: string) => {
    const assignmentToEdit = assignments.find((a) => a._id === assignmentId);
    if (assignmentToEdit) {
      setEditingAssignment(assignmentToEdit);
      setIsModalOpen(true);
    }
  };
  const handleDelete = async (assignmentId: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      try {
        const response = await fetch(
          `/Api/assignment?assignmentId=${assignmentId}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (data.success) {
          alert("Assignment deleted successfully!");
          // Optionally refresh the page or update state to remove the deleted assignment
          window.location.reload(); // or use state management to remove from list
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error("Error deleting assignment:", error);
        alert("Failed to delete assignment. Please try again.");
      }
    }
  };

  // Update the modal closing handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAssignment(null);
  };

  // Add success handler to refresh assignments
  const handleAssignmentSuccess = () => {
    setIsModalOpen(false);
    setEditingAssignment(null);
    // window.location.reload(); // or refetch assignments
  };
  const handleCreateAssignment = () => {
    setIsModalOpen(true); // open modal instead of redirect
  };

  const filteredAssignments = assignments.filter((assignment) => {
    // Search filter - search by assignment title OR student name
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.assignedStudents.some(
        (student) =>
          student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Status filter
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "pending"
        ? !assignment.status
        : assignment.status; // completed

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Assignments</h1>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse"
              >
                <div className="h-5 w-1/3 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto mt-20">
          <FileText size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Error Loading Assignments
          </h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
          {/* Header */}
            <div className="left-head d-flex align-items-center gap-2">
              <Link href="/tutor" className='link-text back-btn'>
                <ChevronLeft />
              </Link>
              <div className="heading-text-top-box">
                 <h2 className="m-0 mb-1">Assignments</h2>
                  
                  {tutorInfo && (
                    <p className="m-0 p-0">
                      Total: {tutorInfo.totalAssignments} assignment
                      {tutorInfo.totalAssignments !== 1 ? "s" : ""}
                    </p>
                  )}
              </div>
                {/* Status Toggle Buttons */}
                
              </div>

              <div className="right-form">
                {/* Search Bar */}
              <div className="right-head d-flex align-items-center gap-2 flex-md-nowrap flex-wrap">
                <div className="search-box position-relative"> 
                  <Button
                      type="button"
                      className="btn btn-trans border-0 bg-transparent p-0 m-0 position-absolute btn btn-primary"
                    >
                   <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.4995 17.5L13.8828 13.8833"
                        stroke="#505050"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                        stroke="#505050"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                  <input
                    type="text"
                    placeholder="assignment or student "
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-100 form-control"
                  />
                </div>
                <div className="select-box">
                <button
                  onClick={handleCreateAssignment}
                  className="btn btn-primary add-assignments d-flex align-items-center justify-content-center gap-2"
                >
                  <Plus size={18} />
                  <span>Create Assignment</span>
                </button>
              </div>
              </div>
              </div>
            </div>
          </div>
          
        <hr className="hr-light" />

      <div className='h-100 position-relative practice-studio-sec p-0'>
          <div className='tab-sec-music payment-summary-sec'>
          <div className="btn-tabs tab-sec-music">
            <ul className="mb-3 nav nav-tabs">
              <li className="nav-item">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`nav-link d-flex align-items-center gap-2  ${
                    statusFilter === "all"
                      ? "active"
                      : ""
                  }`}
                >
                  All ({assignments.length})
                </button>
                </li>
              <li className="nav-item">
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`nav-link d-flex align-items-center gap-2  ${
                    statusFilter === "pending"
                      ? "active"
                      : ""
                  }`}
                >
                  Pending ({assignments.filter((a) => !a.status).length})
                </button>
                </li>
              <li className="nav-item">
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`nav-link d-flex align-items-center gap-2  ${
                    statusFilter === "completed"
                      ? "active"
                      : ""
                  }`}
                >
                  Completed ({assignments.filter((a) => a.status).length})
                </button>
                </li>
              </ul>
          </div>

        {/* Assignments List */}
        <div className="new-tabs-telwind-sec">
          {filteredAssignments.length === 0 ? (
            <div className=" col-md-12 mb-4 p-4">
              <FileText size={64} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? "No Matching Assignments" : "No Assignments Yet"}
              </h2>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first assignment to get started"}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateAssignment}
                  className="!px-6 !py-3 !bg-purple-600 !text-white !font-medium !rounded-lg hover:!bg-purple-700 !transition-colors !flex !items-center !gap-2 !mx-auto"
                >
                  <Plus size={20} />
                  <span>Create Your First Assignment</span>
                </button>
              )}
            </div>
          ) : (
            <div className="row mt-4">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className=" col-md-12 mb-4"
                > 
                <div className="my-archieve-card">
                  {/* Assignment Title */}
                  <div className="top-archieve-card d-flex align-items-center gap-2 justify-content-between mb-4">
                    <div className="left-box d-flex align-items-center gap-2 justify-content-between">
                      {/* Checkbox for completion */}
                      <div className="left-right-text-btn d-flex align-items-center gap-2 position-relative">
                      <div className="checkbx">
                          <input
                            type="checkbox"
                            checked={assignment.status || false}
                            onChange={() =>
                              handleToggleComplete(
                                assignment._id,
                                assignment.status || false
                              )
                            }
                            disabled={updatingCompletion === assignment._id} // REMOVED: || assignment.status
                            className={`checkbox-box ${
                              assignment.status
                                ? "whien-checked" // REMOVED: cursor-not-allowed
                                : ""
                            } ${
                              updatingCompletion === assignment._id
                                ? "cursor-wait"
                                : ""
                            }`}
                            title={
                              assignment.status
                                ? "complate-check"
                                : ""
                            } // Changed title
                          />
                        <span className="checkmark"></span>
                      </div>

                      <h3
                        className={`m-0 p-0 ${
                          assignment.status ? " " : ""
                        }`}
                      >
                        {assignment.title}
                      </h3>
                      </div>
                      <div className="sub-both-box d-flex align-items-center gap-3">
                        <span>
                          Submitted:{" "}
                          {
                            assignment.assignedStudents?.filter(
                              (s) => s.submissionStatus === "SUBMITTED"
                            ).length
                          }{" "}
                          / {assignment.assignedStudents?.length}
                        </span>
                        <span className="text-box-sub">
                          Completed:{" "}
                          {
                            assignment.assignedStudents?.filter(
                              (s) => s.submissionStatus === "APPROVED"
                            ).length
                          }{" "}
                          / {assignment.assignedStudents?.length}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="right-box d-flex align-items-center gap-2">
                      <button
                        onClick={() => handleEdit(assignment._id)}
                        className="Dropdown-btn"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(assignment._id)}
                        className="video-btn-play"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>

                      <Link
                        href={`/tutor/assignments/singleAssignment?assignmentId=${assignment._id}`}
                      >
                        <button
                          className="btn-evaluated d-flex align-items-center gap-2"
                        >
                          <Eye size={16} />
                          <span>View Details</span>
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Assignment Details Grid */}
                  <div className="d-flex justify-content-between flex-wrap gap-2 mb-4">
                    {/* Students */}
                    <div className="item-card-box d-flex align-items-center gap-2">
                      <div className="icons-text-box d-flex align-items-center gap-2">
                        <User size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Student:
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        {assignment?.assignedStudents?.length > 0 ? (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-purple-700">
                                {assignment.assignedStudents[0].username
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {assignment.assignedStudents[0].username}
                            </span>
                            {assignment.totalAssignedStudents > 1 && (
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                +{assignment.totalAssignedStudents - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="!text-sm !text-gray-400">
                            No students
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="item-card-box d-flex align-items-center gap-2">
                      <div className="icons-text-box d-flex align-items-center gap-2">
                      <Calendar
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Created:
                        </span>
                        </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(assignment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Deadline */}
                    <div className="item-card-box d-flex align-items-center gap-2">
                      <div className="icons-text-box d-flex align-items-center gap-2">
                      <Clock
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Deadline:
                        </span>
                        </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold px-2 py-0.5 rounded-full ${getDeadlineColor(
                            assignment.deadline
                          )}`}
                        >
                          {formatDeadline(assignment.deadline)}
                        </span>
                      </div>
                    </div>

                    {/* Course */}
                    <div className="item-card-box d-flex align-items-center gap-2">
                      <div className="icons-text-box d-flex align-items-center gap-2">
                      <Music
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Course:
                        </span>
                        </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {assignment.course?.title || "No course assigned"}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="item-card-box d-flex align-items-center gap-2">
                      <div className="icons-text-box d-flex align-items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          assignment.status ? "bg-green-500" : "bg-amber-500"
                        }`}
                      ></div>
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Status:
                        </span>
                        </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            assignment.status
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {assignment.status ? "Completed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description Preview */}
                  {assignment.description && (
                    <div className="bottom-text-desc">
                      <p className="text-details">
                        {assignment.description}
                      </p>
                    </div>
                  )}
                </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {isModalOpen && (
        <CreateAssignmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleAssignmentSuccess}
          courses={coursesData}
          classes={classesData}
          editingAssignment={editingAssignment} // Pass the assignment to edit
        />
      )}
      </div>
</div>
    </div>
  );
}
