"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MdDelete } from "react-icons/md";
import { ChevronLeft, ArrowLeft } from "lucide-react";
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
  const [academyId, setAcademyId] = useState<string | null>(null);
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

  // const fetchAssignmentDetails = async (
  //   assignmentIds: string[]
  // ): Promise<{ pending: number }> => {
  //   if (!assignmentIds || assignmentIds.length === 0) {
  //     return { pending: 0 };
  //   }

  //   try {
  //     const assignmentPromises = assignmentIds.map(async (assignmentId) => {
  //       const response = await fetch(
  //         `/Api/assignment/singleAssignment?assignmentId=${assignmentId}`
  //       );
  //       if (!response.ok) {
  //         console.error(`Failed to fetch assignment ${assignmentId}`);
  //         return null;
  //       }
  //       const data = await response.json();
  //       return data.success ? data.data : null;
  //     });

  //     const assignments = await Promise.all(assignmentPromises);
  //     const validAssignments = assignments.filter(
  //       Boolean
  //     ) as AssignmentDetail[];

  //     const pending = validAssignments.filter(
  //       (assignment) => !assignment.status
  //     ).length;

  //     return { pending };
  //   } catch (error) {
  //     console.error("Error fetching assignment details:", error);
  //     return { pending: 0 };
  //   }
  // };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/Api/myStudents");

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();
      console.log("API Response:", data);
      // Store academyId
      if (data.academyId) {
        setAcademyId(data.academyId);
        console.log("Academy ID:", data.academyId);
      }

      if (data && data.filteredUsers) {
        const studentsWithDetails = data.filteredUsers.map((student: Student) => {
  const performanceAverage = calculatePerformanceAverage(student);
  const courseQualityAverage = calculateCourseQualityAverage(student);

  return {
    ...student,
    // pendingAssignments is already coming from API
    performanceAverage,
    courseQualityAverage,
  };
});

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
    <div className='right-form'>
           
    <div className="card-box">
      
      {/* <Link
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
            href="/tutor"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link> */}

      {/* Main Content */}
      <div className="assignments-list-sec mobile-left-right">
        {/* Header Section */}
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head d-flex align-items-center gap-2">
              <Link href="/tutor" className='link-text back-btn'>
                <ChevronLeft />
              </Link>
              <h2 className="m-0">
                My Students

              </h2>
            </div>
          <div className="right-form">
            {!academyId && (
              <Link 
                href="/tutor/createStudent" 
                className="btn btn-primary add-assignments d-flex align-items-center justify-content-center gap-2 btn btn-primary"
              > 
                <span className="mr-2">+</span> Add Student
              </Link>
            )}
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
          <div className="assignments-list-com table-responsive">
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
                  {!academyId && (
                    <Link href="/tutor/createStudent">
                      <button className="mt-5 px-4 sm:px-6 py-2 sm:py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors inline-flex items-center text-sm sm:text-base">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Your First Student
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                  <div className="table-responsive w-1230">
                <div className=" table-sec">
                  <table className="table align-middle m-0">
                    <thead >
                      <tr>
                        <th>
                          Name
                        </th>
                        <th>
                          Email
                        </th>
                        <th>
                          Contact
                        </th>
                        <th>
                          Location
                        </th>
                        <th>
                          Pending
                        </th>
                        <th>
                          Perf Avg
                        </th>
                        <th>
                          Quality Avg
                        </th>
                        <th>
                          Assign
                        </th>
                        <th>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr
                          key={student._id}
                        >
                          <td
                            title={student.username}
                          >
                            {student.username}
                          </td>
                          <td
                            title={student.email}
                          >
                            {student.email}
                          </td>
                          <td >
                            {student.contact}
                          </td>
                          <td
                            title={student.city || "N/A"}
                          >
                            {student.city || "N/A"}
                          </td>
                          <td>
                            {loadingAssignments.has(student._id) ? (
                              <div></div>
                            ) : (
                              <span>
                                {student.pendingAssignments || 0}
                              </span>
                            )}
                          </td>
                          <td >
                            <span className={` ${
                              student.performanceAverage 
                            }`}>
                              {student.performanceAverage && student.performanceAverage > 0 
                                ? `${student.performanceAverage}` 
                                : 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span
                              className={` ${
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
                          <td>
                            <Link
                              href={`/tutor/addToCourseTutor?studentId=${student._id}`}
                              className=""
                            >
                              Course
                              </Link>
                            </td>
                            {/* <td className="">
  <span className="">
    {student.pendingAssignments || 0}
  </span>
</td>
                            <td >
                              <span
                                className={` ${student.performanceAverage}`}
                              >
                                {student.performanceAverage &&
                                student.performanceAverage > 0
                                  ? `${student.performanceAverage}`
                                  : "N/A"}
                              </span>
                            </td> */}
                            {/* <td>
                              <span
                                className={`${
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
                            </td> */}
                            <td>
                              <div className="d-flex align-content-center justify-content-between gap-2">
                              <Link
                                href={`/tutor/studentDetails?studentId=${student._id}`}
                                className=""
                              >
                                Details
                              </Link>
                              <button
                                onClick={() => handleDeleteStudent(student._id)}
                                disabled={deletingStudents.has(student._id)}
                                className={`btn-delete ${
                                  deletingStudents.has(student._id)
                                    ? "cursor-not-allowed"
                                    : "btn-delete"
                                }`}
                                title="Delete Student"
                              >
                                {deletingStudents.has(student._id) ? (
                                  <div className="btn-d"></div>
                                ) : (
                                  <MdDelete className="" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>

               
              </>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
