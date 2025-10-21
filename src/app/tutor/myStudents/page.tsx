"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MdDelete } from "react-icons/md";
import { ChevronLeft } from "lucide-react";
import AddNewStudentModal from "../../components/AddNewStudentModal";
import { Button, Dropdown, Form } from "react-bootstrap";

interface Course {
  _id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  price: number;
  courseQuality: number;
  curriculum: any[];
  performanceScores: {
    userId: {
      _id: string;
      username: string;
      email: string;
    };
    score: number;
    date: string;
  }[];
  instructorId: {
    _id: string;
    username: string;
    email: string;
  };
}

interface Student {
  _id: string;
  username: string;
  email: string;
  contact: string;
  city: string;
  assignment: string[];
  courses: Course[];
  pendingAssignments?: number;
  performanceAverage?: number;
  courseQualityAverage?: number;
}

interface ApiResponse {
  message: string;
  filteredUsers: Student[];
}

interface AssignmentDetail {
  _id: string;
  title: string;
  status: boolean;
}

export default function MyStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingStudents, setDeletingStudents] = useState<Set<string>>(
    new Set()
  );
  const [loadingAssignments, setLoadingAssignments] = useState<Set<string>>(
    new Set()
  );

  const calculatePerformanceAverage = (student: Student): number => {
    if (!student.courses || student.courses.length === 0) return 0;

    const studentScores: number[] = [];

    student.courses.forEach((course) => {
      if (course.performanceScores && course.performanceScores.length > 0) {
        // Find the student's score in this course
        const studentScore = course.performanceScores.find(
          (score) => score.userId._id === student._id
        );

        if (studentScore) {
          studentScores.push(studentScore.score);
        }
      }
    });

    if (studentScores.length === 0) return 0;

    const average =
      studentScores.reduce((sum, score) => sum + score, 0) /
      studentScores.length;
    return Math.round(average * 100) / 100; // Round to 2 decimal places
  };

  const calculateCourseQualityAverage = (student: Student): number => {
    if (!student.courses || student.courses.length === 0) return 0;

    const validCourses = student.courses.filter(
      (course) => course.courseQuality && course.courseQuality > 0
    );

    if (validCourses.length === 0) return 0;

    const average =
      validCourses.reduce((sum, course) => sum + course.courseQuality, 0) /
      validCourses.length;
    return Math.round(average * 100) / 100; // Round to 2 decimal places
  };

  const fetchAssignmentDetails = async (
    assignmentIds: string[]
  ): Promise<{ pending: number }> => {
    if (!assignmentIds || assignmentIds.length === 0) {
      return { pending: 0 };
    }

    try {
      const assignmentPromises = assignmentIds.map(async (assignmentId) => {
        const response = await fetch(
          `/Api/assignment/singleAssignment?assignmentId=${assignmentId}`
        );
        if (!response.ok) {
          console.error(`Failed to fetch assignment ${assignmentId}`);
          return null;
        }
        const data = await response.json();
        return data.success ? data.data : null;
      });

      const assignments = await Promise.all(assignmentPromises);
      const validAssignments = assignments.filter(
        Boolean
      ) as AssignmentDetail[];

      const pending = validAssignments.filter(
        (assignment) => !assignment.status
      ).length;

      return { pending };
    } catch (error) {
      console.error("Error fetching assignment details:", error);
      return { pending: 0 };
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/Api/myStudents");

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data && data.filteredUsers) {
        const studentsWithDetails = await Promise.all(
          data.filteredUsers.map(async (student: Student) => {
            setLoadingAssignments((prev) => new Set(prev).add(student._id));

            const assignmentCounts = await fetchAssignmentDetails(
              student.assignment || []
            );

            // Calculate averages
            const performanceAverage = calculatePerformanceAverage(student);
            const courseQualityAverage = calculateCourseQualityAverage(student);

            setLoadingAssignments((prev) => {
              const newSet = new Set(prev);
              newSet.delete(student._id);
              return newSet;
            });

            return {
              ...student,
              pendingAssignments: assignmentCounts.pending,
              performanceAverage,
              courseQualityAverage,
            };
          })
        );

        setStudents(studentsWithDetails);
      } else {
        console.error("filteredUsers not found in API response:", data);
        setError("Invalid response format from server");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this student? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingStudents((prev) => new Set(prev).add(studentId));

      const response = await fetch(`/Api/myStudents?studentId=${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      const data = await response.json();

      if (data.success) {
        // Remove the student from the local state
        setStudents((prev) =>
          prev.filter((student) => student._id !== studentId)
        );
        alert(data.message || "Student removed successfully");
      } else {
        throw new Error(data.message || "Failed to delete student");
      }
    } catch (err) {
      console.error("Error deleting student:", err);
      alert(err instanceof Error ? err.message : "Failed to delete student");
    } finally {
      setDeletingStudents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="card-box">

      {/* Main Content */}
      <div className="assignments-list-sec">
        {/* Header Section */}
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
              <h2 className="m-0">
                My Students
              </h2>
            </div>
            <div className="right-form">
              <Link href="/tutor/createStudent" className="btn btn-primary add-assignments d-flex align-items-center justify-content-center gap-2 btn btn-primary"> <span className="mr-2">+</span> Add Student
              </Link>
          </div>
        </div>
        <hr className="hr-light"></hr>

        {loading ? (
          <div className="w-full flex justify-center py-12 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 max-w-md w-full text-center">
              <svg
                className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-4 text-base sm:text-lg font-medium text-red-800">
                Failed to Load Students
              </h3>
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchStudents();
                }}
                className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">
                    No Students Yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    You haven't added any students to your list. Start by adding
                    your first student to begin managing your classes.
                  </p>
                  <Link href="/tutor/createStudent">
                    <button className="mt-5 px-4 sm:px-6 py-2 sm:py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors inline-flex items-center text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Your First Student
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="w-32 px-3 py-3 text-left font-semibold text-gray-800 text-sm">
                          Name
                        </th>
                        <th className="w-40 px-3 py-3 text-left font-semibold text-gray-800 text-sm">
                          Email
                        </th>
                        <th className="w-28 px-3 py-3 text-left font-semibold text-gray-800 text-sm">
                          Contact
                        </th>
                        <th className="w-24 px-3 py-3 text-left font-semibold text-gray-800 text-sm">
                          Location
                        </th>
                        <th className="w-24 px-3 py-3 text-left font-semibold text-gray-800 text-sm">
                          Pending
                        </th>
                        <th className="w-28 px-3 py-3 text-left font-semibold text-gray-800 text-sm">
                          Perf Avg
                        </th>
                        <th className="w-28 px-3 py-3 text-left font-semibold text-gray-800 text-sm">
                          Quality Avg
                        </th>
                        <th className="w-24 px-3 py-3 text-center font-semibold text-gray-800 text-sm">
                          Assign
                        </th>
                        <th className="w-32 px-3 py-3 text-right font-semibold text-gray-800 text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr
                          key={student._id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td
                            className="px-3 py-3 text-gray-900 font-medium text-sm truncate"
                            title={student.username}
                          >
                            {student.username}
                          </td>
                          <td
                            className="px-3 py-3 text-gray-600 text-sm truncate"
                            title={student.email}
                          >
                            {student.email}
                          </td>
                          <td className="px-3 py-3 text-gray-600 text-sm">
                            {student.contact}
                          </td>
                          <td
                            className="px-3 py-3 text-gray-600 text-sm truncate"
                            title={student.city || "N/A"}
                          >
                            {student.city || "N/A"}
                          </td>
                          <td className="px-3 py-3">
                            {loadingAssignments.has(student._id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium  text-gray-800">
                                {student.pendingAssignments || 0}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              student.performanceAverage 
                            }`}>
                              {student.performanceAverage && student.performanceAverage > 0 
                                ? `${student.performanceAverage}` 
                                : 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                student.courseQualityAverage 
                                // student.courseQualityAverage > 0
                                //   ? student.courseQualityAverage >= 4
                                //     ? "bg-green-100 text-green-800"
                                //     : student.courseQualityAverage >= 3
                                //     ? "bg-yellow-100 text-yellow-800"
                                //     : "bg-red-100 text-red-800"
                                //   : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {student.courseQualityAverage &&
                              student.courseQualityAverage > 0
                                ? `${student.courseQualityAverage}`
                                : "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <Link
                              href={`/tutor/addToCourseTutor?studentId=${student._id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline text-xs"
                            >
                              Course
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                href={`/tutor/studentDetails?studentId=${student._id}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline text-xs"
                              >
                                Details
                              </Link>
                              <button
                                onClick={() => handleDeleteStudent(student._id)}
                                disabled={deletingStudents.has(student._id)}
                                className={`p-1 rounded-lg transition-colors ${
                                  deletingStudents.has(student._id)
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "text-red-600 hover:bg-red-50 hover:text-red-800"
                                }`}
                                title="Delete Student"
                              >
                                {deletingStudents.has(student._id) ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-gray-400"></div>
                                ) : (
                                  <MdDelete className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Visible on small and medium screens */}
                <div className="lg:hidden">
                  {students.map((student) => (
                    <div
                      key={student._id}
                      className="border-b border-gray-100 p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-3">
                        {/* Student Name */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {student.username}
                          </h3>
                        </div>

                        {/* Student Details */}
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-sm font-medium text-gray-500 sm:w-24">
                              Email:
                            </span>
                            <span className="text-sm text-gray-700 break-all">
                              {student.email}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-sm font-medium text-gray-500 sm:w-24">
                              Contact:
                            </span>
                            <span className="text-sm text-gray-700">
                              {student.contact}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-sm font-medium text-gray-500 sm:w-24">
                              Location:
                            </span>
                            <span className="text-sm text-gray-700">
                              {student.city || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {/* Pending Assignments */}
                          <div>
                            <span className="text-sm font-medium text-gray-500 block mb-1">
                              Pending Assignments:
                            </span>
                            {loadingAssignments.has(student._id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {student.pendingAssignments || 0}
                              </span>
                            )}
                          </div>

                          {/* Performance Average */}
                          <div>
                            <span className="text-sm font-medium text-gray-500 block mb-1">Performance Avg:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              student.performanceAverage 
                            }`}>
                              {student.performanceAverage && student.performanceAverage > 0 
                                ? `${student.performanceAverage}` 
                                : 'N/A'}
                            </span>
                          </div>

                          {/* Course Quality Average */}
                          <div>
                            <span className="text-sm font-medium text-gray-500 block mb-1">
                              Quality Avg:
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                student.courseQualityAverage 
                              }`}
                            >
                              {student.courseQualityAverage &&
                              student.courseQualityAverage > 0
                                ? `${student.courseQualityAverage}`
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 border-t border-gray-100">
                          <Link
                            href={`/tutor/addToCourseTutor?studentId=${student._id}`}
                            className="flex-1"
                          >
                            <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                              Assign Course
                            </button>
                          </Link>
                          <Link
                            href={`/tutor/studentDetails?studentId=${student._id}`}
                            className="flex-1"
                          >
                            <button className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                              View Details
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteStudent(student._id)}
                            disabled={deletingStudents.has(student._id)}
                            className={`px-3 py-2 text-sm rounded-md transition-colors ${
                              deletingStudents.has(student._id)
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700"
                            }`}
                            title="Delete Student"
                          >
                            {deletingStudents.has(student._id) ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <MdDelete className="h-4 w-4" />
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <AddNewStudentModal />
    </div>
  );
}
