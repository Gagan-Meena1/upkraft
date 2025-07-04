"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Upload, FileText, IndianRupee, BarChart3, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

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
  recordingUrl?: string;
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

const CourseDetailsPage = () => {
  const [courseData, setCourseData] = useState<CourseDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState<'classes' | 'curriculum'>('classes');
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  const params = useParams();
  const router = useRouter();

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
    console.log("File selected:", { name: file.name, size: file.size, type: file.type });
    const maxSize = 800 * 1024 * 1024; // 800MB
    if (file.size > maxSize) {
        toast.error('File size must be less than 800MB');
        return;
    }

    setUploadLoading((prev) => ({ ...prev, [classId]: true }));
    console.log(`[${classId}] Starting upload process...`);

    try {
        // 1. Get presigned URL
        console.log(`[${classId}] Requesting presigned URL...`);
        const presignedUrlResponse = await axios.post('/Api/upload/presigned-url', {
            fileName: file.name,
            fileType: file.type,
            classId: classId,
        });

        const { publicUrl } = presignedUrlResponse.data;
        console.log(`[${classId}] Public URL: ${publicUrl}`);

        // 2. Upload file directly to S3
        console.log(`[${classId}] Starting direct upload to S3...`);
        await axios.put(presignedUrlResponse.data.uploadUrl, file, {
            headers: { 'Content-Type': file.type },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${progress}%`);
                }
            },
        });

        toast.success('Recording uploaded successfully!');
        console.log(`[${classId}] Direct upload to S3 completed.`);

        // 3. save the public URL in mongoDB
        console.log(`[${classId}] Notifying mongoDB to update class with public URL: ${publicUrl}`);
        await axios.post('/Api/classes/update', { classId, recordingUrl: publicUrl });
        
        console.log(`[${classId}] recordingUrl updated in mongoDB.`);

        // 4. Trigger background processing
        toast('Video evaluation and performance video generation have started.');

        // Trigger evaluation process (fire-and-forget)
        axios.post(`/Api/proxy/evaluate-video?item_id=${classId}`)
          .catch((evalError) => {
            console.error(`[${classId}] Failed to start evaluation:`, evalError.message);
            // We don't show a toast here as the component might be unmounted.
          });
        
        // Trigger highlight generation process (fire-and-forget)
        axios.post(`/Api/proxy/generate-highlights?item_id=${classId}`)
          .catch((highlightError) => {
            console.error(`[${classId}] Failed to start highlight generation:`, highlightError.message);
          });

        router.refresh();
    } catch (err) {
        const error = err as AxiosError<{ error: string }>;
        console.error(`[${classId}] Upload process failed:`, error.message);
        toast.error(error.response?.data?.error || 'Failed to upload recording.');
    } finally {
        setUploadLoading((prev) => ({ ...prev, [classId]: false }));
        console.log(`[${classId}] Upload process finished.`);
        const inputRef = fileInputRefs.current[classId];
        if (inputRef) {
            inputRef.value = '';
        }
    }
  };

  const triggerFileInput = (classId: string) => {
    const inputRef = fileInputRefs.current[classId];
    if (inputRef) inputRef.click();
  };

  const getButtonText = (classSession: Class, isUploading: boolean) => {
    if (isUploading) return 'Uploading...';
    return classSession.recordingUrl ? 'Replace Recording' : 'Upload Recording';
  };

  // Add delete course handler
  const handleDeleteCourse = async () => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/Api/tutors/courses?courseId=${params.courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      toast.success('Course deleted successfully');
      router.push('/tutor/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center p-4">
        <div className="text-lg sm:text-2xl font-semibold text-gray-700 text-center">Loading Course Details...</div>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="text-xl sm:text-2xl font-semibold text-red-600 mb-4">
            Error Loading Course
          </div>
          <p className="text-gray-700 mb-6 text-sm sm:text-base">{error}</p>
          <Link 
            href="/tutor" 
            className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm sm:text-base"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link 
                href={`/tutor/courses`} 
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors shadow-md flex-shrink-0"
              >
                <ChevronLeft className="text-gray-700 w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 break-words">
                {courseData.courseDetails.title}
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Link href={`/tutor/classes/?courseId=${courseData.courseDetails._id}`}>
                <button className="w-full sm:w-auto bg-gray-700 hover:bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-md font-medium transition-colors shadow-md flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Create Class
                </button>
              </Link>
              <button 
                onClick={handleDeleteCourse}
                className="w-full sm:w-auto border border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-3 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base"
              >
                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                Delete Course
              </button>
            </div>
          </div>
        </header>
  
        {/* Course Overview */}
        <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                <BookOpen className="mr-2 text-gray-600 w-5 h-5 sm:w-6 sm:h-6" />
                Course Overview
              </h2>
            </div>
            <div className="text-gray-600 text-sm sm:text-base">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <span><span className="font-medium">Duration:</span> {courseData.courseDetails.duration}</span>
                <span><span className="font-medium">Price:</span> <IndianRupee className='text-xs scale-70 inline-block transform'/>{courseData.courseDetails.price}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{courseData.courseDetails.description}</p>
        </section>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex bg-white rounded-lg shadow-md p-1 max-w-md mx-auto sm:mx-0">
            <button
              onClick={() => setActiveTab('classes')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === 'classes'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Classes
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === 'curriculum'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Curriculum
            </button>
          </div>
        </div>
  
        {/* Classes Section */}
        {activeTab === 'classes' && (
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              Course Classes
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              {courseData.classDetails.map((classSession) => {
                const { date, time: startTime } = formatDateTime(classSession.startTime);
                const { time: endTime } = formatDateTime(classSession.endTime);
                const isUploading = uploadLoading[classSession._id] || false;

                return (
                  <div 
                    key={classSession._id} 
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Mobile Layout */}
                      <div className="block lg:hidden space-y-4">
                        {/* Date and Time */}
                        <div className="bg-gray-100 rounded-lg p-3 text-center">
                          <div className="text-sm font-bold text-gray-800">{date}</div>
                          <div className="text-xs text-gray-600">
                            {startTime} - {endTime}
                          </div>
                        </div>

                        {/* Session Details */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {classSession.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {classSession.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {/* Hidden file input */}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            ref={el => { fileInputRefs.current[classSession._id] = el; }}
                            onChange={(e) => handleFileChange(classSession._id, e)}
                          />

                          <div className="flex gap-2">
                            {/* Class Quality button */}
                            {classSession.recordingUrl && (
                              <Link 
                                href={`/tutor/classQuality/${classSession._id}`}
                                className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center text-xs"
                              >
                                <BarChart3 className="mr-1" size={14} />
                                Quality
                              </Link>
                            )}

                            {/* Upload Recording button */}
                            <button
                              onClick={() => triggerFileInput(classSession._id)}
                              disabled={isUploading}
                              className={`flex-1 px-3 py-2 ${
                                isUploading ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-green-500 hover:bg-green-600'
                              } text-white rounded-lg transition-colors flex items-center justify-center text-xs`}
                            >
                              <Upload className="mr-1" size={14} />
                              {getButtonText(classSession, isUploading)}
                            </button>
                          </div>

                          {/* Assignment Button */}
                          <Link 
                            href={`/tutor/createAssignment?classId=${classSession._id}&courseId=${courseData.courseDetails._id}`}
                            className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center justify-center text-xs"
                          >
                            <FileText className="mr-1" size={14} />
                            Assignment
                          </Link>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:items-center">
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

                          {/* Class Quality button */}
                          {classSession.recordingUrl && (
                            <Link 
                              href={`/tutor/classQuality/${classSession._id}`}
                              className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center text-sm"
                            >
                              <BarChart3 className="mr-1" size={16} />
                              Class Quality
                            </Link>
                          )}

                          {/* Upload Recording button */}
                          <button
                            onClick={() => triggerFileInput(classSession._id)}
                            disabled={isUploading}
                            className={`px-2 py-1 ${
                              isUploading ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white rounded-lg transition-colors flex items-center text-sm`}
                          >
                            <Upload className="mr-1" size={16} />
                            {getButtonText(classSession, isUploading)}
                          </button>

                          {/* Assignment Button */}
                          <Link 
                            href={`/tutor/createAssignment?classId=${classSession._id}&courseId=${courseData.courseDetails._id}`}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center text-sm"
                          >
                            <FileText className="mr-1" size={16} />
                            Assignment
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Curriculum Section */}
        {activeTab === 'curriculum' && courseData.courseDetails.curriculum && courseData.courseDetails.curriculum.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              Course Curriculum
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="space-y-4">
                {courseData.courseDetails.curriculum.map((item) => (
                  <div 
                    key={item.sessionNo} 
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm sm:text-base">
                          Session {item.sessionNo}: {item.topic}
                        </div>
                        <div className="text-gray-600 mt-1 text-sm leading-relaxed">
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

        {/* Show message if no curriculum */}
        {activeTab === 'curriculum' && (!courseData.courseDetails.curriculum || courseData.courseDetails.curriculum.length === 0) && (
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              Course Curriculum
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-gray-500">
                No curriculum available for this course.
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default CourseDetailsPage;