"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Clock, BookOpen, MessageCircle, Video } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'classes' | 'curriculum'>('classes');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center p-4">
        <div className="text-xl md:text-2xl font-semibold text-gray-700 text-center">Loading Course Details...</div>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center p-4">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="text-xl md:text-2xl font-semibold text-red-600 mb-4">
            Error Loading Course
          </div>
          <p className="text-gray-700 mb-6 text-sm md:text-base">{error}</p>
          <Link 
            href="/tutor" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Link
              href={`/tutor/studentDetails?studentId=${new URLSearchParams(window.location.search).get('studentId')}`}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors shadow-md flex-shrink-0"
            >
              <ChevronLeft className="text-gray-700" size={20} />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 line-clamp-2">
              {courseData.courseDetails.title}
            </h1>
          </div>
          <div className="w-full sm:w-auto">
            <Link
              href={`${viewPerformanceRoutes[courseData.courseDetails.category as keyof typeof viewPerformanceRoutes] || "/tutor/viewPerformance"}?courseId=${courseData.courseDetails._id}&studentId=${new URLSearchParams(window.location.search).get('studentId')}`}
              className="block w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md text-center text-sm md:text-base"
            >
              View Performance 
            </Link>
          </div>
        </header>
  
        {/* Course Overview */}
        <section className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                <BookOpen className="mr-2 text-gray-600" size={20} />
                Course Overview
              </h2>
            </div>
            <div className="text-gray-600 text-sm md:text-base">
              <span className="font-medium">Duration:</span> {courseData.courseDetails.duration}
            </div>
          </div>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">{courseData.courseDetails.description}</p>
        </section>

        {/* Toggle Buttons */}
        <section className="mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('classes')}
                className={`flex-1 px-4 py-2 rounded-md text-sm md:text-base font-medium transition-all duration-200 ${
                  activeTab === 'classes'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                Classes 
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`flex-1 px-4 py-2 rounded-md text-sm md:text-base font-medium transition-all duration-200 ${
                  activeTab === 'curriculum'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                Curriculum 
              </button>
            </div>
          </div>
        </section>
  
        {/* Classes Section */}
        {activeTab === 'classes' && (
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
              Course Sessions
            </h2>
            
            {courseData.classDetails.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8 text-center">
                <div className="text-gray-500 text-lg mb-2">No classes scheduled yet</div>
                <p className="text-gray-400 text-sm">Classes will appear here once they are scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {courseData.classDetails.map((classSession) => {
                  const { date, time: startTime } = formatDateTime(classSession.startTime);
                  const { time: endTime } = formatDateTime(classSession.endTime);
    
                  return (
                    <div 
                      key={classSession._id} 
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow"
                    >
                      <div className="p-4 md:p-6">
                        {/* Mobile Layout - Stacked */}
                        <div className="block lg:hidden space-y-4">
                          {/* Date and Time - Mobile */}
                          <div className="bg-gray-100 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-800">{date}</div>
                            <div className="text-gray-600 text-sm">
                              {startTime} - {endTime}
                            </div>
                            {classSession.performanceVideo && (
                              <div className="mt-2 text-green-600 text-xs font-medium">
                                ✓ Performance Video Uploaded
                              </div>
                            )}
                          </div>

                          {/* Session Details - Mobile */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {classSession.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {classSession.description}
                            </p>
                          </div>

                          {/* Actions - Mobile */}
                          <div className="flex flex-col space-y-2">
                            {/* Feedback Button */}
                            <Link 
                              href={`${categoryRoutes[courseData.courseDetails.category as keyof typeof categoryRoutes] || "/tutor/singleStudentFeedback"}?classId=${classSession._id}&courseId=${courseData.courseDetails._id}&studentId=${new URLSearchParams(window.location.search).get('studentId')}`}
                              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center justify-center text-sm"
                            >
                              <MessageCircle className="mr-2" size={16} />
                              Feedback
                            </Link>
                            
                            {/* View Performance Video Button (if video exists) */}
                            {classSession.performanceVideo && (
                              <a
                                href={classSession.performanceVideo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center text-sm"
                              >
                                <Video className="mr-2" size={16} />
                                View Video
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Desktop Layout - Grid */}
                        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:items-center">
                          {/* Date and Time - Desktop */}
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

                          {/* Session Details - Desktop */}
                          <div className="col-span-1">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              {classSession.title}
                            </h3>
                            <p className="text-gray-600">
                              {classSession.description}
                            </p>
                          </div>

                          {/* Actions - Desktop */}
                          <div className="col-span-1 flex flex-col space-y-2">
                            {/* Feedback Button */}
                            <Link 
                              href={`${categoryRoutes[courseData.courseDetails.category as keyof typeof categoryRoutes] || "/tutor/singleStudentFeedback"}?classId=${classSession._id}&courseId=${courseData.courseDetails._id}&studentId=${new URLSearchParams(window.location.search).get('studentId')}`}
                              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center justify-center text-sm"
                            >
                              <MessageCircle className="mr-1" size={16} />
                              Feedback
                            </Link>
                            
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

                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={(el) => {
                            fileInputRefs.current[classSession._id] = el;
                          }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handlePerformanceVideoUpload(classSession._id, file);
                            }
                          }}
                          accept="video/*"
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
  
        {/* Curriculum Section */}
        {activeTab === 'curriculum' && (
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
              Course Curriculum
            </h2>
            {!courseData.courseDetails.curriculum || courseData.courseDetails.curriculum.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8 text-center">
                <div className="text-gray-500 text-lg mb-2">No curriculum available</div>
                <p className="text-gray-400 text-sm">Curriculum details will be added soon.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg">
                <div className="p-4 md:p-6">
                  <div className="space-y-3 md:space-y-4">
                    {courseData.courseDetails.curriculum.map((item, index) => (
                      <div 
                        key={item.sessionNo} 
                        className="border-b pb-3 md:pb-4 last:border-b-0"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-full mr-3">
                                {item.sessionNo}
                              </span>
                              <div className="font-semibold text-gray-800 text-sm md:text-base">
                                {item.topic}
                              </div>
                            </div>
                            <div className="text-gray-600 ml-11 text-sm md:text-base">
                              <span className="font-medium">Outcome:</span> {item.tangibleOutcome}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}