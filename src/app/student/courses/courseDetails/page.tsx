"use client";

import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { BarChart3, X, BookOpen } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'classes' | 'curriculum'>('classes');
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

  // Helper function to format started date like "25 July"
  const getStartedFromDate = (course: CourseDetail) => {
    // Since we don't have createdAt in CourseDetail, using a fallback
    return "25 July"; // Fallback
  };

  // Helper function to format date and time
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = weekdays[date.getDay()];
    const monthName = months[month];
    
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    return {
      date: `${day}th ${monthName} ${year}`,
      day: weekday,
      time: timeStr
    };
  };

  // Function to render class items in tutor style
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
      <div className="space-y-6">
        {classes.map((classItem) => {
          const isPast = isClassPast(classItem.endTime);
          const { date, day, time: startTime } = formatDateTime(classItem.startTime);
          const { time: endTime } = formatDateTime(classItem.endTime);
          
          return (
            <div key={classItem._id} className="border-none shadow-sm bg-white">
              <div className="p-6 grid gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-900">{classItem.title}</h3>
                </div>
                <p className="text-gray-600">
                  {classItem.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 text-sm text-gray-600 mt-2">
                  <span>
                    Date : <span className="font-medium">{date}</span>
                  </span>
                  <span>
                    Day : <span className="font-medium">{day}</span>
                  </span>
                  <span>
                    Time : <span className="font-medium">{startTime} - {endTime}</span>
                  </span>
                </div>
                
                {/* Action buttons - responsive layout */}
                {isPast && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    {classItem.recording && (
                      <Link 
                        href={`/student/classQuality/${classItem._id}`}
                        className="text-purple-600 hover:bg-purple-200 border border-purple-200 flex items-center gap-2 rounded-none px-4 py-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Class Quality
                      </Link>
                    )}
                    {classItem.performanceVideo && (
                      <button 
                        onClick={() => setSelectedVideo(classItem.performanceVideo)}
                        className="text-blue-600 hover:bg-blue-200 border border-blue-200 flex items-center gap-2 rounded-none px-4 py-2"
                      >
                        Performance Video
                      </button>
                    )}
                    <Link 
                      href={`/student/singleFeedback/${courseDetails?.category}?classId=${classItem._id}&studentId=${userData?._id}`}
                      className="text-orange-600 hover:bg-orange-200 border border-orange-200 flex items-center gap-2 rounded-none px-4 py-2"
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
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#6B46C1] flex items-center justify-center p-4">
        <div className="text-lg sm:text-2xl font-semibold text-white text-center">Loading Course Details...</div>
      </div>
    );
  }

  // Error state
  if (error || !courseDetails) {
    return (
      <div className="min-h-screen bg-[#6B46C1] flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="text-xl sm:text-2xl font-semibold text-red-600 mb-4">
            Error Loading Course
          </div>
          <p className="text-gray-700 mb-6 text-sm sm:text-base">{error}</p>
          <button 
            onClick={fetchCourseDetails} 
            className="px-4 sm:px-6 py-2 sm:py-3 bg-[#6B46C1] text-white rounded-lg hover:bg-[#5A3A9F] transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#6B46C1] p-4 md:p-6 lg:p-8">
      <Toaster />
      
      <div className="flex-1 rounded-xl bg-white shadow-lg overflow-hidden max-w-7xl mx-auto">
        {selectedVideo && (
          <VideoModal videoUrl={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}

        {/* Main Content Area */}
        <main className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Course Overview Card */}
          <div className="rounded-xl border border-[#6B46C1] shadow-sm bg-white">
            <div className="p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0 w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                <img src="/pianoCourse.png" alt="Piano Course" className="h-24 w-24" />
              </div>
              <div className="flex-1 grid gap-2 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900">{courseDetails.title}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 text-sm text-gray-600">
                  <span>
                    Duration : <span className="font-medium text-gray-900">{courseDetails.duration}</span>
                  </span>
                  <span>
                    Sessions : <span className="font-medium text-gray-900">{classDetails.length}</span>
                  </span>
                  <span>
                    Price : <span className="font-medium text-gray-900">Rs {courseDetails.price}</span>
                  </span>
                  <span>
                    Started From : <span className="font-medium text-gray-900">{getStartedFromDate(courseDetails)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="w-full">
            <div className="grid w-full grid-cols-2 h-auto bg-transparent p-0 border-b">
              <button
                onClick={() => setActiveTab('classes')}
                className={`text-lg font-semibold rounded-none pb-2 transition-colors ${
                  activeTab === 'classes'
                    ? 'border-b-2 border-[#6B46C1] text-[#6B46C1]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Classes
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`text-lg font-semibold rounded-none pb-2 transition-colors ${
                  activeTab === 'curriculum'
                    ? 'border-b-2 border-[#6B46C1] text-[#6B46C1]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Curriculum
              </button>
            </div>

            {activeTab === 'classes' && (
              <div className="mt-6">
                {/* Class Schedule Sub-tabs */}
                <div className="mb-6">
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

                <div className="space-y-6">
                  {classScheduleTab === 'upcoming' && renderClassItems(separateClasses().upcomingClasses)}
                  {classScheduleTab === 'recorded' && renderClassItems(separateClasses().recordedClasses)}
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="mt-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  {courseDetails.curriculum && courseDetails.curriculum.length > 0 ? (
                    <div className="space-y-4">
                      {courseDetails.curriculum.map((item, index) => (
                        <div key={index} className="border-l-4 border-[#6B46C1] pl-4 py-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                              Session {item.sessionNo}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.topic}
                            </h3>
                          </div>
                          <p className="text-gray-600 mt-2 text-sm sm:text-base">
                            <span className="font-medium">Outcome:</span> {item.tangibleOutcome}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">No curriculum available</p>
                      <p className="text-gray-400 text-sm">The curriculum for this course hasn't been set up yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseDetailsPage;