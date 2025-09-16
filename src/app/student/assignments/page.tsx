"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, FileText, Eye, Edit, Trash2, Plus, Filter, ChevronLeft } from 'lucide-react';

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

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    username: string;
    userCategory: string;
    totalAssignments: number;
    assignments: Assignment[];
  };
}

export default function TutorAssignments() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('Monthly');
  const [tutorInfo, setTutorInfo] = useState<{username: string; totalAssignments: number} | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // No need to get userId - API will extract from token
        const response = await fetch('/Api/assignment');
        
        if (!response.ok) {
          throw new Error('Failed to fetch assignments');
        }

        const data: ApiResponse = await response.json();
        
        if (data.success) {
          setAssignments(data.data.assignments);
          setTutorInfo({
            username: data.data.username,
            totalAssignments: data.data.totalAssignments
          });
        } else {
          throw new Error(data.message || 'Failed to fetch assignments');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Filter assignments based on status
  const pendingAssignments = assignments.filter(assignment => !assignment.status);
  const completedAssignments = assignments.filter(assignment => assignment.status);

  // Function to handle assignment status update
  const handleStatusChange = async (assignmentId: string, currentStatus: boolean) => {
    setUpdatingStatus(assignmentId);
    
    try {
      const response = await fetch(`/Api/assignment?assignmentId=${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: !currentStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update assignment status');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update the local state
        setAssignments(prevAssignments =>
          prevAssignments.map(assignment =>
            assignment._id === assignmentId
              ? { ...assignment, status: !currentStatus }
              : assignment
          )
        );
      } else {
        throw new Error(data.message || 'Failed to update assignment status');
      }
    } catch (err) {
      console.error('Error updating assignment status:', err);
      alert('Failed to update assignment status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  const handleViewDetail = (assignmentId: string) => {
  router.push(`/student/assignments/singleAssignment?assignmentId=${assignmentId}`);
  };
  
  const handleBackToTutor = () => {
    router.push('/student');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short'
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
      return '1 Day';
    } else if (diffDays <= 7) {
      return `${diffDays} Days`;
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `${weeks} Week${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.ceil(diffDays / 30);
      return `${months} Month${months > 1 ? 's' : ''}`;
    }
  };

  const getDeadlineColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 2) return 'text-orange-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FileText size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Assignments</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBackToTutor}
              className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          </div>
        </div>
        {tutorInfo && (
          <p className="text-gray-600 mt-2">
            Welcome back, {tutorInfo.username}! 
          </p>
        )}
      </div>

      {/* Status Toggle Tabs */}
      <div className="mb-6">
        <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pending Assignments
            {pendingAssignments.length > 0 && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                activeTab === 'pending' 
                  ? 'bg-purple-300 bg-opacity-20 text-gray-900' 
                  : 'bg-white text-grey-600'
              }`}>
                {pendingAssignments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Completed Assignments
            {completedAssignments.length > 0 && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                activeTab === 'completed' 
                 ? 'bg-purple-300 bg-opacity-20 text-gray-900' 
                  : 'bg-white text-grey-600'
              }`}>
                {completedAssignments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-sm">
        {(activeTab === 'pending' ? pendingAssignments : completedAssignments).length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {activeTab === 'pending' ? 'No Pending Assignments' : 'No Completed Assignments'}
            </h2>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {(activeTab === 'pending' ? pendingAssignments : completedAssignments).map((assignment) => (
              <div key={assignment._id} className="p-6 hover:bg-purple-100 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${
                          assignment.status ? 'text-gray-500 ' : 'text-gray-900'
                        }`}>
                          {assignment.course.title} - {assignment.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {assignment.course.category}
                        </span>
                        {assignment.status && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Completed
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-purple-500" />
                          <span>Assigned Date: {formatDate(assignment.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-orange-500" />
                          <span className={`font-medium ${getDeadlineColor(assignment.deadline)}`}>
                            Deadline: {formatDeadline(assignment.deadline)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Last date of Submission: {formatDate(assignment.deadline)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <User size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Students: 
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Fixed: Add null check and default empty array */}
                          {(assignment.assignedStudents || []).slice(0, 3).map((student, index) => (
                            <div key={student.userId} className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-purple-700">
                                  {student.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="ml-1 text-sm text-gray-700">{student.username}</span>
                              {index < Math.min((assignment.assignedStudents || []).length, 3) - 1 && (
                                <span className="mx-1 text-gray-400">•</span>
                              )}
                            </div>
                          ))}
                          {/* Fixed: Add null check for totalAssignedStudents and assignedStudents */}
                          {(assignment.totalAssignedStudents || 0) > 3 && (
                            <span className="text-sm text-gray-500">
                              +{(assignment.totalAssignedStudents || 0) - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {assignment.fileUrl && (
                        <div className="flex items-center gap-2 text-sm text-purple-600 mb-4">
                          <FileText size={16} />
                          <span>Attachment: {assignment.fileName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleViewDetail(assignment._id)}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}