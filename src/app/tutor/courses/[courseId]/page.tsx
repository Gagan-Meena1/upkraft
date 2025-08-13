"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Upload, FileText, IndianRupee, BarChart3, Trash2, Edit, X, Clock, Search, Send, Bell, Plus } from 'lucide-react';
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
    createdAt?: string; // Added this for started date
  };
  classDetails: Class[];
}

interface EditClassForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
}

const CourseDetailsPage = () => {
  const [courseData, setCourseData] = useState<CourseDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState<'classes' | 'curriculum'>('classes');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editForm, setEditForm] = useState<EditClassForm>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    date: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState('');
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  const params = useParams();
  const router = useRouter();

  // Helper function to format started date like "25 July"
  const getStartedFromDate = (course: CourseDetailsData['courseDetails']) => {
    if (course.createdAt) {
      const date = new Date(course.createdAt);
      return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}`;
    }
    return "25 July"; // Fallback
  };

  // Helper function to format date and time
const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  
  // Use local timezone methods instead of UTC methods
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  // For weekday, use local date
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = weekdays[date.getDay()];
  const monthName = months[month];
  
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
  console.log('DISPLAYING IN LOCAL TIME:', {
    originalString: dateTimeString,
    displayTime: timeStr,
    displayDate: `${weekday}, ${monthName} ${day}, ${year}`
  });
  
  return {
    date: `${day}th ${monthName} ${year}`,
    day: weekday,
    time: timeStr
  };
};

  // Helper function to extract date and time for form inputs
const extractDateTimeForForm = (dateTimeString) => {
  const date = new Date(dateTimeString);
  
  // Use local timezone methods instead of UTC methods
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  console.log('EXTRACTING IN LOCAL TIME:', {
    originalString: dateTimeString,
    extractedTime: `${hours}:${minutes}`,
    extractedDate: `${year}-${month}-${day}`
  });
  
  return { 
    dateStr: `${year}-${month}-${day}`,
    timeStr: `${hours}:${minutes}`
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

  // Handle edit class
const handleEditClass = (classSession: Class) => {
  setEditingClass(classSession);
  
  // Extract EXACT values using UTC methods
  const startDateTime = extractDateTimeForForm(classSession.startTime);
  const endDateTime = extractDateTimeForForm(classSession.endTime);
  
  console.log('EDITING CLASS - EXTRACTED VALUES:', {
    startTime: startDateTime.timeStr,
    endTime: endDateTime.timeStr,
    date: startDateTime.dateStr
  });
  
  setEditForm({
    title: classSession.title,
    description: classSession.description,
    startTime: startDateTime.timeStr,  // Exact: "14:30"
    endTime: endDateTime.timeStr,      // Exact: "16:00"
    date: startDateTime.dateStr        // Exact: "2024-01-15"
  });
  setShowEditModal(true);
  setEditError('');
};

  // Handle form change for edit modal
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...editForm, [name]: value };
    setEditForm(updatedForm);
    
    // Validate time if start time, end time, or date changes
    if (name === 'startTime' || name === 'endTime') {
      const validationError = validateDateTime(
        updatedForm.date, 
        updatedForm.startTime, 
        updatedForm.endTime
      );
      setEditError(validationError);
    }
  };

  // Validate date and time
  const validateDateTime = (date: string, startTime: string, endTime: string) => {
    if (!date || !startTime || !endTime) return '';
    
    const [year, month, day] = date.split('-').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);
    const currentDateTime = new Date();
    
    if (endDateTime <= startDateTime) {
      return 'End time must be after start time';
    }
    
    return '';
  };

  // Handle update class
const handleUpdateClass = async () => {
  if (!editingClass) return;
  
  setIsUpdating(true);
  setEditError('');
  
  try {
    if (editForm.endTime <= editForm.startTime) {
      throw new Error('End time must be after start time');
    }

    console.log('UPDATING CLASS - SENDING VALUES:', {
      date: editForm.date,        // "2024-01-15"
      startTime: editForm.startTime, // "14:30"
      endTime: editForm.endTime,     // "16:00"
    });

    const response = await fetch(`/Api/classes?classId=${editingClass._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description,
        date: editForm.date,        // Send exact: "2024-01-15"
        startTime: editForm.startTime, // Send exact: "14:30"
        endTime: editForm.endTime,     // Send exact: "16:00"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update class');
    }

    toast.success('Class updated successfully!');
    setShowEditModal(false);
    setEditingClass(null);
    
    // Refresh data
    const refreshResponse = await fetch(`/Api/tutors/courses/${params.courseId}`);
    if (refreshResponse.ok) {
      const refreshedData = await refreshResponse.json();
      setCourseData(refreshedData);
    }
  } catch (error) {
    console.error('Error updating class:', error);
    setEditError(error instanceof Error ? error.message : 'Failed to update class');
  } finally {
    setIsUpdating(false);
  }
};

  // Handle delete class
  const handleDeleteClass = async (classId: string, classTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the class "${classTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/Api/classes?classId=${classId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete class');
      }

      toast.success('Class deleted successfully!');
      
      // Refresh the course data
      const refreshResponse = await fetch(`/Api/tutors/courses/${params.courseId}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setCourseData(refreshedData);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete class');
    }
  };

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
      <div className="min-h-screen bg-[#6B46C1] flex items-center justify-center p-4">
        <div className="text-lg sm:text-2xl font-semibold text-white text-center">Loading Course Details...</div>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-[#6B46C1] flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="text-xl sm:text-2xl font-semibold text-red-600 mb-4">
            Error Loading Course
          </div>
          <p className="text-gray-700 mb-6 text-sm sm:text-base">{error}</p>
          <Link 
            href="/tutor" 
            className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-[#6B46C1] text-white rounded-lg hover:bg-[#5A3A9F] transition-colors text-sm sm:text-base"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
      <div className="flex-1 rounded-xl bg-white shadow-lg overflow-hidden">
        {/* Header */}
        {/* <header className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-gray-200 gap-4 sm:gap-0">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <Link 
              href={`/tutor/courses`} 
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow-md flex-shrink-0"
            >
              <ChevronLeft className="text-gray-700 w-5 h-5" />
            </Link>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="search"
                placeholder="Search here"
                className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-[#6B46C1] focus:border-[#6B46C1] w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="rounded-none bg-purple-100 text-purple-600 hover:bg-purple-200 p-2">
              <Send className="h-5 w-5" />
            </button>
            <button className="rounded-none bg-red-100 text-red-600 hover:bg-red-200 p-2">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium">SW</span>
              </div>
              <div className="text-sm">
                <div className="font-medium">Sherry Wolf</div>
                <div className="text-gray-500">Tutor</div>
              </div>
            </div>
          </div>
        </header> */}

        {/* Main Content Area */}
        <main className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Course Overview Card */}
          <div className="rounded-xl border border-[#6B46C1] shadow-sm bg-white">
            <div className="p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0 w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                <img src="/pianoCourse.png" alt="Piano Course" className="h-24 w-24" />
              </div>
              <div className="flex-1 grid gap-2 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900">{courseData.courseDetails.title}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 text-sm text-gray-600">
                  <span>
                    Duration : <span className="font-medium text-gray-900">{courseData.courseDetails.duration}</span>
                  </span>
                  <span>
                    Sessions : <span className="font-medium text-gray-900">{courseData.classDetails.length}</span>
                  </span>
                  <span>
                    Price : <span className="font-medium text-gray-900">Rs {courseData.courseDetails.price}</span>
                  </span>
                  <span>
                    Started From : <span className="font-medium text-gray-900">{getStartedFromDate(courseData.courseDetails)}</span>
                  </span>
                </div>
               
              </div>
              <div className="flex flex-col gap-2 mt-4 md:mt-0">
                <Link href={`/tutor/classes/?courseId=${courseData.courseDetails._id}`}>
                  <button className="bg-[#4C1D95] hover:bg-[#3730A3] text-white px-6 py-2 rounded-none flex items-center gap-2 w-full shadow-lg hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300">
                       Add Class <Plus className="h-4 w-4" />
                  </button>
                </Link>
                {/* <button 
                  onClick={handleDeleteCourse}
                  className="border border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-6 py-2 rounded-none flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Course
                </button> */}
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
              <div className="mt-6 ">
                {courseData.classDetails.map((classSession) => {
                  const { date, day, time: startTime } = formatDateTime(classSession.startTime);
                  const { time: endTime } = formatDateTime(classSession.endTime);
                  const isUploading = uploadLoading[classSession._id] || false;

                  return (
                    <div key={classSession._id} className=" border-none shadow-sm bg-white">
                      <div className="p-6 grid gap-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-gray-900">{classSession.title}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClass(classSession)}
                              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(classSession._id, classSession.title)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600">
                          {classSession.description}
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
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            ref={el => { fileInputRefs.current[classSession._id] = el; }}
                            onChange={(e) => handleFileChange(classSession._id, e)}
                          />
                          
                          {classSession.recordingUrl && (
                            <Link 
                              href={`/tutor/classQuality/${classSession._id}`}
                              className=" text-purple-600 hover:bg-purple-200 border border-purple-200 flex items-center gap-2 rounded-none px-4 py-2"
                            >
                              <BarChart3 className="h-4 w-4" /> Class Quality
                            </Link>
                          )}
                          
                          <button
                            onClick={() => triggerFileInput(classSession._id)}
                            disabled={isUploading}
                            className={`${
                              isUploading ? 'bg-gray-400 cursor-not-allowed' 
                                : ' text-green-600 hover:bg-green-200'
                            } border border-green-200 flex items-center gap-2 rounded-none px-4 py-2`}
                          >
                            <Upload className="h-4 w-4" />
                            {getButtonText(classSession, isUploading)}
                          </button>
                          
                          <Link 
                            href={`/tutor/createAssignment?classId=${classSession._id}&courseId=${courseData.courseDetails._id}`}
                            className=" text-orange-500 hover:bg-purple-200 border border-purple-200 flex items-center gap-2 rounded-none px-4 py-2"
                          >
                            <FileText className="h-4 w-4" /> Assignment
                          </Link>
                          
                          {/* <button
                            onClick={() => handleDeleteClass(classSession._id, classSession.title)}
                            className=" text-red-600 hover:bg-red-200 border border-red-200 flex items-center gap-2 rounded-none px-4 py-2"
                          >
                            <X className="h-4 w-4" /> Remove
                          </button> */}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="mt-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  {courseData.courseDetails.curriculum && courseData.courseDetails.curriculum.length > 0 ? (
                    <div className="space-y-4">
                      {courseData.courseDetails.curriculum.map((item, index) => (
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

        {/* Edit Class Modal */}
        {showEditModal && editingClass && (
          <div className="fixed inset-0 bg-black  bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white  rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Edit Class</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={editForm.date}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={editForm.startTime}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={editForm.endTime}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46C1]"
                        required
                      />
                    </div>
                  </div>

                  {editError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                      {editError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateClass}
                      disabled={isUpdating || !!editError}
                      className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                        isUpdating || editError
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-[#6B46C1] hover:bg-[#5A3A9F] text-white'
                      }`}
                    >
                      {isUpdating ? (
                        <div className="flex items-center justify-center">
                          <Clock className="animate-spin mr-2" size={16} />
                          Updating...
                        </div>
                      ) : (
                        'Update Class'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default CourseDetailsPage;