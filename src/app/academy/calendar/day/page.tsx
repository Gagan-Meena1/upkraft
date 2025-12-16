"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Clock, BookOpen, User, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import * as dateFnsTz from 'date-fns-tz';
import { format, parseISO } from 'date-fns';

import { Suspense } from 'react';


interface Course {
  _id: string;
  title: string;
  category: string;
  class: string[];
}

interface ClassData {
  _id: string;
  title: string;
  course: {
    _id: string;
    title: string;
    category: string;
  };
  startTime: string;
  endTime: string;
  description?: string;
  instructor?: {
    _id: string;
    username: string;
    email: string;
  };
  status?: string;
}

interface GroupedClasses {
  courseId: string;
  courseName: string;
  courseCategory: string;
  classes: ClassData[];
}

const AcademyDayDetailsPage = () => {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTz, setUserTz] = useState<string>("UTC");

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
    
    if (dateParam) {
      setSelectedDate(new Date(dateParam));
    }
  }, [dateParam]);

  useEffect(() => {
    if (selectedDate) {
      fetchData();
    }
  }, [selectedDate]);

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
      toast.error("Failed to load class data");
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

  // Get classes for the selected date with proper course mapping
  const getClassesForDate = () => {
    if (!selectedDate) return [];
    
    return allClasses.filter(classItem => {
      if (!classItem.startTime) return false;
      return isSameDayInTz(classItem.startTime, selectedDate, userTz);
    });
  };

  // Group classes by course
  const getGroupedClasses = (): GroupedClasses[] => {
    const classes = getClassesForDate();
    const grouped = new Map<string, GroupedClasses>();

    classes.forEach(classItem => {
      const courseId = typeof classItem.course === 'string' 
        ? classItem.course 
        : classItem.course?._id || '';
      const courseName = typeof classItem.course === 'object'
        ? classItem.course?.title
        : courses.find(c => c._id === courseId)?.title || "Unknown Course";
      const courseCategory = typeof classItem.course === 'object'
        ? classItem.course?.category
        : courses.find(c => c._id === courseId)?.category || "Unknown";
      
      if (!grouped.has(courseId)) {
        grouped.set(courseId, {
          courseId,
          courseName,
          courseCategory,
          classes: []
        });
      }
      
      grouped.get(courseId)!.classes.push(classItem);
    });

    // Sort classes within each course by start timee
    grouped.forEach(group => {
      group.classes.sort((a, b) => 
        parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
      );
    });

    return Array.from(grouped.values());
  };

  // Format time range in user's timezone
  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = dateFnsTz.toZonedTime(parseISO(startTime), userTz);
    const end = dateFnsTz.toZonedTime(parseISO(endTime), userTz);
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  const groupedClasses = getGroupedClasses();
  const totalClasses = groupedClasses.reduce((sum, group) => sum + group.classes.length, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!selectedDate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No date selected</p>
          <Link
            href="/academy/calendar"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Back to Calendar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/academy/calendar"
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </Link>
          
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {totalClasses} {totalClasses === 1 ? "class" : "classes"} scheduled
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        {groupedClasses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Classes Scheduled
            </h3>
            <p className="text-gray-600">
              There are no classes scheduled for this day.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedClasses.map((group) => (
              <div
                key={group.courseId}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Course Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{group.courseName}</h2>
                      <p className="text-purple-100 text-sm mt-1">
                        {group.courseCategory} • {group.classes.length}{" "}
                        {group.classes.length === 1 ? "class" : "classes"}
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                {/* Classes List */}
                <div className="divide-y divide-gray-200">
                  {group.classes.map((classItem) => (
                    <div
                      key={classItem._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        {/* Class Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {classItem.title}
                          </h3>
                          
                          {classItem.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {classItem.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {/* Time */}
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>
                                {formatTimeRange(classItem.startTime, classItem.endTime)}
                              </span>
                            </div>

                            {/* Instructor */}
                            {classItem.instructor && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>{classItem.instructor.username}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        {classItem.status && (
                          <div className="flex-shrink-0">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                classItem.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : classItem.status === "canceled"
                                  ? "bg-red-100 text-red-800"
                                  : classItem.status === "rescheduled"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {classItem.status.charAt(0).toUpperCase() +
                                classItem.status.slice(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
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
      <AcademyDayDetailsPage />
    </Suspense>
  );
}