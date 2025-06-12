"use client";

import React, { useState, useEffect } from 'react';
import { Book, Clock, IndianRupee, List ,MessageCircle,Trash2, ChevronLeft } from 'lucide-react';
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
}

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);


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
    // 3. Add this delete function after your fetchCourses function
   
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
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-100">
          <h2 className="text-2xl text-red-600 mb-4">Error</h2>
          <p className="text-gray-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Toaster />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/tutor" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </Link>
              <h1 className="text-2xl font-semibold text-gray-800">My Courses</h1>
            </div>
            <Link href="/tutor/create-course">
              <button className="bg-orange-500 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors">
                <Book size={20} /> Create New Course
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-100">
            <h2 className="text-2xl text-gray-800 mb-4">No Courses Available</h2>
            <p className="text-gray-700">Start creating your first course!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course._id} 
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transform transition-all hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800 truncate max-w-[70%]">{course.title}</h2>
                  <div className="flex items-center gap-1 text-gray-600 shrink-0">
                    <Clock className="text-orange-500 h-4 w-4" />
                    <span className="text-sm">{course.duration}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 truncate">{course.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold text-lg">₹</span>
                    <span className="text-gray-800 font-semibold">{course.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <List className="text-orange-500 h-4 w-4" />
                    <span className="text-sm text-gray-600">{course.curriculum.length} Sessions</span>
                  </div>
                </div>

               <div className="mt-4 flex items-center gap-2 mb-2">
                <Link 
                  href={`/tutor/viewClassQuality?courseId=${course._id}`}
                  className="flex-1 whitespace-nowrap px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <MessageCircle className="h-4 w-4" />
                  Class Quality
                </Link>
                
                <button
                  onClick={() => handleDeleteCourse(course._id)}
                  disabled={deletingCourseId === course._id}
                  className={`flex-1 whitespace-nowrap px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium ${
                    deletingCourseId === course._id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {deletingCourseId === course._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>

              <Link href={`/tutor/courses/${course._id}`}>
                <button className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  View Details
                </button>
              </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}