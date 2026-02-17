"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowLeft} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  duration: string;
  instructor: string;
  price?: number;
  category?: string;
  // Add other fields as needed
}

export default function TutorCoursesPage() {
  const [isAddingStudent, setIsAddingStudent] = useState<boolean>(false);
   const [addStudentMessage, setAddStudentMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [tutorId, setTutorId] = useState<string>("");
  const [expandedCourses, setExpandedCourses] = useState<{ [key: string]: boolean }>({});
  const [showClassModal, setShowClassModal] = useState<boolean>(false);
const [classes, setClasses] = useState<any[]>([]);
const [classesLoading, setClassesLoading] = useState<boolean>(false);
const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
      const studentId = urlParams.get('studentId'); //
    //   const tutorId = urlParams.get('tutorId'); //
      setStudentId(`${studentId}`);
    //   setTutorId(`${tutorId}`);
        console.log("Fetching courses from API...");
        
        const response = await axios.get('/Api/tutors/courses', {
          params: {
            studentId: studentId,
            tutorId: tutorId
          }
        });
        console.log("API response:", response.data);
        
        // Check the structure of the response and extract courses properly
        let coursesArray: Course[] = [];
        
        if (response.data && response.data.courses) {
          coursesArray = response.data.courses;
        } else if (Array.isArray(response.data)) {
          // If the response directly returns an array
          coursesArray = response.data;
        } else {
          // Try to find courses in the response object
          const possibleCourseData = Object.values(response.data).find(
            value => Array.isArray(value)
          );
          
          if (possibleCourseData) {
            coursesArray = possibleCourseData as Course[];
          }
        }
        
        console.log(`Found ${coursesArray.length} courses to display`);
        setCourses(coursesArray);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching courses:", error);
        setError(`Failed to load courses: ${error.message}`);
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const fetchClasses = async (courseId: string) => {
  try {
    setClassesLoading(true);
    const response = await axios.get(`/Api/tutors/courses/${courseId}`);
    const allClasses: any[] = response.data.classDetails || [];
    // Only future classes
    setClasses(allClasses.filter((cls) => new Date(cls.startTime) > new Date()));
  } catch (error) {
    console.error("Error fetching classes:", error);
    setClasses([]);
  } finally {
    setClassesLoading(false);
  }
};

const groupClasses = (classList: any[]) => {
  const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayMap: Record<string, Record<string, any[]>> = {};

  classList.forEach((cls) => {
    const start = new Date(cls.startTime);
    const end = new Date(cls.endTime);
    const day = DAY_ORDER[start.getDay()];
    const timeSlot = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    if (!dayMap[day]) dayMap[day] = {};
    if (!dayMap[day][timeSlot]) dayMap[day][timeSlot] = [];
    dayMap[day][timeSlot].push(cls);
  });

  return DAY_ORDER
    .filter((day) => dayMap[day])
    .map((day) => ({
      day,
      timeSlots: Object.entries(dayMap[day]).map(([timeSlot, classes]) => ({
        timeSlot,
        classes,
        groupKey: `${day}__${timeSlot}`,
      })),
    }));
};

const handleGroupToggle = (groupKey: string) => {
  setSelectedGroups((prev) =>
    prev.includes(groupKey)
      ? prev.filter((k) => k !== groupKey)
      : [...prev, groupKey]
  );
};
 const handleAddStudentToCourse = async (courseId: string) => {
  setPendingCourseId(courseId);
  setSelectedGroups([]);
  await fetchClasses(courseId);
  setShowClassModal(true);
};

const handleFinalAssign = async () => {
  if (!pendingCourseId) return;
  if (selectedGroups.length === 0) {
    setAddStudentMessage({ text: "Please select at least one class group", type: "error" });
    setTimeout(() => setAddStudentMessage(null), 3000);
    return;
  }

  // Collect all class IDs from selected groups
  const grouped = groupClasses(classes);
  const selectedClassIds = grouped
    .flatMap((dayGroup) => dayGroup.timeSlots)
    .filter((slot) => selectedGroups.includes(slot.groupKey))
    .flatMap((slot) => slot.classes.map((cls: any) => cls._id));

  try {
    setIsAddingStudent(true);
    setShowClassModal(false);

    const response = await axios.post("/Api/addStudentToCourse", {
      courseId: pendingCourseId,
      studentId,
      classIds: selectedClassIds,
    });

    setAddStudentMessage({
      text: response.data.message || "Course added to student successfully!",
      type: "success",
    });
  } catch (error: any) {
    setAddStudentMessage({
      text: error.response?.data?.message || "Failed to add course to student",
      type: "error",
    });
  } finally {
    setIsAddingStudent(false);
    setPendingCourseId(null);
    setSelectedGroups([]);
    setTimeout(() => setAddStudentMessage(null), 3000);
  }
};

  // Handler to toggle expanded state for a course
const toggleExpanded = (courseId: string) => {
  setExpandedCourses(prev => ({
    ...prev,
    [courseId]: !prev[courseId]
  }));
};

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900">
      <Link
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 pl-16"
                  href="/tutor/myStudents"
                >
                  <ArrowLeft size={20} />
                  Back
                </Link>
      {/* Navigation - keep as is */}
        {/* <nav className="w-full py-6 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
          <div className="font-extrabold text-2xl text-gray-800">
          </div>
          <div className="flex space-x-4">
            <Link href={`/tutor/myStudents`}>
              <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition">
                Back 
              </button>
            </Link>
          </div>
        </nav> */}

      {/* Main Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-4 md:mb-0">Course Library</h1>
          <div className="w-full md:w-auto">
            <div className="relative">
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
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {!courses || courses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500">No courses available at the moment.</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500">No courses found matching your search criteria.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-500">
                  Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                </div>
                
                {/* Changed from grid to single column layout */}
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div key={course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between">
                        {/* Left side - Course info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{course.title || 'Untitled Course'}</h3>
                            <div className="flex gap-2">
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                Started: {formatDate(course.createdAt)}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 rounded text-xs text-blue-600">
                                Duration: {course.duration || 'Not specified'}
                              </span>
                            </div>
                          </div>
                          <p className={`!text-gray-600 !text-sm !leading-6 ${!expandedCourses[course._id] ? "line-clamp-1" : ""}`}>
                            {course.description || 'No description available'}
                          </p>
                          {course.description && course.description.length > 60 && (
                            <button
                              className="!text-blue-800 !text-xs underline cursor-pointer mb-3"
                              onClick={() => toggleExpanded(course._id)}
                            >
                              {!expandedCourses[course._id] ? "Show more..." : "Show less"}
                            </button>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Fees: Rs {course.price ?? "N/A"}</span>
                            <span>Lessons: {course.curriculum ? course.curriculum.length : "N/A"} Lessons</span>
                            <span>Category: {course.category ?? "N/A"}</span>
                          </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center gap-3 ml-6">
                        
                          <button 
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
                            onClick={() => handleAddStudentToCourse(course._id)}
                            title="Add course to Student"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
          </>
        )}
      </div>

    {/* Keep all existing loading overlay and notification code exactly as is */}
    {isAddingStudent && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mb-4"></div>
          <p className="text-gray-700">Adding student to course...</p>
        </div>
      </div>
    )}

    {addStudentMessage && (
      <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        addStudentMessage.type === 'success' ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'
      }`}>
        <div className="flex items-center">
          {addStudentMessage.type === 'success' ? (
            <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <p className={addStudentMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {addStudentMessage.text}
          </p>
        </div>
      </div>
    )}
    {/* Class Selection Modal */}
{showClassModal && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    onClick={(e) => { if (e.target === e.currentTarget) setShowClassModal(false); }}
  >
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Select Class Groups</h2>
        <button
          onClick={() => setShowClassModal(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-6 py-4">
        {classesLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mb-3" />
            <p className="text-gray-500 text-sm">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No upcoming classes found for this course.</p>
          </div>
        ) : (
          groupClasses(classes).map((dayGroup) => (
            <div key={dayGroup.day} className="mb-5">
              {/* Day Header */}
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-100 rounded px-2 py-1 mb-2">
                {dayGroup.day}
              </div>

              <div className="flex flex-col gap-2">
                {dayGroup.timeSlots.map((slot) => {
                  const isSelected = selectedGroups.includes(slot.groupKey);
                  return (
                    <div
                      key={slot.groupKey}
                      onClick={() => handleGroupToggle(slot.groupKey)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "bg-purple-50 border-purple-500"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                            isSelected ? "bg-purple-600 border-purple-600" : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900">{slot.timeSlot}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {slot.classes.map((cls: any) => (
                              <span
                                key={cls._id}
                                className={`text-xs px-2 py-0.5 rounded-full text-white ${
                                  cls.status === "completed" ? "bg-green-500" :
                                  cls.status === "canceled" ? "bg-red-500" :
                                  cls.status === "rescheduled" ? "bg-orange-500" : "bg-blue-500"
                                }`}
                              >
                                {cls.status}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs text-gray-400 ml-3 flex-shrink-0">
                        {slot.classes.length} session{slot.classes.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <span className="text-sm text-gray-500">
          {selectedGroups.length} group{selectedGroups.length !== 1 ? "s" : ""} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setShowClassModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFinalAssign}
            disabled={selectedGroups.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm & Add ({selectedGroups.length})
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}