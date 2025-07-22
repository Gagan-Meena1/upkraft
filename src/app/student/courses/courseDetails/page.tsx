"use client";

import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { BarChart3, X } from 'lucide-react';

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
  category: string;
  curriculum: Array<{
    sessionNo: string;
    topic: string;
    tangibleOutcome: string;
    _id: string;
  }>;
}

const VideoModal = ({ videoUrl, onClose }: { videoUrl: string, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
    <div className="relative bg-black rounded-lg overflow-hidden shadow-xl max-w-4xl w-full mx-2 sm:mx-4">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white bg-gray-800 bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 transition-colors z-10"
        aria-label="Close video player"
      >
        <X size={20} className="sm:w-6 sm:h-6" />
      </button>
      <div className="aspect-video">
        <video src={videoUrl} controls autoPlay className="w-full h-full">
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </div>
);

const CourseDetailsPage = () => {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetail | null>(null);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'curriculum'>('schedule');
  const [classScheduleTab, setClassScheduleTab] = useState<'upcoming' | 'recorded'>('upcoming');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

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

  // Function to check if a class is in the past
  const isClassPast = (endTime: string): boolean => {
    const classEndTime = new Date(endTime);
    const currentTime = new Date();
    return classEndTime < currentTime;
  };

  // Function to separate classes into upcoming and recorded
  const separateClasses = () => {
    const upcomingClasses: ClassDetail[] = [];
    const recordedClasses: ClassDetail[] = [];

    classDetails.forEach(classItem => {
      if (isClassPast(classItem.endTime)) {
        recordedClasses.push(classItem);
      } else {
        upcomingClasses.push(classItem);
      }
    });

    // Sort upcoming classes by start time (earliest first)
    upcomingClasses.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    // Sort recorded classes by start time (latest first)
    recordedClasses.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return { upcomingClasses, recordedClasses };
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

  // Function to render class items
  const renderClassItems = (classes: ClassDetail[]) => {
    if (classes.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm sm:text-base">
            {classScheduleTab === 'upcoming' ? 'No upcoming classes' : 'No recorded classes'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        {classes.map((classItem) => {
          const isPast = isClassPast(classItem.endTime);
          
          return (
            <div 
              key={classItem._id} 
              className="border-b pb-4 sm:pb-6 last:border-b-0"
            >
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    {classItem.title}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                    <div>
                      <span className="font-medium">Date:</span> {formatDate(classItem.startTime)}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                    </div>
                  </div>
                </div>
                
                {/* Action buttons - responsive layout */}
                {isPast && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {classItem.recording && (
                      <Link 
                        href={`/student/classQuality/${classItem._id}`}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-md shadow-md hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center text-xs sm:text-sm font-medium"
                      >
                        <BarChart3 className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                        Class Quality
                      </Link>
                    )}
                    {classItem.performanceVideo && (
                      <button 
                        onClick={() => setSelectedVideo(classItem.performanceVideo)}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center text-xs sm:text-sm font-medium"
                      >
                        Performance Video
                      </button>
                    )}
                    <Link 
                      href={`/student/singleFeedback/${courseDetails?.category}?classId=${classItem._id}&studentId=${userData?._id}`}
                      className="px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-md shadow-md hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center text-xs sm:text-sm font-medium"
                    >
                      View Feedback
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const pageContent = (
    <>
      <Toaster />
      
      {loading ? (
        <div className="flex items-center justify-center min-h-screen px-4">
          <p className="text-gray-600 text-base sm:text-lg text-center">Loading course details...</p>
        </div>
      ) : error ? (
        <div className="mx-auto bg-red-50 p-4 rounded-lg border border-red-200">
          <h1 className="text-red-600 text-lg sm:text-xl font-medium">Error Loading Course</h1>
          <p className="text-red-500 mt-2 text-sm sm:text-base">{error}</p>
          <button 
            onClick={fetchCourseDetails} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="w-full">
          {selectedVideo && (
            <VideoModal videoUrl={selectedVideo} onClose={() => setSelectedVideo(null)} />
          )}
          
          {/* Course Header */}
          {courseDetails && (
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-3 sm:mb-4">
                {courseDetails.title}
              </h1>
              <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
                <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">{courseDetails.description}</p>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <div className="bg-white p-3 sm:p-4 rounded-md shadow-sm flex-1 min-w-0">
                    <span className="text-gray-500 text-xs sm:text-sm block">Duration</span>
                    <p className="font-medium text-black text-sm sm:text-base">{courseDetails.duration}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Toggle Buttons */}
          <div className="mb-6 sm:mb-8">
            <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-fit overflow-hidden">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-300 text-sm sm:text-base ${
                  activeTab === 'schedule'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Class Schedule
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-300 text-sm sm:text-base ${
                  activeTab === 'curriculum'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Course Curriculum
              </button>
            </div>
          </div>

          {/* Class Schedule Section */}
          {activeTab === 'schedule' && (
            <section className="mt-6 sm:mt-8">
              {/* Class Schedule Sub-tabs */}
              <div className="mb-4 sm:mb-6">
                <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-fit overflow-hidden">
                  <button
                    onClick={() => setClassScheduleTab('upcoming')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-300 ${
                      classScheduleTab === 'upcoming'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="hidden sm:inline">Upcoming Classes </span>
                    <span className="sm:hidden">Upcoming </span>
                    ({separateClasses().upcomingClasses.length})
                  </button>
                  <button
                    onClick={() => setClassScheduleTab('recorded')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-300 ${
                      classScheduleTab === 'recorded'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="hidden sm:inline">Recorded Classes </span>
                    <span className="sm:hidden">Recorded </span>
                    ({separateClasses().recordedClasses.length})
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                {classScheduleTab === 'upcoming' && renderClassItems(separateClasses().upcomingClasses)}
                {classScheduleTab === 'recorded' && renderClassItems(separateClasses().recordedClasses)}
              </div>
            </section>
          )}

          {/* Course Curriculum Section */}
          {activeTab === 'curriculum' && courseDetails && courseDetails.curriculum && courseDetails.curriculum.length > 0 && (
            <section className="mt-6 sm:mt-8">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {courseDetails.curriculum.map((item) => (
                    <div 
                      key={item.sessionNo} 
                      className="border-b pb-4 sm:pb-6 last:border-b-0"
                    >
                      <div className="space-y-2">
                        <div className="font-semibold text-gray-800 text-sm sm:text-base">
                          Session {item.sessionNo}: {item.topic}
                        </div>
                        <div className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                          {item.tangibleOutcome}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Show message if no curriculum available */}
          {activeTab === 'curriculum' && (!courseDetails?.curriculum || courseDetails.curriculum.length === 0) && (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-500 text-sm sm:text-base">No curriculum available</p>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <DashboardLayout userData={userData} userType="student">
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {pageContent}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetailsPage;