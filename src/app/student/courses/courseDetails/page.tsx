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

interface ClassQuality {
  _id: string;
  classDuration: string;
  sessionFocusAreaStatedClearly: string;
  instructorId: string;
  class: string;
  ContentDeliveredAligningToDriveSessionFocusArea?: string;
  studentEngagement?: string;
  studentPracticallyDemonstratedProgressOnConcept?: string;
  KeyPerformance?: string;
  tutorCommunicationTonality?: string;
  personalFeedback?: string;
  createdAt: string;
  updatedAt: string;
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

const CourseDetailsPage = () => {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetail | null>(null);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [classQualityData, setClassQualityData] = useState<ClassQuality[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'curriculum'>('schedule');
  const [selectedClassQuality, setSelectedClassQuality] = useState<ClassQuality | null>(null);
  const [showQualityModal, setShowQualityModal] = useState(false);

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
      fetchClassQualityData();
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

  const fetchClassQualityData = async () => {
    try {
      const res = await fetch(`/Api/admin/classQuality?courseId=${courseId}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch class quality data: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setClassQualityData(data.data || []);
      } else {
        console.warn('Failed to fetch class quality data:', data.message);
      }
    } catch (err) {
      console.error('Error fetching class quality data:', err);
      // Don't show toast error for class quality as it's optional data
    }
  };

  const getClassQuality = (classId: string): ClassQuality | null => {
    return classQualityData.find(quality => quality.class.toString() === classId) || null;
  };

  const openQualityModal = (classId: string) => {
    const quality = getClassQuality(classId);
    if (quality) {
      setSelectedClassQuality(quality);
      setShowQualityModal(true);
    }
  };

  const closeQualityModal = () => {
    setShowQualityModal(false);
    setSelectedClassQuality(null);
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

  const QualityModal = () => {
    if (!showQualityModal || !selectedClassQuality) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white w-full h-full overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Class Quality Assessment</h2>
              <button
                onClick={closeQualityModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Class Duration */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Class Duration Score</h3>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-orange-600">{selectedClassQuality.classDuration}/10</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(parseInt(selectedClassQuality.classDuration) / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Session Focus Area */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Session Focus Area Stated Clearly</h3>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-orange-600">{selectedClassQuality.sessionFocusAreaStatedClearly}/10</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(parseInt(selectedClassQuality.sessionFocusAreaStatedClearly) / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Content Delivery */}
              {selectedClassQuality.ContentDeliveredAligningToDriveSessionFocusArea && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Content Delivered Aligning to Drive Session Focus Area</h3>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-orange-600">{selectedClassQuality.ContentDeliveredAligningToDriveSessionFocusArea}/10</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(parseInt(selectedClassQuality.ContentDeliveredAligningToDriveSessionFocusArea) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Engagement */}
              {selectedClassQuality.studentEngagement && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Student Engagement</h3>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-orange-600">{selectedClassQuality.studentEngagement}/10</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(parseInt(selectedClassQuality.studentEngagement) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Progress */}
              {selectedClassQuality.studentPracticallyDemonstratedProgressOnConcept && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Student Practically Demonstrated Progress on Concept</h3>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-orange-600">{selectedClassQuality.studentPracticallyDemonstratedProgressOnConcept}/10</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(parseInt(selectedClassQuality.studentPracticallyDemonstratedProgressOnConcept) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Performance */}
              {selectedClassQuality.KeyPerformance && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Key Performance</h3>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-orange-600">{selectedClassQuality.KeyPerformance}/10</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(parseInt(selectedClassQuality.KeyPerformance) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tutor Communication Tonality */}
              {selectedClassQuality.tutorCommunicationTonality && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Tutor Communication Tonality</h3>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-orange-600">{selectedClassQuality.tutorCommunicationTonality}/10</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(parseInt(selectedClassQuality.tutorCommunicationTonality) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Feedback */}
              {selectedClassQuality.personalFeedback && (
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <h3 className="font-semibold text-orange-800 mb-2">Personal Feedback</h3>
                  <p className="text-orange-700">{selectedClassQuality.personalFeedback}</p>
                </div>
              )}

              {/* Overall Score */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                <h3 className="font-semibold mb-2">Overall Class Quality Score</h3>
                <div className="text-3xl font-bold">
                  {(() => {
                    const scores = [
                      parseInt(selectedClassQuality.classDuration),
                      parseInt(selectedClassQuality.sessionFocusAreaStatedClearly),
                      selectedClassQuality.ContentDeliveredAligningToDriveSessionFocusArea ? parseInt(selectedClassQuality.ContentDeliveredAligningToDriveSessionFocusArea) : 0,
                      selectedClassQuality.studentEngagement ? parseInt(selectedClassQuality.studentEngagement) : 0,
                      selectedClassQuality.studentPracticallyDemonstratedProgressOnConcept ? parseInt(selectedClassQuality.studentPracticallyDemonstratedProgressOnConcept) : 0,
                      selectedClassQuality.KeyPerformance ? parseInt(selectedClassQuality.KeyPerformance) : 0,
                      selectedClassQuality.tutorCommunicationTonality ? parseInt(selectedClassQuality.tutorCommunicationTonality) : 0
                    ].filter(score => score > 0);
                    
                    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
                    return `${average.toFixed(1)}/10`;
                  })()}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeQualityModal}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
                </div>
              </div>
            </div>
          )}

          {/* Toggle Buttons */}
          <div className="mb-8">
            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${
                  activeTab === 'schedule'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Class Schedule
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${
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
          {activeTab === 'schedule' && classDetails && classDetails.length > 0 && (
            <section className="mt-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-4">
                  {classDetails.map((classItem) => {
                    const classQuality = getClassQuality(classItem._id);
                    
                    return (
                      <div 
                        key={classItem._id} 
                        className="border-b pb-4 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 mb-1">
                              {classItem.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              <div className="mb-1">
                                <span className="font-medium">Date:</span> {formatDate(classItem.startTime)}
                              </div>
                              <div>
                                <span className="font-medium">Time:</span> {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3 ml-4">
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
                            {classQuality && (
                              <button
                                onClick={() => openQualityModal(classItem._id)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-md shadow-md hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center text-sm font-medium"
                              >
                                View Quality Score
                              </button>
                            )}
                            <Link 
                              href={`/student/singleFeedback/${courseDetails.category}?classId=${classItem._id}&studentId=${userData?._id}`}
                              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-md shadow-md hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center text-sm font-medium"
                            >
                              View Feedback
                           </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Course Curriculum Section */}
          {activeTab === 'curriculum' && courseDetails && courseDetails.curriculum && courseDetails.curriculum.length > 0 && (
            <section className="mt-8">
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

          {/* Show message if no data available for active tab */}
          {activeTab === 'schedule' && (!classDetails || classDetails.length === 0) && (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-500">No class schedule available</p>
            </div>
          )}

          {activeTab === 'curriculum' && (!courseDetails?.curriculum || courseDetails.curriculum.length === 0) && (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-500">No curriculum available</p>
            </div>
          )}
        </div>
      )}

      {/* Quality Modal */}
      <QualityModal />
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