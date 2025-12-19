"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import * as dateFnsTz from 'date-fns-tz';
import { format, parseISO } from 'date-fns';
import { Suspense } from 'react';


interface Course {
  _id: string;
  title: string;
  category: string;
  class: string[];
    subCategory?: string; // ADD THIS LINE
    maxStudentCount: number;
    studentEnrolledCount: number;

}

interface ClassData {
  _id: string;
  title: string;
  course: {
    _id: string;
    title: string;
    category: string;
        subCategory?: string; // ADD THIS LINE
        maxStudentCount: number;
    studentEnrolledCount: number;

  };
  startTime: string;
  endTime: string;
  description?: string;
  status?: string;
}

const AcademyCalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [courses, setCourses] = useState<Course[]>([]);
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTz, setUserTz] = useState<string>("UTC");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");
  const [courseFilter, setCourseFilter] = useState<string>("All Courses");
  const [tooltipPos, setTooltipPos] = useState<{x: number, y: number} | null>(null);
const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
const [subCategoryFilter, setSubCategoryFilter] = useState<string>("All SubCategories"); // CHANGE THIS


  useEffect(() => {
    // Get user timezone
    const fetchUserData = async () => {
      try {
        const response = await fetch("/Api/users/user");
        const data = await response.json();
        if (data.user?.timezone) {
          setUserTz(data.user.timezone);
        } else {
          setUserTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
    };
    
    fetchUserData();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch courses and classes in parallel
      const [coursesResponse, classesResponse] = await Promise.all([
        fetch("/Api/tutors/courses"),
        fetch("/Api/classes")
      ]);
      
      const coursesData = await coursesResponse.json();
      const classesData = await classesResponse.json();
      
      if (coursesData.course) {
        setCourses(coursesData.course);
      }
      
      // Process all classes at once
      if (classesData.classData && Array.isArray(classesData.classData)) {
        setAllClasses(classesData.classData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  // Check if two dates are the same day in user's timezone using date-fns-tz
  const isSameDayInTz = (date1: Date | string, date2: Date, tz: string) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = date2;
    
    const zonedD1 = dateFnsTz.toZonedTime(d1, tz);
    const zonedD2 = dateFnsTz.toZonedTime(d2, tz);
    
    return format(zonedD1, 'yyyy-MM-dd') === format(zonedD2, 'yyyy-MM-dd');
  };

  // Generate month days
  const generateMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  // Get classes for a specific date with proper course mapping
const getClassesForDate = (date: Date) => {
  return allClasses.filter(classItem => {
    if (!classItem.startTime) return false;
    return isSameDayInTz(classItem.startTime, date, userTz);
  }).map(classItem => {
    const courseId = typeof classItem.course === 'string' 
      ? classItem.course 
      : classItem.course?._id || '';
    const courseName = typeof classItem.course === 'object' 
      ? classItem.course?.title 
      : courses.find(c => c._id === courseId)?.title || 'Unknown Course';
    const courseCategory = typeof classItem.course === 'object'
      ? classItem.course?.category
      : courses.find(c => c._id === courseId)?.category || 'Unknown';
    const courseSubCategory = typeof classItem.course === 'object'
      ? classItem.course?.subCategory 
      : courses.find(c => c._id === courseId)?.subCategory || '';
    // ADD THESE LINES:
    const maxStudentCount = typeof classItem.course === 'object'
      ? classItem.course?.maxStudentCount
      : courses.find(c => c._id === courseId)?.maxStudentCount || 0;
    const studentEnrolledCount = typeof classItem.course === 'object'
      ? classItem.course?.studentEnrolledCount
      : courses.find(c => c._id === courseId)?.studentEnrolledCount || 0;
    
    return {
      ...classItem,
      courseId,
      courseName,
      courseCategory,
      courseSubCategory,
      maxStudentCount,        // ADD THIS
      studentEnrolledCount    // ADD THIS
    };
  });
};

  // Get course summary for a date (grouped by course)
  const getCourseSummaryForDate = (date: Date) => {
    const classes = getClassesForDate(date);
    
    // Apply filters
      let filteredClasses = classes;
  
  if (subCategoryFilter !== "All SubCategories") { // CHANGE THIS
    filteredClasses = filteredClasses.filter(c => c.courseSubCategory === subCategoryFilter); // CHANGE THIS
  }
  
  if (courseFilter !== "All Courses") {
    filteredClasses = filteredClasses.filter(c => c.course === courseFilter);
  }
    
    // Group by course
    const courseMap = new Map<string, { courseName: string; count: number }>();
    
    filteredClasses.forEach(classItem => {
      const courseId = classItem.course;
      const courseName = classItem.courseName || "Unknown Course";
      
      if (courseMap.has(courseId)) {
        courseMap.get(courseId)!.count++;
      } else {
        courseMap.set(courseId, { courseName, count: 1 });
      }
    });
    
    return Array.from(courseMap.entries()).map(([courseId, data]) => ({
      courseId,
      courseName: data.courseName,
      classCount: data.count
    }));
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

// Get unique subCategories and courses for filters
const uniqueSubCategories = Array.from(
  new Set(courses.map(c => c.subCategory).filter(Boolean))
); // CHANGE THIS
const filteredCourses = subCategoryFilter === "All SubCategories" // CHANGE THIS
  ? courses 
  : courses.filter(c => c.subCategory === subCategoryFilter); // CHANGE THIS

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Academy Calendar
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Top Navigation Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              {/* Date Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="font-medium text-lg text-gray-900 min-w-[200px] text-center">
                  {currentDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
                
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleToday}
                  className="ml-3 px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Today
                </button>
              </div>

            {/* Filters */}
<div className="flex flex-wrap items-center gap-3">
  {/* SubCategory Filter */}
  <select
    value={subCategoryFilter}
    onChange={(e) => {
      setSubCategoryFilter(e.target.value);
      setCourseFilter("All Courses"); // Reset course filter
    }}
    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
  >
    <option>All SubCategories</option>
    {uniqueSubCategories.map(subCategory => (
      <option key={subCategory} value={subCategory}>{subCategory}</option>
    ))}
  </select>

  {/* Course Filter */}
  <select
    value={courseFilter}
    onChange={(e) => setCourseFilter(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
  >
    <option>All Courses</option>
    {filteredCourses.map(course => (
      <option key={course._id} value={course._id}>
        {course.title}
      </option>
    ))}
  </select>
</div>
            </div>

            {/* Calendar Grid */}
            <div className="mt-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {generateMonthDays(currentDate).map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="min-h-[140px]" />;
                  }

                  const dayClasses = getClassesForDate(day);
                  
                // Apply filters
let filteredDayClasses = dayClasses;
if (subCategoryFilter !== "All SubCategories") { // CHANGE THIS
  filteredDayClasses = filteredDayClasses.filter(c => c.courseSubCategory === subCategoryFilter); // CHANGE THIS
}
if (courseFilter !== "All Courses") {
  filteredDayClasses = filteredDayClasses.filter(c => c.course === courseFilter);
}
                  
                  const isToday = isSameDayInTz(new Date(), day, userTz);

                  return (
                    <Link
                      key={idx}
                      href={`/academy/calendar/day?date=${day.toISOString()}`}
                      className={`min-h-[140px] p-2 border rounded-lg hover:shadow-md transition-all cursor-pointer overflow- ${
                        isToday
                          ? "bg-purple-50 border-purple-300"
                          : "bg-white border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      {/* Date */}
                      <div
                        className={`text-sm font-semibold mb-2 ${
                          isToday ? "text-purple-700" : "text-gray-900"
                        }`}
                      >
                        {day.getDate()}
                      </div>

                      {/* Classes List */}
                      <div className="space-y-1 overflow-y-auto max-h-[100px]">
                        {filteredDayClasses.length === 0 ? (
                          <div className="text-xs text-gray-400 italic">No classes</div>
                        ) : (
                          filteredDayClasses.map((classItem, cIdx) => (
                            <div
                              key={classItem._id || cIdx}
                              className="group relative"
                            >
                         <div
  key={classItem._id || cIdx}
  className="group relative"
  onMouseEnter={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: rect.left, y: rect.bottom + 8 });
    setActiveTooltip(classItem._id || `${cIdx}`);
  }}
  onMouseLeave={() => {
    setActiveTooltip(null);
  }}
>
  {/* Class Badge */}
  <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded truncate hover:bg-purple-200 transition-colors">
    <div className="font-medium truncate">
      {classItem.title || "Untitled Class"}
    </div>
    <div className="text-[10px] text-purple-600 truncate">
      {classItem.courseName || "Unknown Course"}
    </div>
  </div>

{/* Hover Tooltip - Fixed positioning */}
{activeTooltip === (classItem._id || `${cIdx}`) && tooltipPos && (
  <div 
    className="fixed z-[9999] pointer-events-none"
    style={{
      left: `${tooltipPos.x}px`,
      top: `${tooltipPos.y}px`,
    }}
  >
    <div className="relative bg-gray-900 text-white rounded-lg shadow-xl p-4 min-w-[250px] max-w-[400px] w-max">
      {/* Title */}
      <div className="font-bold text-sm mb-2 whitespace-normal">
        {classItem.title || "Untitled Class"}
      </div>
      
      {/* Course Name */}
      <div className="text-gray-300 text-sm mb-3 whitespace-normal">
        <span className="font-semibold">Course:</span> {classItem.courseName || "Unknown"}
      </div>
      
      {/* ADD THIS SECTION - Student Enrollment */}
      <div className="text-gray-300 text-sm mb-2 flex items-center gap-2">
        <span className="font-semibold">👥 Enrollment:</span>
        <span className={`font-medium ${
          classItem.studentEnrolledCount >= classItem.maxStudentCount 
            ? 'text-red-400' 
            : classItem.studentEnrolledCount >= classItem.maxStudentCount * 0.8
              ? 'text-yellow-400'
              : 'text-green-400'
        }`}>
          {classItem.studentEnrolledCount || 0} / {classItem.maxStudentCount || 0}
        </span>
      </div>
      
      {/* Time */}
      <div className="text-gray-300 text-sm mb-2 font-medium">
        🕐 {format(dateFnsTz.toZonedTime(parseISO(classItem.startTime), userTz), 'HH:mm')} - {format(dateFnsTz.toZonedTime(parseISO(classItem.endTime), userTz), 'HH:mm')}
      </div>
      
      {/* Description */}
      {classItem.description && (
        <div className="text-gray-400 text-sm mt-3 pt-3 border-t border-gray-700 whitespace-normal">
          {classItem.description}
        </div>
      )}
      
      {/* Arrow pointing up */}
      <div className="absolute -top-1 left-4 w-3 h-3 bg-gray-900 transform rotate-45"></div>
    </div>
  </div>
)}
</div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Total Classes Counter */}
                      {filteredDayClasses.length > 0 && (
                        <div className="mt-2 pt-1 border-t border-gray-200 text-[10px] text-gray-500 text-center">
                          {filteredDayClasses.length} {filteredDayClasses.length === 1 ? 'class' : 'classes'}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default function DayViewPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    }>
      <AcademyCalendarView />
    </Suspense>
  );
}