"use client";

import React, { useState, useEffect } from 'react';
import { Book, Clock, IndianRupee, List, MessageCircle, Trash2, ChevronLeft, BarChart3, Pencil, Edit, Eye, Copy } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { use } from 'react';
import { toast, Toaster } from 'react-hot-toast';

// Define the Course interface based on your mongoose schema
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
  category?: string;
}

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [copyingCourseId, setCopyingCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/Api/tutors/courses'); // Use the correct route
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch courses: ${errorText}`);
        }
  
        const data = await response.json();
        // console.log('Courses data:', data);
        
        // Change this line to match the API response
        setCourses(data.course); // Use 'course' instead of 'courses'
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

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingCourseId(courseId);
      
      const response = await fetch(`/Api/tutors/courses?courseId=${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || 'Course deleted successfully');
        // Remove the deleted course from the local state
        setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
      } else {
        throw new Error(data.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete course');
    } finally {
      setDeletingCourseId(null);
    }
  };

  const handleCopyCourse = async (course: Course) => {
    if (!confirm(`Are you sure you want to create a copy of "${course.title}"?`)) {
      return;
    }

    try {
      setCopyingCourseId(course._id);
      
      // Create a copy of the course data with modified title
      const courseDataToCopy = {
        title: `${course.title} (Copy)`,
        description: course.description,
        duration: course.duration,
        price: course.price,
        curriculum: course.curriculum,
        category: course.category || ''
      };

      const response = await fetch('/Api/dublicateCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseDataToCopy),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to copy course');
      }

      const data = await response.json();
      
      if (data.course) {
        toast.success('Course copied successfully!');
        // Add the new course to the local state
        setCourses(prevCourses => [...prevCourses, ...data.course]);
      } else {
        toast.success('Course copied successfully!');
        // If the API doesn't return the new course, refresh the courses list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error copying course:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to copy course');
    } finally {
      setCopyingCourseId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-md border border-gray-100 w-full max-w-md">
          <h2 className="text-xl sm:text-2xl text-red-600 mb-4">Error</h2>
          <p className="text-gray-800 text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Toaster />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/tutor" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">My Courses</h1>
            </div>
            <Link href="/tutor/create-course" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-orange-500 text-white px-4 sm:px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors text-sm sm:text-base">
                <Book size={18} className="sm:size-5" /> 
                <span className="hidden xs:inline">Create New Course</span>
                <span className="xs:hidden">Create Course</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-md border border-gray-100">
            <h2 className="text-xl sm:text-2xl text-gray-800 mb-4">No Courses Available</h2>
            <p className="text-gray-700 text-sm sm:text-base">Start creating your first course!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses.map((course) => (
              <div 
                key={course._id} 
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 transform transition-all hover:shadow-lg"
              >
                {/* Course Header with Copy Button */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                  <h2 
                    className="text-lg sm:text-xl font-bold text-gray-800 truncate sm:max-w-[60%]" 
                    title={course.title}
                  >
                    {course.title}
                  </h2>
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyCourse(course)}
                      disabled={copyingCourseId === course._id}
                      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Copy course"
                    >
                      {copyingCourseId === course._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500"></div>
                      ) : (
                        <Copy className="text-gray-600 hover:text-orange-500 h-4 w-4" />
                      )}
                    </button>
                    {/* Duration */}
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="text-orange-500 h-4 w-4" />
                      <span className="text-sm">{course.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Course Description */}
                <p 
                  className="text-gray-600 mb-4 text-sm sm:text-base truncate cursor-help" 
                  title={course.description}
                >
                  {course.description}
                </p>

                {/* Price and Sessions */}
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="text-orange-500" size={18} />
                    <span className="text-gray-800 font-semibold">{course.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <List className="text-orange-500" size={18} />
                    <span className="text-gray-700">{course.curriculum.length} Sessions</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  {/* Top Row - Edit and Quality */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/tutor/create-course?edit=true&courseId=${course._id}`}>
                      <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm">
                        <Edit size={16} className="sm:size-[18px]" />
                        <span className="hidden xs:inline">Edit</span>
                      </button>
                    </Link>
                    <Link href={`/tutor/courseQuality?courseId=${course._id}`}>
                      <button className="w-full bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 px-3 sm:px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm">
                        <BarChart3 size={16} className="sm:size-[18px]" />
                        <span className="hidden xs:inline">Quality</span>
                      </button>
                    </Link>
                  </div>

                  {/* Bottom Row - View Details */}
                  <Link href={`/tutor/courses/${course._id}`} className="block">
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2">
                      <Eye size={16} className="sm:size-[18px]" />
                      <span>View Details</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}