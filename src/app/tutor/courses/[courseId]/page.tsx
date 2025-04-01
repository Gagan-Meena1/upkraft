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
}

interface CourseDetailsData {
  courseId: string;
  courseDetails: {
    _id: string;
    title: string;
    description: string;
    duration: string;
    price: number;
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

  // Handle file upload
  const handleFileChange = async (classId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('video', file);
    formData.append('classId', classId);

    try {
      setUploadLoading(prev => ({ ...prev, [classId]: true }));
      
      const response = await axios.post('/Api/classes/update', formData, {
        params: { classId },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        // Update the local state to reflect the new recording URL
        setCourseData(prevData => {
          if (!prevData) return null;
          
          const updatedClasses = prevData.classDetails.map(cls => {
            if (cls._id === classId) {
              return { ...cls, recording: response.data.recordingUrl };
            }
            return cls;
          });
          
          return {
            ...prevData,
            classDetails: updatedClasses
          };
        });
      }
    } catch (err) {
      console.error('Error uploading video:', err);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploadLoading(prev => ({ ...prev, [classId]: false }));
    }
  };

  // Trigger file input click
  const triggerFileInput = (classId: string) => {
    if (fileInputRefs.current[classId]) {
      fileInputRefs.current[classId]?.click();
    }
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
              href="/tutor/courses/" 
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors shadow-md"
            >
              <ChevronLeft className="text-gray-700" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              {courseData.courseDetails.title}
            </h1>
          </div>
          <div className="mt-4">
            <Link href={`/tutor/classes/?courseId=${courseData.courseDetails._id}`}>
              <button className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-blue-500 transition-colors">
                Create Class
              </button>
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
              <span className="ml-4 font-medium">Price:</span> ${courseData.courseDetails.price}
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
                    <div className="col-span-1 flex justify-end space-x-4">
                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        ref={el => { fileInputRefs.current[classSession._id] = el; }}
                        onChange={(e) => handleFileChange(classSession._id, e)}
                      />
  
                      {/* Always show Upload Video button */}
                      <button
                        onClick={() => triggerFileInput(classSession._id)}
                        disabled={isUploading}
                        className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center text-sm"
                      >
                        <Upload className="mr-1" size={16} />
                        {isUploading ? 'Uploading...' : 'Upload Video'}
                      </button>
  
                      {/* Show Recording button if available */}
                      {classSession.recording && (
                        <a 
                          href={classSession.recording} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center text-sm"
                        >
                          <Video className="mr-1" size={16} />
                          Recording
                        </a>
                      )}
                      
                      <Link 
                        href={`/tutor/studentFeedback?classId=${classSession._id}&courseId=${courseData.courseDetails._id}`}
                        className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center text-sm"
                      >
                        <MessageCircle className="mr-1" size={16} />
                        Feedback
                      </Link>
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