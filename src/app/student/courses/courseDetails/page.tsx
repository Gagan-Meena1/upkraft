"use client";

import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

import DashboardLayout from '@/app/components/DashboardLayout';

interface ClassDetail {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  recording: string | null;
  performanceVideo: string | null;
}

interface CourseDetail {
  _id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  curriculum: Array<{
    sessionNo: string;
    topic: string;
    tangibleOutcome: string;
    _id: string;
  }>;
}

const CourseDetailsPage = () => {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetail | null>(null);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [userData, setUserData] = useState<any>(null);

  // Extract courseId from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get('courseId');
    setCourseId(id);
  }, []);

  // Fetch user data
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
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/Api/student/courseDetails?courseId=${courseId}`);
      
      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setCourseDetails(data.courseDetails);
        setClassDetails(data.classDetails);
      } else {
        throw new Error(data.message || 'Failed to fetch course details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const pageContent = (
    <>
      <Toaster />
      
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600 text-lg">Loading course details...</p>
        </div>
      ) : error ? (
        <div className="max-w-4xl mx-auto bg-red-50 p-4 rounded-lg border border-red-200">
          <h1 className="text-red-600 text-xl font-medium">Error Loading Course</h1>
          <p className="text-red-500 mt-2">{error}</p>
          <button 
            onClick={fetchCourseDetails} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="min-w-full mx-auto">
          {courseDetails && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">
            {courseDetails.title}
          </h1>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-700 mb-4">{courseDetails.description}</p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <span className="text-gray-500 text-sm">Duration</span>
                <p className="font-medium text-black">{courseDetails.duration}</p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <span className="text-gray-500 text-sm">Price</span>
                <p className="font-medium text-black">${courseDetails.price}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href={`/student/classQuality?courseId=${courseId}`}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-md shadow-md hover:from-orange-600 hover:to-orange-700 transition-all duration-300 inline-flex items-center justify-center text-sm font-medium"
            >
              Class Quality
            </Link>
          </div>
        </div>
)}

          <h2 className="text-2xl font-bold text-orange-500 mb-4">Class Schedule</h2>
          
          {classDetails.length === 0 ? (
            <p className="text-gray-500 italic">No classes scheduled for this course yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {classDetails.map((classItem) => (
                <div key={classItem._id} className="bg-gray-100 p-4 rounded-lg">
  <h3 className="text-lg font-medium text-orange-500">{classItem.title}</h3>
  <p className="text-gray-600 text-sm mb-2">{classItem.description}</p>
  <div className="mt-3">
    <div className="flex items-center text-gray-700">
      <span className="text-gray-500 w-24">Date:</span>
      <span>{formatDate(classItem.startTime)}</span>
    </div>
    <div className="flex items-center text-gray-700">
      <span className="text-gray-500 w-24">Time:</span>
      <span>{formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}</span>
    </div>
    {/* {classItem.recording && (
      <div className="mt-2">
    <a 
      href={classItem.recording} 
      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center text-sm font-medium w-fit"
      target="_blank" 
      rel="noopener noreferrer"
    >
      View Recording
    </a>
  </div>
    )} */}
    
    {/* New buttons section */}
   <div className="mt-4 flex space-x-3">
  {classItem.recording && (
    <a 
      href={classItem.recording} 
      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center text-sm font-medium"
      target="_blank" 
      rel="noopener noreferrer"
    >
      View Recording
    </a>
  )}
  {classItem.performanceVideo && (
  <a 
    href={classItem.performanceVideo} 
    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center text-sm font-medium"
    target="_blank" 
    rel="noopener noreferrer"
  >
    Performance Video
  </a>
)}
  
  
            </div>
              </div>
            </div>
              ))}
            </div>
          )}
        </div>
      
      )}
        {/* Curriculum */}
        {courseDetails && courseDetails.curriculum && courseDetails.curriculum.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Course Curriculum
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                {courseDetails.curriculum.map((item) => (
                  <div 
                    key={item.sessionNo} 
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-800">
                          Session {item.sessionNo}: {item.topic}
                        </div>
                        <div className="text-gray-600 mt-1">
                          {item.tangibleOutcome}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
    </>
  );

  return (
    <DashboardLayout userData={userData} userType="student">
      <div className="bg-gray-50 min-h-screen">
        {pageContent}
      </div>
    </DashboardLayout>
  );
};

export default CourseDetailsPage;