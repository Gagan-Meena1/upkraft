"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Clock, BookOpen, MessageCircle, Video, Upload, FileText, IndianRupee, X } from 'lucide-react';
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
  recordingFileId?: string;
  recordingFileName?: string;
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

interface UploadProgress {
  progress: number;
  uploadedChunks: number;
  totalChunks: number;
  uploadSpeed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
  startTime: number;
  uploadedBytes: number;
  totalBytes: number;
}

export default function CourseDetailsPage() {
  const [courseData, setCourseData] = useState<CourseDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: UploadProgress}>({});
  const [isUploading, setIsUploading] = useState<{[key: string]: boolean}>({});
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  const uploadControllers = useRef<{[key: string]: AbortController}>({});
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

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to format time
  const formatTime = (seconds: number): string => {
    if (seconds === Infinity || isNaN(seconds)) return 'Calculating...';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
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

  // Generate unique upload ID
  const generateUploadId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // OPTIMIZED: Parallel chunked upload function with retry logic
  const uploadFileInChunks = async (file: File, classId: string) => {
    const chunkSize = 2 * 1024 * 1024; // Reduced to 2MB for faster processing
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = generateUploadId();
    const maxConcurrentUploads = 3; // Upload 3 chunks simultaneously
    
    // Create abort controller for this upload
    const controller = new AbortController();
    uploadControllers.current[classId] = controller;

    const startTime = Date.now();
    
    // Initialize progress
    setUploadProgress(prev => ({
      ...prev,
      [classId]: {
        progress: 0,
        uploadedChunks: 0,
        totalChunks,
        uploadSpeed: 0,
        estimatedTimeRemaining: 0,
        startTime,
        uploadedBytes: 0,
        totalBytes: file.size
      }
    }));

    try {
      let completedChunks = 0;
      let uploadedBytes = 0;
      const chunkQueue: number[] = [];
      const activeUploads = new Set<number>();
      
      // Initialize queue
      for (let i = 0; i < totalChunks; i++) {
        chunkQueue.push(i);
      }

      // Function to upload a single chunk with retry
      const uploadChunk = async (chunkIndex: number, retryCount = 0): Promise<any> => {
        const maxRetries = 3;
        
        if (controller.signal.aborted) {
          throw new Error('Upload cancelled');
        }

        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('fileName', file.name);
        formData.append('classId', classId);
        formData.append('uploadId', uploadId);

        try {
          const response = await axios.post('/Api/classes/update', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            signal: controller.signal,
            timeout: 30000, // 30 second timeout per chunk
          });

          if (!response.data.success) {
            throw new Error(response.data.error || 'Chunk upload failed');
          }

          return response.data;
        } catch (error: any) {
          if (retryCount < maxRetries && !controller.signal.aborted) {
            console.log(`Retrying chunk ${chunkIndex}, attempt ${retryCount + 1}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return uploadChunk(chunkIndex, retryCount + 1);
          }
          throw error;
        }
      };

      // Function to process upload queue
      const processQueue = async (): Promise<void> => {
        const promises: Promise<void>[] = [];
        
        while (chunkQueue.length > 0 && activeUploads.size < maxConcurrentUploads) {
          const chunkIndex = chunkQueue.shift()!;
          activeUploads.add(chunkIndex);
          
          const promise = uploadChunk(chunkIndex)
            .then((result) => {
              completedChunks++;
              const chunkBytes = Math.min(chunkSize, file.size - (chunkIndex * chunkSize));
              uploadedBytes += chunkBytes;
              activeUploads.delete(chunkIndex);

              // Update progress
              const currentTime = Date.now();
              const totalElapsedTime = (currentTime - startTime) / 1000;
              const averageSpeed = uploadedBytes / totalElapsedTime;
              const remainingBytes = file.size - uploadedBytes;
              const estimatedTimeRemaining = remainingBytes / averageSpeed;

              setUploadProgress(prev => ({
                ...prev,
                [classId]: {
                  progress: (completedChunks / totalChunks) * 100,
                  uploadedChunks: completedChunks,
                  totalChunks,
                  uploadSpeed: averageSpeed,
                  estimatedTimeRemaining: result?.processing ? 0 : estimatedTimeRemaining,
                  startTime,
                  uploadedBytes: Math.min(uploadedBytes, file.size),
                  totalBytes: file.size
                }
              }));

              // Check if upload is complete and processing
              if (result?.processing) {
                // Start polling for completion
                return pollUploadStatus(uploadId, classId);
              }
            })
            .catch((error) => {
              activeUploads.delete(chunkIndex);
              throw error;
            });
          
          promises.push(promise);
        }
        
        if (promises.length > 0) {
          await Promise.all(promises);
          
          // Continue processing if there are more chunks
          if (chunkQueue.length > 0) {
            return processQueue();
          }
        }
      };

      // Start processing
      await processQueue();

      // Clean up progress
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[classId];
        return newProgress;
      });

      alert('Video uploaded successfully!');
      
      // Refresh the page data
      window.location.reload();

    } catch (error: any) {
      if (error.name === 'AbortError' || error.message === 'Upload cancelled') {
        console.log('Upload cancelled');
      } else {
        console.error('Upload error:', error);
        alert(error.response?.data?.error || error.message || 'Upload failed. Please try again.');
      }
      
      // Clean up progress
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[classId];
        return newProgress;
      });
    } finally {
      // Clean up controller
      delete uploadControllers.current[classId];
    }
  };

  // OPTIMIZED: Polling with exponential backoff
  const pollUploadStatus = async (uploadId: string, classId: string) => {
    const maxPollingTime = 10 * 60 * 1000; // 2 minutes max
    let pollInterval = 500; // Start with 500ms
    const maxPollInterval = 3000; // Max 3 seconds
    const startTime = Date.now();

    return new Promise<void>((resolve, reject) => {
      const poll = async () => {
        try {
          // Check if upload was cancelled
          if (uploadControllers.current[classId]?.signal.aborted) {
            reject(new Error('Upload cancelled'));
            return;
          }

          // Check for timeout
          if (Date.now() - startTime > maxPollingTime) {
            reject(new Error('Upload processing timeout'));
            return;
          }

          const response = await axios.get(`/Api/classes/update?uploadId=${uploadId}`);
          
          if (response.data.success) {
            if (response.data.completed) {
              // Upload completed successfully
              console.log(`Upload ${uploadId} completed after ${Math.round(elapsedTime / 1000)}s`);
              resolve();
              return;
            } else if (response.data.isProcessing) {
              // Still processing, continue polling with exponential backoff
              pollInterval = Math.min(pollInterval * 1.2, maxPollInterval);
              setTimeout(poll, pollInterval);
            } else {
              // Something went wrong
              reject(new Error('Upload processing failed'));
            }
          } else {
            reject(new Error(response.data.error || 'Failed to check upload status'));
          }
        } catch (error: any) {
          if (error.response?.status === 404) {
            // Session not found, might be completed
            resolve();
          } else {
            reject(error);
          }
        }
      };

      poll();
    });
  };

  // Handle file upload
  const handleFileChange = async (classId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    
    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      alert('File size must be less than 500MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }

    setIsUploading(prev => ({ ...prev, [classId]: true }));
    
    try {
      await uploadFileInChunks(file, classId);
    } finally {
      setIsUploading(prev => ({ ...prev, [classId]: false }));
      // Reset file input
      if (fileInputRefs.current[classId]) {
        fileInputRefs.current[classId]!.value = '';
      }
    }
  };

  // Cancel upload
  const cancelUpload = (classId: string) => {
    if (uploadControllers.current[classId]) {
      uploadControllers.current[classId].abort();
      setIsUploading(prev => ({ ...prev, [classId]: false }));
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
              href={`/tutor/courses`} 
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors shadow-md"
            >
              <ChevronLeft className="text-gray-700" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              {courseData.courseDetails.title}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link href={`/tutor/classes/?courseId=${courseData.courseDetails._id}`}>
              <button className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-md">
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
              <span className="ml-4 font-medium">Price:</span> <IndianRupee className='text-xs scale-70 inline-block transform'/>{courseData.courseDetails.price} 
            </div>
          </div>
          <p className="text-gray-600">{courseData.courseDetails.description}</p>
        </section>
    
        {/* Class Sessions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Course Classes
          </h2>
          
          <div className="space-y-6">
            {courseData.classDetails.map((classSession) => {
              const { date, time: startTime } = formatDateTime(classSession.startTime);
              const { time: endTime } = formatDateTime(classSession.endTime);
              const uploading = isUploading[classSession._id] || false;
              const progress = uploadProgress[classSession._id];

              return (
                <div 
                  key={classSession._id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-6 items-center mb-4">
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

                        {/* Upload/Cancel Button */}
                        {!uploading ? (
                          <button
                            onClick={() => triggerFileInput(classSession._id)}
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center text-sm"
                          >
                            <Upload className="mr-1" size={16} />
                            {classSession.recordingFileId ? 'Replace Video' : 'Upload Video'}
                          </button>
                        ) : (
                          <button
                            onClick={() => cancelUpload(classSession._id)}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center text-sm"
                          >
                            <X className="mr-1" size={16} />
                            Cancel
                          </button>
                        )}

                        {/* Show Watch Recording button if video exists */}
                        {classSession.recordingFileId && (
                          <a 
                            href={`/Api/videos/${classSession.recordingFileId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center text-sm"
                            title={classSession.recordingFileName || 'Watch Recording'}
                          >
                            <Video className="mr-1" size={16} />
                            Watch Recording
                          </a>
                        )}

                        {/* Assignment button */}
                        <Link 
                          href={`/tutor/createAssignment?classId=${classSession._id}&courseId=${courseData.courseDetails._id}`}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center text-sm"
                        >
                          <FileText className="mr-1" size={16} />
                          Assignment
                        </Link>
                      </div>
                    </div>

                    {/* Upload Progress Bar */}
                    {progress && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Uploading Video... {progress.progress.toFixed(1)}%
                          </span>
                          <span className="text-sm text-gray-500">
                            {progress.uploadedChunks}/{progress.totalChunks} chunks
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          ></div>
                        </div>

                        {/* Upload Stats */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <div className="flex items-center">
                              <Clock className="mr-1" size={14} />
                              <span>Time remaining: {formatTime(progress.estimatedTimeRemaining)}</span>
                            </div>
                            <div className="mt-1">
                              Speed: {formatFileSize(progress.uploadSpeed)}/s
                            </div>
                          </div>
                          <div className="text-right">
                            <div>
                              {formatFileSize(progress.uploadedBytes)} / {formatFileSize(progress.totalBytes)}
                            </div>
                            <div className="mt-1 text-gray-500">
                              {Math.round((Date.now() - progress.startTime) / 1000)}s elapsed
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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