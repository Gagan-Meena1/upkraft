"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Upload, FileText, IndianRupee, BarChart3, Trash2, Edit, X, Clock ,User,ChevronUp,ChevronDown,UserCheck} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { formatInTz, formatTimeRangeInTz, getUserTimeZone } from '@/helper/time';
import Image from 'next/image';


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

interface EditClassForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
}

interface CourseUser {
  _id: string;
  username: string;
  category: string;
  email: string;
  profileImage: string;
}

interface CourseUsersData {
  tutors: CourseUser[];
  students: CourseUser[];
  loading: boolean;
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
  const [userTimezone, setUserTimezone] = useState<string | null>(null);
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<Class | null>(null);
const [attendanceData, setAttendanceData] = useState<{[tutorId: string]: string}>({});
const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
const [attendanceStatus, setAttendanceStatus] = useState<{[tutorId: string]: string}>({});
  const params = useParams();
  const router = useRouter();

  const [courseUsersData, setCourseUsersData] = useState<CourseUsersData>({
  tutors: [],
  students: [],
  loading: false
});
const [activeToggle, setActiveToggle] = useState<'students' | 'tutors' | null>(null);
const [showMore, setShowMore] = useState<{students: boolean; tutors: boolean}>({
  students: false,
  tutors: false
});
const [category, setCategory] = useState<string | null>(null);
const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
const [isRemoving, setIsRemoving] = useState(false);
  // Helper function to format date and time
  /*
const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  
  // Use UTC methods to get the EXACT stored time
   const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  // For weekday, create a date object in UTC
  const utcDate = new Date(Date.UTC(year, month, day));
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = weekdays[utcDate.getUTCDay()];
  const monthName = months[month];
  
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
  console.log('DISPLAYING FROM UTC:', {
    originalString: dateTimeString,
    displayTime: timeStr,
    displayDate: `${weekday}, ${monthName} ${day}, ${year}`
  });
  
  return {
    date: `${weekday}, ${monthName} ${day}, ${year}`,
    time: timeStr  // Exact stored time: "14:30"
  };
};
*/

  const formatDateTime = (startTime: string, endTime: string) => {
    const tz = userTimezone || getUserTimeZone();

    const date = formatInTz(startTime, tz, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const timeRange = formatTimeRangeInTz(startTime, endTime, tz);

    return {
      date,
      time: timeRange,
    };
  };


  // Helper function to extract date and time for form inputs
const extractDateTimeForForm = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  
  // Use UTC methods to get the EXACT stored time
    const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
  console.log('EXTRACTING FROM UTC:', {
    originalString: dateTimeString,
    extractedTime: `${hours}:${minutes}`,
    extractedDate: `${year}-${month}-${day}`
  });
  
  return { 
    dateStr: `${year}-${month}-${day}`,  // Exact: "2024-01-15"
    timeStr: `${hours}:${minutes}`       // Exact: "14:30"
  };
};


// Open attendance modal and fetch current attendance status
const handleOpenAttendance = async (classSession: Class) => {
  setSelectedClassForAttendance(classSession);
  setShowAttendanceModal(true);
  
  // Fetch current attendance status for all tutors
  const statusMap: {[tutorId: string]: string} = {};
  
  for (const tutor of courseUsersData.tutors) {
    try {
      const response = await fetch(`/Api/attendance?studentId=${tutor._id}&classId=${classSession._id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          statusMap[tutor._id] = data.data.status || 'not_marked';
        } else {
          statusMap[tutor._id] = 'not_marked';
        }
      } else {
        statusMap[tutor._id] = 'not_marked';
      }
    } catch (error) {
      console.error(`Error fetching attendance for tutor ${tutor._id}:`, error);
      statusMap[tutor._id] = 'not_marked';
    }
  }
  
  setAttendanceStatus(statusMap);
  setAttendanceData(statusMap);
};

// Handle attendance change
const handleAttendanceChange = (tutorId: string, status: string) => {
  setAttendanceData(prev => ({
    ...prev,
    [tutorId]: status
  }));
};

// Submit attendance
const handleSubmitAttendance = async () => {
  if (!selectedClassForAttendance) return;
  
  setIsMarkingAttendance(true);
  
  try {
    const promises = Object.entries(attendanceData).map(([tutorId, status]) => {
      return fetch(`/Api/attendance?studentId=${tutorId}&classId=${selectedClassForAttendance._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
    });
    
    const results = await Promise.all(promises);
    
    const allSuccessful = results.every(res => res.ok);
    
    if (allSuccessful) {
      toast.success('Attendance marked successfully for all tutors!');
      setShowAttendanceModal(false);
      setSelectedClassForAttendance(null);
      setAttendanceData({});
    } else {
      toast.error('Some attendance records failed to save');
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    toast.error('Failed to mark attendance');
  } finally {
    setIsMarkingAttendance(false);
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
        setAcademyId(data.academyId || null); // Add this line
        setLoading(false);

        const tutorIds = data.courseDetails.academyInstructorId || [];
        const studentIds = data.courseDetails.students || [];
        
        if (tutorIds.length > 0 || studentIds.length > 0) {
          fetchCourseUsers(tutorIds, studentIds);
        }
      

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    if (params.courseId) {
      fetchCourseDetails();
    }
  }, [params.courseId]);

  // Handle user selection for removal

  const handleSelectUser = (userId: string) => {
  setSelectedUsers(prev => {
    const newSet = new Set(prev);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    return newSet;
  });
};

const handleSelectAll = (users: CourseUser[]) => {
  if (selectedUsers.size === users.length) {
    setSelectedUsers(new Set());
  } else {
    setSelectedUsers(new Set(users.map(u => u._id)));
  }
};

const handleRemoveUsers = async () => {
  if (selectedUsers.size === 0) {
    toast.error('Please select users to remove');
    return;
  }

  if (!window.confirm(`Are you sure you want to remove ${selectedUsers.size} ${activeToggle}(s) from this course?`)) {
    return;
  }

  setIsRemoving(true);
  try {
    const endpoint = activeToggle === 'students' 
      ? '/Api/academy/assignStudentsToCourse'
      : '/Api/academy/assignTutorsToCourse';
    
    const body = activeToggle === 'students'
      ? { studentIds: Array.from(selectedUsers) }
      : { tutorIds: Array.from(selectedUsers) };

    const response = await fetch(`${endpoint}?courseId=${params.courseId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove users');
    }

    const data = await response.json();
    toast.success(data.message || 'Users removed successfully');
    
    // Clear selection first
    setSelectedUsers(new Set());
    
    // Refresh course data FIRST
    const refreshResponse = await fetch(`/Api/tutors/courses/${params.courseId}`);
    if (refreshResponse.ok) {
      const refreshedData = await refreshResponse.json();
      setCourseData(refreshedData);
      
      // NOW fetch the updated user data with the NEW tutorIds and studentIds
      const updatedTutorIds = refreshedData.courseDetails.academyInstructorId || [];
      const updatedStudentIds = refreshedData.courseDetails.students || [];
      
      // Only fetch if there are users to fetch
      if (updatedTutorIds.length > 0 || updatedStudentIds.length > 0) {
        await fetchCourseUsers(updatedTutorIds, updatedStudentIds);
      } else {
        // If no users left, clear the data
        setCourseUsersData({
          tutors: [],
          students: [],
          loading: false
        });
      }
    }
  } catch (error) {
    console.error('Error removing users:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to remove users');
  } finally {
    setIsRemoving(false);
  }
};

  const handleToggleSection = (section: 'students' | 'tutors') => {
  if (activeToggle === section) {
    setActiveToggle(null);
  } else {
    setActiveToggle(section);
  }
};

  // Fetch user's timezone
  useEffect(() => {
    const fetchUserTimezone = async () => {
      try {
        const response = await fetch("/Api/users/user");
        const data = await response.json();
        if (data.user?.timezone) {
          setUserTimezone(data.user.timezone);
        }
      } catch (error) {
        console.error("Error fetching user timezone:", error);
      }
    };
    fetchUserTimezone();
  }, []);

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
    
    // if (startDateTime <= currentDateTime) {
    //   return 'Start time cannot be in the past';
    // }
    
    if (endDateTime <= startDateTime) {
      return 'End time must be after start time';
    }
    
    return '';
  };

  // Handle update class
const handleUpdateClass = async (e: React.FormEvent) => {
  e.preventDefault();
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
        timezone: userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
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

  const fetchCourseUsers = async (tutorIds: any[], studentIds: any[]) => {
  try {
    setCourseUsersData(prev => ({ ...prev, loading: true }));

    const response = await fetch('/Api/academy/courseUsers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tutorIds, studentIds })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course users');
    }

    const data = await response.json();
    
    setCourseUsersData({
      tutors: data.tutors || [],
      students: data.students || [],
      loading: false
    });
  } catch (error) {
    console.error('Error fetching course users:', error);
    setCourseUsersData({
      tutors: [],
      students: [],
      loading: false
    });
    toast.error('Failed to load assigned users');
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
      router.push('/academy/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="!min-h-screen !bg-gradient-to-br !from-gray-100 !via-gray-200 !to-gray-300 !flex !items-center !justify-center !p-4">
        <div className="!text-lg !sm:text-2xl !font-semibold !text-gray-700 !text-center">Loading Course Details...</div>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="!min-h-screen !bg-gradient-to-br !from-gray-100 !via-gray-200 !to-gray-300 !flex !items-center !justify-center !p-4">
        <div className="!bg-white !p-6 !sm:p-8 !rounded-xl !shadow-lg !text-center !max-w-md !w-full">
          <div className="!text-xl !sm:text-2xl !font-semibold !text-red-600 !mb-4">
            Error Loading Course
          </div>
          <p className="!text-gray-700 !mb-6 !text-sm !sm:text-base">{error}</p>
          <Link 
            href="/academy" 
            className="!inline-block !px-4 !sm:px-6 !py-2 !sm:py-3 !bg-gradient-to-r !from-blue-500 !to-purple-600 !text-white !rounded-lg !hover:from-blue-600 !hover:to-purple-700 !transition-colors !text-sm !sm:text-base"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-gray-100 !via-gray-200 !to-gray-300 !p-3 !sm:p-6">
      <div className="!max-w-6xl !mx-auto">
        {/* Header with Back Button */}
        <header className="!mb-6 !sm:mb-8">
          <div className="!flex !flex-col !sm:flex-row !sm:justify-between !sm:items-center !gap-4">
            <div className="!flex !items-center !space-x-3 !sm:space-x-4">
              <Link 
                href={`/academy/courses`} 
                className="!p-2 !rounded-full !bg-gray-200 !hover:bg-gray-300 !transition-colors !shadow-md !flex-shrink-0"
              >
                <ChevronLeft className="!text-gray-700 !w-5 !h-5 !sm:w-6 !sm:h-6" />
              </Link>
              <h1 className="!text-xl !sm:text-2xl !lg:text-3xl !font-bold !text-gray-800 !break-words">
                {courseData.courseDetails.title}
              </h1>
            </div>
            <div className="!flex !flex-col !sm:flex-row !items-stretch !sm:items-center !gap-2 !sm:gap-3">
            
  <Link href={`/academy/classes/?courseId=${courseData.courseDetails._id}`}>
    <button className="!w-full !sm:w-auto !bg-gray-700 !hover:bg-gray-800 !text-white !px-3 !sm:px-4 !py-2 !rounded-md !font-medium !transition-colors !shadow-md !flex !items-center !justify-center !gap-2 !text-sm !sm:text-base">
      <Upload size={16} className="!sm:w-[18px] !sm:h-[18px]" />
      Create Class
    </button>
  </Link>

              {!academyId && (<button 
                onClick={handleDeleteCourse}
                className="!w-full !sm:w-auto !border !border-gray-300 !bg-white !text-gray-700 !hover:bg-red-50 !hover:text-red-600 !hover:border-red-200 !px-3 !sm:px-4 !py-2 !rounded-md !font-medium !transition-all !duration-200 !flex !items-center !justify-center !gap-2 !shadow-sm !text-sm !sm:text-base"
              >
                <Trash2 size={16} className="!sm:w-[18px] !sm:h-[18px]" />
                Delete Course
              </button>)}
            </div>
          </div>
        </header>
  
        {/* Course Overview */}
        <section className="!bg-white !rounded-xl !shadow-lg !p-4 !sm:p-6 !mb-6 !sm:mb-8">
          <div className="!flex !flex-col !sm:flex-row !sm:justify-between !sm:items-center !mb-4 !gap-3">
            <div>
              <h2 className="!text-lg !sm:text-xl !font-semibold !text-gray-800 !flex !items-center">
                <BookOpen className="!mr-2 !text-gray-600 !w-5 !h-5 !sm:w-6 !sm:h-6" />
                Course Overview
              </h2>
            </div>
            <div className="!text-gray-600 !text-sm !sm:text-base">
              <div className="!flex !flex-col !sm:flex-row !gap-2 !sm:gap-4">
                <span><span className="!font-medium">Duration:</span> {courseData.courseDetails.duration}</span>
                <span><span className="!font-medium">Price:</span> <IndianRupee className='!text-xs !scale-70 !inline-block !transform'/>{courseData.courseDetails.price}</span>
              </div>
            </div>
          </div>
          <p className="!text-gray-600 !text-sm !sm:text-base !leading-relaxed">{courseData.courseDetails.description}</p>
        </section>

        {/* Assigned Users Section - Only for Academic category */}
{category === "Academic" || (
  <section className="!bg-white !rounded-xl !shadow-lg !p-4 !sm:p-6 !mb-6 !sm:mb-8">
    <h2 className="!text-lg !sm:text-xl !font-semibold !text-gray-800 !mb-4">
      Assigned Users
    </h2>
    
    <div className="!flex !gap-2 !mb-4 !flex-wrap">
      <button
        onClick={() => handleToggleSection('students')}
        className={`!px-4 !py-2 !rounded-lg !font-medium !transition-all !duration-200 !flex !items-center !gap-2 !text-sm !sm:text-base ${
          activeToggle === 'students'
            ? '!bg-blue-500 !text-white !shadow-md'
            : '!bg-gray-100 !text-gray-700 !hover:bg-gray-200'
        }`}
      >
        <User className="!h-4 !w-4" />
        <span>Assigned Students ({courseUsersData.students.length})</span>
        {activeToggle === 'students' ? (
          <ChevronUp className="!h-4 !w-4" />
        ) : (
          <ChevronDown className="!h-4 !w-4" />
        )}
      </button>
      
      <button
        onClick={() => handleToggleSection('tutors')}
        className={`!px-4 !py-2 !rounded-lg !font-medium !transition-all !duration-200 !flex !items-center !gap-2 !text-sm !sm:text-base ${
          activeToggle === 'tutors'
            ? '!bg-blue-500 !text-white !shadow-md'
            : '!bg-gray-100 !text-gray-700 !hover:bg-gray-200'
        }`}
      >
        <User className="!h-4 !w-4" />
        <span>Assigned Tutors ({courseUsersData.tutors.length})</span>
        {activeToggle === 'tutors' ? (
          <ChevronUp className="!h-4 !w-4" />
        ) : (
          <ChevronDown className="!h-4 !w-4" />
        )}
      </button>
    </div>

    {/* Display Users Table */}
    {activeToggle && (
      <div className="!mt-4">
        {courseUsersData.loading ? (
          <div className="!text-center !py-8">
            <span className="!spinner-border !spinner-border-sm"></span>
            <span className="!ms-2">Loading...</span>
          </div>
        ) : (
          <>
            {(() => {
              const users = activeToggle === 'students' 
                ? courseUsersData.students
                : courseUsersData.tutors;
              
              const displayUsers = showMore[activeToggle]
                ? users
                : users.slice(0, 3);

              return users.length > 0 ? (
                <>
                  <div className="!overflow-x-auto">
  <table className="!w-full !border-collapse">
    <thead>
      <tr className="!bg-gray-50">
        <th className="!px-4 !py-3 !text-left !text-sm !font-medium !text-gray-700 !border-b">
          <input
            type="checkbox"
            checked={selectedUsers.size === users.length && users.length > 0}
            onChange={() => handleSelectAll(users)}
            className="!w-4 !h-4 !rounded !border-gray-300"
          />
        </th>
        <th className="!px-4 !py-3 !text-left !text-sm !font-medium !text-gray-700 !border-b">Profile</th>
        <th className="!px-4 !py-3 !text-left !text-sm !font-medium !text-gray-700 !border-b">Name</th>
        <th className="!px-4 !py-3 !text-left !text-sm !font-medium !text-gray-700 !border-b">Email</th>
        <th className="!px-4 !py-3 !text-left !text-sm !font-medium !text-gray-700 !border-b">Category</th>
      </tr>
    </thead>
    <tbody>
      {displayUsers.map((user) => (
        <tr key={user._id} className="!hover:bg-gray-50 !transition-colors">
          <td className="!px-4 !py-3 !border-b">
            <input
              type="checkbox"
              checked={selectedUsers.has(user._id)}
              onChange={() => handleSelectUser(user._id)}
              className="!w-4 !h-4 !rounded !border-gray-300"
            />
          </td>
          <td className="!px-4 !py-3 !border-b">
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.username}
                width={40}
                height={40}
                className="!rounded-full !object-cover"
              />
            ) : (
              <div className="!w-10 !h-10 !bg-gray-200 !rounded-full !flex !items-center !justify-center">
                <User className="!text-gray-400 !w-5 !h-5" />
              </div>
            )}
          </td>
          <td className="!px-4 !py-3 !border-b !text-sm !text-gray-800">{user.username}</td>
          <td className="!px-4 !py-3 !border-b !text-sm !text-gray-600">{user.email}</td>
          <td className="!px-4 !py-3 !border-b">
            <span className="!inline-block !px-3 !py-1 !rounded-full !text-xs !font-medium !bg-blue-100 !text-blue-800">
              {user.category}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Remove Button */}
{selectedUsers.size > 0 && (
  <div className="!mt-4 !flex !justify-end">
    <button
      onClick={handleRemoveUsers}
      disabled={isRemoving}
      className={`!px-4 !py-2 !rounded-lg !flex !items-center !gap-2 !text-white !font-medium !transition-colors ${
        isRemoving 
          ? '!bg-gray-400 !cursor-not-allowed' 
          : '!bg-red-500 !hover:bg-red-600'
      }`}
    >
      <Trash2 className="!h-4 !w-4" />
      {isRemoving ? 'Removing...' : `Remove ${selectedUsers.size} Selected`}
    </button>
  </div>
)}
                  
                  {users.length > 3 && (
                    <div className="!text-center !mt-4">
                      <button
                        onClick={() => setShowMore(prev => ({
                          ...prev,
                          [activeToggle]: !prev[activeToggle]
                        }))}
                        className="!px-4 !py-2 !text-blue-500 !hover:text-blue-700 !hover:bg-blue-50 !rounded-lg !transition-colors !font-medium !text-sm"
                      >
                        {showMore[activeToggle]
                          ? 'Show Less'
                          : `Show More (${users.length - 3} more)`}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="!text-center !py-8">
                  <User className="!mx-auto !h-12 !w-12 !text-gray-400 !mb-2" />
                  <p className="!text-gray-500">
                    No {activeToggle} assigned yet
                  </p>
                </div>
              );
            })()}
          </>
        )}
      </div>
    )}
  </section>
)}

        {/* Tab Navigation */}
        <div className="!mb-6">
          <div className="!flex !bg-white !rounded-lg !shadow-md !p-1 !max-w-md !mx-auto !sm:mx-0">
            <button
              onClick={() => setActiveTab('classes')}
              className={`!flex-1 !py-2 !px-4 !rounded-md !font-medium !transition-all !duration-200 !text-sm !sm:text-base ${
                activeTab === 'classes'
                  ? '!bg-blue-500 !text-white !shadow-md'
                  : '!text-gray-600 !hover:text-gray-800'
              }`}
            >
              Classes
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`!flex-1 !py-2 !px-4 !rounded-md !font-medium !transition-all !duration-200 !text-sm !sm:text-base ${
                activeTab === 'curriculum'
                  ? '!bg-blue-500 !text-white !shadow-md'
                  : '!text-gray-600 !hover:text-gray-800'
              }`}
            >
              Curriculum
            </button>
          </div>
        </div>
  
        {/* Classes Section */}
        {activeTab === 'classes' && (
          <section>
            <h2 className="!text-xl !sm:text-2xl !font-bold !text-gray-800 !mb-4 !sm:mb-6">
              Course Classes
            </h2>
            
            <div className="!space-y-4 !sm:space-y-6">
              {courseData.classDetails.map((classSession) => {
                const { date, time } = formatDateTime(classSession.startTime, classSession.endTime);
                const isUploading = uploadLoading[classSession._id] || false;

                return (
                  <div 
                    key={classSession._id} 
                    className="!bg-white !rounded-xl !shadow-md !hover:shadow-xl !transition-shadow"
                  >
                    <div className="!p-4 !sm:p-6">
                      {/* Mobile Layout */}
                      <div className="block lg:hidden !text-gray-800">
                        <div className="!flex !gap-3">
                          {/* Edit/Delete Icons on extreme left */}
                          <div className="!flex !flex-col !gap-2">
                            <button
                              onClick={() => handleEditClass(classSession)}
                              className="!p-1 !text-blue-500 !hover:text-blue-700 !hover:bg-blue-50 !rounded-full !transition-colors group relative"
                              title="Edit class"
                            >
                              <Edit size={16} />
                              
                            </button>
                            <button
                              onClick={() => handleDeleteClass(classSession._id, classSession.title)}
                              className="!p-1 !text-red-500 !hover:text-red-700 !hover:bg-red-50 !rounded-full !transition-colors group relative"
                              title="Delete class"
                            >
                              <Trash2 size={16} />
                             
                            </button>
                          </div>

                          {/* Content Area */}
                          <div className="flex-1 !space-y-4">
                            {/* Date and Time */}
                            <div className="!bg-gray-100 !rounded-lg !p-3 !text-center">
                              <div className="!text-sm !font-bold !text-gray-800">{date}</div>
                              <div className="!text-xs !text-gray-600">
                                {time}
                              </div>
                            </div>

                            {/* Session Details */}
                            <div>
                              <h3 className="!text-lg !font-semibold !text-gray-800 !mb-2">
                                {classSession.title}
                              </h3>
                              <p className="!text-gray-600 !text-sm !leading-relaxed">
                                {classSession.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="!flex !flex-col !gap-2 !ml-10">
                          {/* Hidden file input */}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            ref={el => { fileInputRefs.current[classSession._id] = el; }}
                            onChange={(e) => handleFileChange(classSession._id, e)}
                          />

                          <div className="!flex !gap-2">

                            {/* Add this button after the Assignment button in mobile layout */}
<button
  onClick={() => handleOpenAttendance(classSession)}
  className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center text-xs font-medium shadow-sm"
>
  <UserCheck className="mr-1" size={14} />
  Mark Attendance
</button>



                            {/* Class Quality button */}
                            {classSession.recordingUrl && (
                              <Link 
                                href={`/academy/classQuality/${classSession._id}`}
                                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center text-xs"
                              >
                                <BarChart3 className="!mr-1" size={14} />
                                Quality
                              </Link>
                            )}

                            {/* Upload Recording button */}
                            <button
                              onClick={() => triggerFileInput(classSession._id)}
                              disabled={isUploading}
                              className={`flex-1 px-3 py-2 ${
                                isUploading ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-purple-500 hover:bg-purple-600'
                              } text-white rounded-lg transition-colors flex items-center justify-center text-xs`}
                            >
                              <Upload className="!mr-1" size={14} />
                              {getButtonText(classSession, isUploading)}
                            </button>
                          </div>

                          {/* Assignment Button */}
                       {/* <Link 
  href={`/tutor/createAssignment?classId=${classSession._id}&courseId=${courseData.courseDetails._id}`}
style={{ backgroundColor: '#fb923c', color: '#ffffff' }}
  className="w-full px-3 py-2 hover:opacity-90 rounded-lg transition-all flex items-center justify-center text-xs font-medium shadow-sm"
>
  <FileText className="mr-1" size={14} />
  Add Assignment
</Link> */}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:block">
                        <div className="!flex !gap-6 !items-center">
                          {/* Edit/Delete Icons on extreme left */}
                          <div className="!flex !flex-col !gap-2">
                            <button
                              onClick={() => handleEditClass(classSession)}
                              className="!p-1 !text-blue-500 !hover:text-blue-700 !hover:bg-blue-50 !rounded-full !transition-colors group relative"
                              title="Edit class"
                            >
                              <Edit size={18} />
                             
                            </button>
                            <button
                              onClick={() => handleDeleteClass(classSession._id, classSession.title)}
                              className="!p-1 !text-red-500 !hover:text-red-700 !hover:bg-red-50 !rounded-full !transition-colors group relative"
                              title="Delete class"
                            >
                              <Trash2 size={18} />
                              
                            </button>
                          </div>

                          {/* Date and Time */}
                          <div className="!bg-gray-100 !rounded-lg !p-4 !text-center !min-w-[200px]">
                            <div className="!text-xl !font-bold !text-gray-800">{date}</div>
                            <div className="!text-gray-600">
                              {time}
                            </div>
                          </div>

                          {/* Session Details */}
                          <div className="flex-1">
                            <h3 className="!text-xl !font-semibold !text-gray-800 !mb-2">
                              {classSession.title}
                            </h3>
                            <p className="!text-gray-600">
                              {classSession.description}
                            </p>
                          </div>

                          {/* Actions */}
                          {/* Actions */}
<div className="flex flex-col gap-3 min-w-[180px]">


  {/* Add this button after the Assignment button in desktop layout */}
<button
  onClick={() => handleOpenAttendance(classSession)}
  style={{ backgroundColor: '#10b981', color: '#ffffff' }}
  className="px-4 py-2.5 hover:opacity-90 rounded-lg transition-all flex items-center justify-center text-sm font-medium shadow-lg"
>
  <UserCheck className="mr-2" size={16} />
  Mark Attendance
</button>
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
      href={`/academy/classQuality/${classSession._id}`}
      style={{ backgroundColor: 'purple', color: '#ffffff' }}
      className="px-4 py-2.5 hover:opacity-90 rounded-lg transition-all flex items-center justify-center text-sm font-medium shadow-lg"
    >
      <BarChart3 className="mr-2" size={16} />
      Class Quality
    </Link>
  )}

  {/* Upload Recording button */}
  <button
    onClick={() => triggerFileInput(classSession._id)}
    disabled={isUploading}
    style={{ 
      backgroundColor: isUploading ? 'blueviolet' : 'blue',
      color: '#ffffff'
    }}
    className={`px-4 py-2.5 rounded-lg transition-all flex items-center justify-center text-sm font-medium shadow-lg ${
      isUploading ? 'cursor-not-allowed' : 'hover:opacity-90'
    }`}
  >
    <Upload className="mr-2" size={16} />
    {getButtonText(classSession, isUploading)}
  </button>

  {/* Assignment Button */}
  {/* <Link 
    href={`/tutor/createAssignment?classId=${classSession._id}&courseId=${courseData.courseDetails._id}`}
    style={{ backgroundColor: 'blueviolet', color: '#ffffff' }}
    className="px-4 py-2.5 hover:opacity-90 rounded-lg transition-all flex items-center justify-center text-sm font-medium shadow-lg"
  >
    <FileText className="mr-2" size={16} />
    Add Assignment
  </Link> */}
</div>
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
        {activeTab === 'curriculum' && (
          <section>
            <h2 className="!text-xl !sm:text-2xl !font-bold !text-gray-800 !mb-4 !sm:mb-6">
              Course Curriculum
            </h2>
            
            <div className="!bg-white !rounded-xl !shadow-lg !p-4 !sm:p-6">
              {courseData.courseDetails.curriculum && courseData.courseDetails.curriculum.length > 0 ? (
                <div className="!space-y-4">
                  {courseData.courseDetails.curriculum.map((item, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          Lesson {item.sessionNo}
                        </span>
                        <h3 className="!text-lg !font-semibold !text-gray-800">
                          {item.topic}
                        </h3>
                      </div>
                      <p className="!text-gray-600 !mt-2 !text-sm !sm:text-base">
                        <span className="!font-medium">Outcome:</span> {item.tangibleOutcome}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="!text-center !py-8">
                  <BookOpen className="!mx-auto !h-12 !w-12 !text-gray-400 !mb-4" />
                  <p className="!text-gray-500 !text-lg">No curriculum available</p>
                  <p className="!text-gray-400 !text-sm">The curriculum for this course hasn't been set up yet.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Edit Class Modal */}
        {showEditModal && editingClass && (
          <div className="fixed inset-0 bg-black text-gray-800 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="!bg-white !rounded-xl !shadow-xl !max-w-md !w-full !max-h-[90vh] !overflow-y-auto">
              <div className="!p-6">
                <div className="!flex !justify-between !items-center !mb-4">
                  <h3 className="!text-lg !font-semibold !text-gray-800">Edit Class</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="!p-1 !hover:bg-gray-100 !rounded-full !transition-colors"
                  >
                    <X size={20} className="!text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleUpdateClass} className="!space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {editError && (
                    <div className="!text-red-600 !text-sm !bg-red-50 !p-3 !rounded-md">
                      {editError}
                    </div>
                  )}

                  <div className="!flex !gap-3 !pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating || !!editError}
                      className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                        isUpdating || editError
                          ? '!bg-gray-400 !cursor-not-allowed !text-white'
                          : '!bg-blue-500 !hover:bg-blue-600 !text-white'
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
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Attendance Modal */}
{showAttendanceModal && selectedClassForAttendance && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Mark Attendance - {selectedClassForAttendance.title}
          </h3>
          <button
            onClick={() => {
              setShowAttendanceModal(false);
              setSelectedClassForAttendance(null);
              setAttendanceData({});
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          {courseUsersData.tutors.length > 0 ? (
            courseUsersData.tutors.map((tutor) => (
              <div 
                key={tutor._id} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {tutor.profileImage ? (
                    <Image
                      src={tutor.profileImage}
                      alt={tutor.username}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="text-gray-400 w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-800">{tutor.username}</div>
                    <div className="text-sm text-gray-500">{tutor.email}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAttendanceChange(tutor._id, 'present')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      attendanceData[tutor._id] === 'present'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleAttendanceChange(tutor._id, 'absent')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      attendanceData[tutor._id] === 'absent'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">No tutors assigned to this course</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t">
          <button
            type="button"
            onClick={() => {
              setShowAttendanceModal(false);
              setSelectedClassForAttendance(null);
              setAttendanceData({});
            }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitAttendance}
            disabled={isMarkingAttendance || Object.keys(attendanceData).length === 0}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              isMarkingAttendance || Object.keys(attendanceData).length === 0
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isMarkingAttendance ? (
              <div className="flex items-center justify-center">
                <Clock className="animate-spin mr-2" size={16} />
                Marking...
              </div>
            ) : (
              'Mark Attendance'
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default CourseDetailsPage;