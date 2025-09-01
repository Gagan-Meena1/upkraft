"use client";

import React, { useState, useEffect } from 'react';
import { Book, Clock, IndianRupee, List, ChevronDown, Plus, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';

// Define the Course interface based on your mongoose schema
interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  price: number;
  curriculum: {
    sessionNo: number;
    topic: string;
    tangibleOutcome: string;
  }[];
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Filter and UI states
  const [selectedFilter, setSelectedFilter] = useState("All Categories");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filterOptions = [
    "Music",
    "Dance", 
    "Drawing",
    "All Categories",
  ];

  const viewPerformanceRoutes = {
    "Music": "/student/performance/viewPerformance",
    "Dance": "/student/performance/viewPerformance/dance",
    "Drawing": "/student/performance/viewPerformance/drawing"
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/Api/users/user');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${await response.text()}`);
        }
  
        const data = await response.json();
        setUserData(data.user);
      } catch (err) {
        console.error('Error fetching user data:', err);
        toast.error('Failed to load user data');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/Api/users/user');
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch courses: ${errorText}`);
        }
  
        const data = await response.json();
        console.log('Courses data:', data);
        
        setCourses(data.courseDetails);
        console.log("data.courseDetails : ", data.courseDetails);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Detailed error fetching courses:', err);
        setError(err instanceof Error ? err.message : 'Unable to load courses');
        toast.error('Failed to load courses');
        setIsLoading(false);
      }
    };
  
    fetchCourses();
  }, []);

  // Helper function to format date as "25 July" format
  const getStartedFromDate = (course: Course) => {
    // Since we don't have createdAt in Course interface, using fallback
    return "25 July"; // Fallback
  };

  // Filter courses based on selected category
  const filteredCourses = selectedFilter === "All Categories"
    ? courses
    : courses.filter((course) => course.category === selectedFilter);

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
  };

  const handleViewDetail = (courseId: string) => {
    window.location.href = `/student/courseDetails?courseId=${courseId}`;
  };

  const handleViewPerformance = (category: string) => {
    const route = viewPerformanceRoutes[category as keyof typeof viewPerformanceRoutes];
    if (route) {
      window.location.href = route;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6F09BA]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
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

      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mt-2 bg-white p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">My Courses</h1>

            <div className="flex items-center space-x-4">
              {/* Category Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-none bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">{selectedFilter}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
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
                            selectedFilter === option
                              ? "bg-[#6F09BA] text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Courses List */}
          <div className="space-y-0">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white p-6 border-b border-gray-200"
                >
                  {/* Course Title */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {course.title}
                    </h2>
                  </div>

                  {/* Course Details */}
                  {/* Course Details + View Button */}
<div className="flex flex-wrap items-center gap-6 mb-4 text-sm text-[#505050]">
  <div>
    <span>Started From : </span>
    <span className="font-[16px] text-[#212121]">
      {getStartedFromDate(course)}
    </span>
  </div>
  <div>
    <span>Duration : </span>
    <span className="font-medium text-gray-900">{course.duration}</span>
  </div>
  <div>
    <span>Category : </span>
    <span className="font-medium text-gray-900">{course.category}</span>
  </div>
  <div>
    <span>Fees : </span>
    <span className="font-medium text-gray-900">Rs {course.price}</span>
  </div>
  <div>
    <span>Sessions : </span>
    <span className="font-medium text-gray-900">
      {course.curriculum.length} Sessions
    </span>
  </div>

  {/* Push button to right */}
  <button
    onClick={() => handleViewDetail(course._id)}
    className="ml-auto flex items-center space-x-2 px-4 py-2 bg-[#6F09BA] text-white rounded-md hover:bg-[#5A0799] transition-colors"
  >
    <span>View Detail</span>
    <ArrowRight size={14} />
  </button>
</div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No courses found for the selected filter.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try selecting a different category.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Backdrop for dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}