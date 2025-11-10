"use client"

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User, FileText, Download, Users, BookOpen, Music, Gauge, Zap, Home } from 'lucide-react';

interface Student {
  userId: string;
  username: string;
  email: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status?: boolean;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  songName?: string;
  metronome?: number;       // Percentage value
  speed?: number;
  practiceStudio?: boolean;
  class: {
    _id: string;
    title: string;
    description: string;
    startTime?: string;
    endTime?: string;
  };
  course: {
    _id: string;
    title: string;
    category: string;
  };
  assignedStudents: Student[];
  totalAssignedStudents: number;
}

// Separate component that uses useSearchParams
function AssignmentDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      if (!assignmentId) {
        setError('Assignment ID not provided');
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch specific assignment details using query parameter
        const response = await fetch(`/Api/assignment/singleAssignment?assignmentId=${assignmentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch assignment details');
        }

        const data = await response.json();
        
        if (data.success) {
          setAssignment(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch assignment details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentDetail();
  }, [assignmentId]);

  const handleDownloadFile = () => {
    if (assignment?.fileUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = assignment.fileUrl;
      link.download = assignment.fileName || 'assignment-file';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due Today';
    } else if (diffDays === 1) {
      return '1 Day Left';
    } else if (diffDays <= 7) {
      return `${diffDays} Days Left`;
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `${weeks} Week${weeks > 1 ? 's' : ''} Left`;
    } else {
      const months = Math.ceil(diffDays / 30);
      return `${months} Month${months > 1 ? 's' : ''} Left`;
    }
  };

  const getDeadlineColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600 bg-red-50';
    if (diffDays <= 2) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Assignments
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FileText size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Assignment Not Found</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => router.back()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Assignments
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen size={32} className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {assignment?.title || 'Loading...'}
                </h1>
                <p className="text-gray-600">
                  {assignment?.course?.title || ''} {assignment?.course?.title && assignment?.class?.title ? '•' : ''} {assignment?.class?.title || ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {assignment?.course?.category && (
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {assignment.course.category}
                </span>
              )}
              {assignment?.status && (
                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Assignment Info Grid - Two rows: original 3 fields, then 4 new fields */}
          <div className="space-y-4">
            {/* First Row: Original Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar size={20} className="text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Assigned Date</p>
                  <p className="font-medium text-gray-800">
                    {assignment?.createdAt ? formatDate(assignment.createdAt) : 'Loading...'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock size={20} className="text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Deadline</p>
                  <p className="font-medium text-gray-800">
                    {assignment?.deadline ? formatDate(assignment.deadline) : 'Loading...'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users size={20} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="font-medium text-gray-800">
                    {assignment?.totalAssignedStudents || 0} Students
                  </p>
                </div>
              </div>
            </div>

            {/* Second Row: New Music Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Song Name Field */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Music size={20} className="text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Song Name</p>
                  <p className="font-medium text-gray-800">
                    {assignment?.songName || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Metronome Percentage Field */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Gauge size={20} className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-600">Metronome</p>
                  <p className="font-medium text-gray-800">
                    {assignment?.metronome !== undefined ? `${assignment.metronome}%` : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Speed Field */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Zap size={20} className="text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Speed</p>
                  <p className="font-medium text-gray-800">
                    {assignment?.speed || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Practice Studio Field */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Home size={20} className="text-pink-500" />
                <div>
                  <p className="text-sm text-gray-600">Practice Studio</p>
                  <p className="font-medium text-gray-800">
                    {assignment?.practiceStudio !== undefined ? (assignment.practiceStudio ? 'Yes' : 'No') : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deadline Status */}
          <div className="mt-4">
            {assignment?.deadline && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getDeadlineColor(assignment.deadline)}`}>
                <Clock size={16} />
                {formatDeadline(assignment.deadline)}
              </div>
            )}
          </div>
        </div>

        {/* Assignment Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignment Instructions</h2>
          
          {/* Assignment description from API */}
          <div className="text-gray-700 whitespace-pre-wrap">
            {assignment?.description || 'No instructions provided'}
          </div>
        </div>

        {/* File Attachment */}
        {assignment?.fileUrl && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignment Files</h2>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
              <FileText size={24} className="text-purple-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{assignment.fileName || 'Attached file'}</p>
                <p className="text-sm text-gray-600">Attached file</p>
              </div>
              <button 
                onClick={handleDownloadFile}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        )}

        {/* Assigned Students */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Assigned Students ({assignment?.totalAssignedStudents || 0})
          </h2>
          <div className="flex items-center gap-4 mb-4">
          <button className="hover:bg-purple-100">Completed</button>
          <button className="hover:bg-purple-100">Pending</button>
          </div>
          {assignment?.assignedStudents?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignment.assignedStudents.map((student) => (
                <div key={student.userId} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <User size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.username}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No students assigned yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function AssignmentDetailLoading() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function AssignmentDetail() {
  return (
    <Suspense fallback={<AssignmentDetailLoading />}>
      <AssignmentDetailContent />
    </Suspense>
  );
}