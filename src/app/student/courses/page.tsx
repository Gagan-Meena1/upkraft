"use client";

import React, { useState, useEffect } from 'react';
import { Book, Clock, IndianRupee, List } from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import DashboardLayout from '@/app/components/DashboardLayout';

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

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

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

  const viewPerformanceRoutes = {
    "Music": "/student/performance/viewPerformance",
    "Dance": "/student/performance/viewPerformance/dance",
    "Drawing": "/student/performance/viewPerformance/drawing"
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-2xl font-light text-gray-800 animate-pulse">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="bg-gray-50 p-8 rounded-xl text-center shadow-md">
          <h2 className="text-2xl text-red-600 mb-4">Error</h2>
          <p className="text-gray-800">{error}</p>
        </div>
      </div>
    );
  }

  const coursesContent = (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-orange-500">My Courses</h1>
      </div>
      
      <Toaster />

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-100">
          <h2 className="text-2xl text-gray-800 mb-4">No Courses Available</h2>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course._id} 
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transform transition-all hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">{course.title}</h2>
                <div className="flex items-center gap-2">
                  <Clock className="text-orange-500" size={18} />
                  <span className="text-gray-700">{course.duration}</span>
                </div>
              </div>

              <p 
  className="text-gray-600 mb-4 truncate hover:truncate cursor-pointer transition-all duration-300" 
  title={course.description}
>
  {course.description}
</p>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <IndianRupee className="text-orange-500" size={18} />
                  <span className="text-gray-800 font-semibold">{course.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <List className="text-orange-500" size={18} />
                  <span className="text-gray-700">{course.curriculum.length} Sessions</span>
                </div>
              </div>

              <div className="mt-4">
                <Link
                 href={`${viewPerformanceRoutes[course.category as keyof typeof viewPerformanceRoutes] || "/student/performance/viewPerformance"}?courseId=${course._id}&studentId=${userData._id}`}>
                  <button className="mb-2 w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    View Performance
                  </button>
                </Link>
                <Link href={`/student/courseQuality?courseId=${course._id}`}>
                  <button className="w-full mb-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    Course Quality
                  </button>
                </Link>
                <Link href={`/student/courses/courseDetails?courseId=${course._id}`}>
                  <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <DashboardLayout userData={userData} userType="student">
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {coursesContent}
        </div>
      </div>
    </DashboardLayout>
  );
}