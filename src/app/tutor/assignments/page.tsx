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
} from "lucide-react";
import { useRouter } from "next/navigation";
import CreateAssignmentModal from "@/app/components/CreateAssignmentModal";
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
    window.location.reload(); // or refetch assignments
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
              {tutorInfo && (
                <p className="text-sm text-gray-600 mt-1">
                  Total: {tutorInfo.totalAssignments} assignment
                  {tutorInfo.totalAssignments !== 1 ? "s" : ""}
                </p>
              )}
              {/* Status Toggle Buttons */}
              <div className="!flex !gap-2 !mt-3 !bg-gray-200 !p-1 !rounded-lg">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`!px-4 !py-2 !rounded-md !text-sm !font-medium !transition-colors ${
                    statusFilter === "all"
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All ({assignments.length})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === "pending"
                      ? "bg-white text-amber-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Pending ({assignments.filter((a) => !a.status).length})
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === "completed"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Completed ({assignments.filter((a) => a.status).length})
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:flex-initial">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="assignment or student "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!w-full !sm:w-64 !pl-10 !text-gray-700 !pr-4 !py-2.5 !border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-purple-500 focus:!border-transparent !text-sm"
                />
              </div>

              {/* Filter Dropdown */}
              {/* <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Daily">Daily</option>
              </select> */}

              {/* Create Assignment Button */}
              <button
                onClick={handleCreateAssignment}
                className="!px-4 !py-2.5 !bg-purple-600 !text-white !text-sm !font-medium !rounded-lg hover:!bg-purple-700 !transition-colors !flex !items-center !gap-2 !shadow-sm hover:!shadow-md"
              >
                <Plus size={18} />
                <span>Create Assignment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="!bg-white !rounded-xl !shadow-sm !border !border-gray-200 !overflow-hidden">
          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center">
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
            <div className="divide-y divide-gray-100">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="!p-6 hover:!bg-gray-50 !transition-colors"
                >
                  {/* Assignment Title */}
                  <div className="!flex !items-start !justify-between !mb-4">
                    <div className="!flex !items-center !gap-3 !flex-1">
                      {/* Checkbox for completion */}
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
                        className={`w-5 h-5 rounded border-2 cursor-pointer transition-colors ${
                          assignment.status
                            ? "border-green-500 bg-green-500" // REMOVED: cursor-not-allowed
                            : "border-gray-300 hover:border-purple-500"
                        } ${
                          updatingCompletion === assignment._id
                            ? "opacity-50 cursor-wait"
                            : ""
                        }`}
                        title={
                          assignment.status
                            ? "Mark as incomplete"
                            : "Mark as complete"
                        } // Changed title
                      />

                      <h3
                        className={`!text-lg !mb-0 !font-semibold !flex-1 ${
                          assignment.status ? "text-gray-500 " : "text-gray-900"
                        }`}
                      >
                        {assignment.title}
                      </h3>
                    </div>

                    {/* Action Buttons */}
                    <div className="!flex !items-center !gap-2 !ml-4">
                      <button
                        onClick={() => handleEdit(assignment._id)}
                        className="!p-2 !text-blue-600 hover:!bg-blue-50 !rounded-lg !transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(assignment._id)}
                        className="!p-2 !text-gray-400 hover:!text-red-600 hover:!bg-red-50 !rounded-lg !transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>

                      <Link
                        href={`/tutor/assignments/singleAssignment?assignmentId=${assignment._id}`}
                      >
                        <button
                          className="!px-4 !py-2 !bg-purple-600 !text-white !text-sm !font-medium !rounded-lg hover:!bg-purple-700 !transition-colors !flex !items-center !gap-2"
                        >
                          <Eye size={16} />
                          <span>View Details</span>
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Assignment Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Students */}
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400 flex-shrink-0" />
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Student:
                        </span>
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
                    <div className="flex items-center gap-2">
                      <Calendar
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Created:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(assignment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-2">
                      <Clock
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Deadline:
                        </span>
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
                    <div className="flex items-center gap-2">
                      <Music
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Course:
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {assignment.course?.title || "No course assigned"}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          assignment.status ? "bg-green-500" : "bg-amber-500"
                        }`}
                      ></div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Status:
                        </span>
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
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {assignment.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
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
  );
}
