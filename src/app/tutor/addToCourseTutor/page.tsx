"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClassSelectionModal, {
  AssignPayload,
} from "@/app/components/addClass"; // adjust path as needed

interface Course {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  duration: string;
  instructor: string;
  price?: number;
  category?: string;
  curriculum?: any[];
}

interface CreditEntry {
  courseId: string;
  credits: number;
  startTime?: { date: string; message: string }[]; // ✅ Changed from 'type' to 'date'
}

export default function TutorCoursesPage() {
  const [isAddingStudent, setIsAddingStudent] = useState<boolean>(false);
  const [addStudentMessage, setAddStudentMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [creditsPerCourse, setCreditsPerCourse] = useState<CreditEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [tutorId, setTutorId] = useState<string>("");
  const [expandedCourses, setExpandedCourses] = useState<{
    [key: string]: boolean;
  }>({});

  // Modal state
  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [classesLoading, setClassesLoading] = useState<boolean>(false);
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sid = urlParams.get("studentId");
        setStudentId(`${sid}`);

        const response = await axios.get("/Api/tutors/courses", {
          params: { studentId: sid, tutorId },
        });

        let coursesArray: Course[] = [];
        if (response.data?.courses) {
          coursesArray = response.data.courses;
        } else if (response.data?.course) {
          coursesArray = response.data.course;
        } else if (Array.isArray(response.data)) {
          coursesArray = response.data;
        } else {
          const found = Object.values(response.data).find((v) =>
            Array.isArray(v)
          );
          if (found) coursesArray = found as Course[];
        }

        setCourses(coursesArray);
        setCreditsPerCourse(response.data?.creditsPerCourse || []);
        setIsLoading(false);
      } catch (err: any) {
        setError(`Failed to load courses: ${err.message}`);
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

const fetchClasses = async (courseId: string) => {
  try {
    setClassesLoading(true);
    const response = await axios.get(`/Api/tutors/courses/${courseId}`);
    const allClasses: any[] = response.data.classDetails || [];
    setClasses(allClasses);
    
    // ✅ ADD THIS: Extract the specific student's creditsPerCourse
    const enrolledStudents = response.data.enrolledStudents || [];
    const currentStudent = enrolledStudents.find((student: any) => student._id === studentId);
    
    if (currentStudent && currentStudent.creditsPerCourse) {
      setCreditsPerCourse(currentStudent.creditsPerCourse);
    } else {
      setCreditsPerCourse([]);
    }
    
  } catch (err: any) {
    setClasses([]);
    setCreditsPerCourse([]); // ✅ Clear on error
  } finally {
    setClassesLoading(false);
  }
};

  const handleAddStudentToCourse = async (courseId: string) => {
    setPendingCourseId(courseId);
    await fetchClasses(courseId);
    setShowClassModal(true);
  };

  const handleFinalAssign = async (payload: AssignPayload) => {
    if (!pendingCourseId) return;
    if (payload.classIds.length === 0) {
      setAddStudentMessage({
        text: "Please select at least one class",
        type: "error",
      });
      setTimeout(() => setAddStudentMessage(null), 3000);
      return;
    }

    try {
      setIsAddingStudent(true);
      setShowClassModal(false);

      const response = await axios.post("/Api/addStudentToCourse", {
        courseId: pendingCourseId,
        studentId,
        classIds: payload.classIds,
        startDate: payload.startDate,
        message: payload.message,
        credits: payload.credits,
      });

      setAddStudentMessage({
        text: response.data.message || "Course added to student successfully!",
        type: "success",
      });
    } catch (err: any) {
      setAddStudentMessage({
        text:
          err.response?.data?.message || "Failed to add course to student",
        type: "error",
      });
    } finally {
      setIsAddingStudent(false);
      setPendingCourseId(null);
      setTimeout(() => setAddStudentMessage(null), 3000);
    }
  };

  const toggleExpanded = (courseId: string) => {
    setExpandedCourses((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900">
      <Link
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 pl-16 pt-6"
        href="/tutor/myStudents"
      >
        <ArrowLeft size={20} />
        Back
      </Link>

      <div className="flex-1 w-full max-w-6xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-4 md:mb-0">
            Course Library
          </h1>
          <div className="w-full md:w-auto relative">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full md:w-64 px-5 py-2 pl-10 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : !courses || courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">No courses available at the moment.</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">
              No courses found matching your search criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredCourses.length}{" "}
              {filteredCourses.length === 1 ? "course" : "courses"}
            </div>
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course.title || "Untitled Course"}
                        </h3>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                            Started: {formatDate(course.createdAt)}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 rounded text-xs text-blue-600">
                            Duration: {course.duration || "Not specified"}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`!text-gray-600 !text-sm !leading-6 ${
                          !expandedCourses[course._id] ? "line-clamp-1" : ""
                        }`}
                      >
                        {course.description || "No description available"}
                      </p>
                      {course.description && course.description.length > 60 && (
                        <button
                          className="!text-blue-800 !text-xs underline cursor-pointer mb-3"
                          onClick={() => toggleExpanded(course._id)}
                        >
                          {!expandedCourses[course._id]
                            ? "Show more..."
                            : "Show less"}
                        </button>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Fees: Rs {course.price ?? "N/A"}</span>
                        <span>
                          Lessons:{" "}
                          {course.curriculum
                            ? course.curriculum.length
                            : "N/A"}{" "}
                          Lessons
                        </span>
                        <span>Category: {course.category ?? "N/A"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-6">
                      <button
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
                        onClick={() => handleAddStudentToCourse(course._id)}
                        title="Add course to Student"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add Course
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Loading overlay */}
      {isAddingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mb-4" />
            <p className="text-gray-700">Adding student to course...</p>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {addStudentMessage && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            addStudentMessage.type === "success"
              ? "bg-green-100 border-l-4 border-green-500"
              : "bg-red-100 border-l-4 border-red-500"
          }`}
        >
          <div className="flex items-center">
            {addStudentMessage.type === "success" ? (
              <svg
                className="h-6 w-6 text-green-500 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-red-500 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <p
              className={
                addStudentMessage.type === "success"
                  ? "text-green-700"
                  : "text-red-700"
              }
            >
              {addStudentMessage.text}
            </p>
          </div>
        </div>
      )}

      {/* Class Selection Modal */}
      <ClassSelectionModal
        open={showClassModal}
        onClose={() => setShowClassModal(false)}
        onConfirm={handleFinalAssign}
        classes={classes}
        loading={classesLoading}
        courseId={pendingCourseId}
        creditsPerCourse={creditsPerCourse}
      />
    </div>
  );
}