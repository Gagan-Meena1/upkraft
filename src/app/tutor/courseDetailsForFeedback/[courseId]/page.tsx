"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Clock, BookOpen, MessageCircle, Video, Upload } from 'lucide-react';
import { useParams } from 'next/navigation';
import axios from 'axios';

// TypeScript interfaces for type safety
interface Curriculum {
  sessionNo: string;
  topic: string;
  tangibleOutcome: string;
}

interface Class {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  recording: string | null;
  performanceVideo: string | null;
}

interface CourseDetailsData {
  courseId: string;
  courseDetails: {
    _id: string;
    title: string;
    description: string;
    duration: string;
    price: number;
    category: string;
    curriculum: Curriculum[];
  };
  classDetails: Class[];
}

export default function CourseDetailsPage() {
  const [courseData, setCourseData] = useState<CourseDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<{[key: string]: boolean}>({});
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  const params = useParams();

  // Helper function to format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // Handle performance video upload
  const handlePerformanceVideoUpload = async (classId: string, file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      alert('File size must be less than 500MB');
      return;
    }

    setUploadLoading(prev => ({ ...prev, [classId]: true }));

    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await axios.put(`/Api/classes/update?classId=${classId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload Progress: ${percentCompleted}%`);
          }
        },
      });

      if (response.data.success) {
        // Update the local state to reflect the uploaded video
        setCourseData(prevData => {
          if (!prevData) return prevData;
          
          return {
            ...prevData,
            classDetails: prevData.classDetails.map(classItem => 
              classItem._id === classId 
                ? { ...classItem, performanceVideo: response.data.performanceVideoUrl }
                : classItem
            )
          };
        });

        alert('Performance video uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading performance video:', error);
      if (axios.isAxiosError(error)) {
        alert(`Upload failed: ${error.response?.data?.error || error.message}`);
      } else {
        alert('Upload failed. Please try again.');
      }
    } finally {
      setUploadLoading(prev => ({ ...prev, [classId]: false }));
      // Reset file input
      if (fileInputRefs.current[classId]) {
        fileInputRefs.current[classId]!.value = '';
      }
    }
  };

  // Trigger file input click
  const triggerFileInput = (classId: string) => {
    fileInputRefs.current[classId]?.click();
  };

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/Api/tutors/courses/${params.courseId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }
        
        const data = await response.json();
        setCourseData(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    if (params.courseId) {
      fetchCourseDetails();
    }
  }, [params.courseId]);
  

  const categoryRoutes = {
    "Music": "/tutor/singleStudentFeedback",
    "Dance": "/tutor/singleStudentFeedback/dance",
    "Drawing": "/tutor/singleStudentFeedback/drawing"
  };

  const viewPerformanceRoutes = {
    "Music": "/tutor/viewPerformance",
    "Dance": "/tutor/viewPerformance/dance",
    "Drawing": "/tutor/viewPerformance/drawing"
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading Course Details...</div>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-2xl font-semibold text-red-600 mb-4">
            Error Loading Course
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link 
            href="/tutor" 
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <header className="mb-8 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link
          href={`/tutor/studentDetails?studentId=${new URLSearchParams(window.location.search).get('studentId')}`}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors shadow-md"
        >
          <ChevronLeft className="text-gray-700" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          {courseData.courseDetails.title}
        </h1>
      </div>
      <div className="mt-4">
        <Link
          href={`${viewPerformanceRoutes[courseData.courseDetails.category as keyof typeof viewPerformanceRoutes] || "/tutor/viewPerformance"}?courseId=${courseData.courseDetails._id}&studentId=${new URLSearchParams(window.location.search).get('studentId')}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md"
        >
          View Performance 
        </Link>
      </div>
    </header>
  
        {/* Course Overview */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <BookOpen className="mr-2 text-gray-600" />
                Course Overview
              </h2>
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Duration:</span> {courseData.courseDetails.duration}
            </div>
          </div>
          <p className="text-gray-600">{courseData.courseDetails.description}</p>
        </section>
  
        {/* Class Sessions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Course Sessions
          </h2>
          
          <div className="space-y-6">
            {courseData.classDetails.map((classSession) => {
              const { date, time: startTime } = formatDateTime(classSession.startTime);
              const { time: endTime } = formatDateTime(classSession.endTime);
              const isUploading = uploadLoading[classSession._id] || false;
  
              return (
                <div 
                  key={classSession._id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="p-6 grid grid-cols-3 gap-6 items-center">
                    {/* Date and Time */}
                    <div className="col-span-1 bg-gray-100 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-gray-800">{date}</div>
                      <div className="text-gray-600">
                        {startTime} - {endTime}
                      </div>
                      {classSession.performanceVideo && (
                        <div className="mt-2 text-green-600 text-sm font-medium">
                          ✓ Performance Video Uploaded
                        </div>
                      )}
                    </div>
  
                    {/* Session Details */}
                    <div className="col-span-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {classSession.title}
                      </h3>
                      <p className="text-gray-600">
                        {classSession.description}
                      </p>
                    </div>
  
                    {/* Actions */}
                    <div className="col-span-1 flex flex-col space-y-2">
                      {/* Feedback Button */}
                      <Link 
                        href={`${categoryRoutes[courseData.courseDetails.category as keyof typeof categoryRoutes] || "/tutor/singleStudentFeedback"}?classId=${classSession._id}&courseId=${courseData.courseDetails._id}&studentId=${new URLSearchParams(window.location.search).get('studentId')}`}
                        className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center justify-center text-sm"
                      >
                        <MessageCircle className="mr-1" size={16} />
                        Feedback
                      </Link>
                      
                      {/* Upload Performance Video Button */}
                      <button
                        onClick={() => triggerFileInput(classSession._id)}
                        disabled={isUploading}
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center text-sm ${
                          isUploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : classSession.performanceVideo
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-orange-500 hover:bg-orange-600'
                        } text-white`}
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-1" size={16} />
                            {classSession.performanceVideo ? 'Update Video' : 'Performance Video'}
                          </>
                        )}
                      </button>
                      
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[classSession._id] = el;
                        }}                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePerformanceVideoUpload(classSession._id, file);
                          }
                        }}
                        accept="video/*"
                        style={{ display: 'none' }}
                      />
                      
                      {/* View Performance Video Button (if video exists) */}
                      {classSession.performanceVideo && (
                        <a
                          href={classSession.performanceVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center text-sm"
                        >
                          <Video className="mr-1" size={16} />
                          View Video
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
  
        {/* Curriculum */}
        {courseData.courseDetails.curriculum && courseData.courseDetails.curriculum.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Course Curriculum
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                {courseData.courseDetails.curriculum.map((item) => (
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
      </div>
    </div>
  );
}