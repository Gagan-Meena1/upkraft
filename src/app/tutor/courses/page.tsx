"use client";

import React, { useState, useEffect } from 'react';
import { Book, Clock, IndianRupee, List, MessageCircle, Trash2, ChevronLeft, BarChart3, Pencil, Edit, Eye, Copy } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { use } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import MyCourse from '@/app/components/MyCourse';

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
        title: `(Copy) ${course.title} `,
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
       <div>
      <MyCourse />
    </div>
    </div>
  );
}