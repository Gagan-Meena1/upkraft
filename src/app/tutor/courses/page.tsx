"use client";

import React, { useState, useEffect } from 'react';
import { Book, Clock, IndianRupee, List, MessageCircle, Trash2, ChevronLeft, BarChart3, Pencil, Edit, Eye, ChevronDown, Plus, ArrowRight, X, Search, Settings } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

// Sidebar Component
const Sidebar = ({ userType }) => {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800">Navigation</h2>
        {/* Add your sidebar content here */}
      </div>
    </div>
  );
};

// Define the Course interface
interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  curriculum: {
    sessionNo: number;
    topic: string;
    tangibleOutcome: string;
  }[];
  createdAt?: string;
}

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  
  // Filter and UI states
  const [selectedFilter, setSelectedFilter] = useState("All Months");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    courseId: string | null;
    courseName: string;
  }>({
    isOpen: false,
    courseId: null,
    courseName: "",
  });

  const filterOptions = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December", "All Months"];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/Api/tutors/courses');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch courses: ${errorText}`);
        }
  
        const data = await response.json();
        setCourses(data.course || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err.message : 'Unable to load courses');
        toast.error('Failed to load courses');
        setIsLoading(false);
      }
    };
  
    fetchCourses();
  }, []);

  // Helper function to get month from course creation date
  const getCourseMonth = (course: Course) => {
    if (course.createdAt) {
      const date = new Date(course.createdAt);
      return date.toLocaleString('default', { month: 'long' });
    }
    // Fallback to current month if no creation date
    return new Date().toLocaleString('default', { month: 'long' });
  };

  // Helper function to format date as "25 July" format
  const getStartedFromDate = (course: Course) => {
    if (course.createdAt) {
      const date = new Date(course.createdAt);
      return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}`;
    }
    return "25 July"; // Fallback
  };

  // Filter courses based on selected month
  const filteredCourses = selectedFilter === "All Months" 
    ? courses 
    : courses.filter((course) => getCourseMonth(course) === selectedFilter);

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
  };

  const handleAddCourse = () => {
    // Navigate to create course page
    window.location.href = '/tutor/create-course';
  };

  const handleClassQuality = (courseId: string) => {
    window.location.href = `/tutor/courseQuality?courseId=${courseId}`;
  };

  const handleViewDetail = (courseId: string) => {
    window.location.href = `/tutor/courses/${courseId}`;
  };

  const handleEdit = (courseId: string) => {
    window.location.href = `/tutor/create-course?edit=true&courseId=${courseId}`;
  };

  const handleDeleteClick = (courseId: string, courseName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      courseId,
      courseName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.courseId) return;

    try {
      setDeletingCourseId(deleteConfirmation.courseId);
      
      const response = await fetch(`/Api/tutors/courses?courseId=${deleteConfirmation.courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || 'Course deleted successfully');
        setCourses(prevCourses => prevCourses.filter(course => course._id !== deleteConfirmation.courseId));
      } else {
        throw new Error(data.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete course');
    } finally {
      setDeletingCourseId(null);
      setDeleteConfirmation({
        isOpen: false,
        courseId: null,
        courseName: "",
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      courseId: null,
      courseName: "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userType="tutor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6F09BA]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userType="tutor" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-md border border-gray-100 w-full max-w-md">
            <h2 className="text-xl sm:text-2xl text-red-600 mb-4">Error</h2>
            <p className="text-gray-800 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster />
      <Sidebar userType="tutor" />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search here"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F09BA] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Green K Circle */}
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">K</span>
              </div>

              <button className="p-2 text-gray-600 hover:text-[#6F09BA] transition-colors">
                <Settings size={20} />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#FFC357] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">TU</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Tutor User</p>
                  <p className="text-xs text-gray-500">Tutor</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">My Courses</h1>

            <div className="flex items-center space-x-4">
              {/* Month Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-none bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">{selectedFilter}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    <div className="py-1">
                      {filterOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleFilterSelect(option)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            selectedFilter === option ? "bg-[#6F09BA] text-white" : "text-gray-700"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add Course Button */}
              <button
                onClick={handleAddCourse}
                className="flex items-center space-x-2 px-4 py-2 bg-[#6F09BA] text-white rounded-none hover:bg-[#5A0799] transition-colors"
              >
                <Plus size={16} />
                <span>Add Course</span>
              </button>
            </div>
          </div>

          {/* Courses List */}
          <div className="space-y-0">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div key={course._id} className="bg-white p-6 border-b border-gray-200">
                  {/* Course Title with Actions */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(course._id)}
                        className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                        title="Edit Course"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(course._id, course.title)}
                        className="p-1 text-red-500 hover:text-red-600 transition-colors"
                        title="Delete Course"
                        disabled={deletingCourseId === course._id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="flex flex-wrap items-center gap-6 mb-4 text-sm text-gray-600">
                    <div>
                      <span>Started From : </span>
                      <span className="font-medium text-gray-900">{getStartedFromDate(course)}</span>
                    </div>
                    <div>
                      <span>Duration : </span>
                      <span className="font-medium text-gray-900">{course.duration}</span>
                    </div>
                    <div>
                      <span>Fees : </span>
                      <span className="font-medium text-gray-900">Rs {course.price}</span>
                    </div>
                    <div>
                      <span>Sessions : </span>
                      <span className="font-medium text-gray-900">{course.curriculum.length} Sessions</span>
                    </div>
                  </div>

                  {/* Course Description */}
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm">{course.description}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleClassQuality(course._id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#6F09BA] text-white rounded-none hover:bg-[#5A0799] transition-colors"
                    >
                      <span>Class Quality</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => handleViewDetail(course._id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#6F09BA] text-white rounded-none hover:bg-[#5A0799] transition-colors"
                    >
                      <span>View Detail</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No courses found for the selected filter.</p>
                <p className="text-gray-400 text-sm mt-2">Try selecting a different month or add a new course.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Course</h3>
              <button 
                onClick={handleDeleteCancel} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the course "{deleteConfirmation.courseName}"? This action cannot be
              undone.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-none hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingCourseId === deleteConfirmation.courseId}
                className="px-4 py-2 bg-red-500 text-white rounded-none hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deletingCourseId === deleteConfirmation.courseId ? 'Deleting...' : 'Delete Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for dropdown */}
      {isDropdownOpen && <div className="fixed inset-0 z-0" onClick={() => setIsDropdownOpen(false)} />}
    </div>
  );
}