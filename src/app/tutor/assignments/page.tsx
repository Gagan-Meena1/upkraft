"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, FileText, Eye, Edit, Trash2, Plus, Filter, ChevronLeft, Search } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
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
    router.push(`/tutor/assignments/singleAssignment?assignmentId=${assignmentId}`);
  };
  
  const handleBackToTutor = () => {
    router.push('/tutor');
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
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <div className="flex gap-3 items-center">
            {/* Search Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
            
            {/* Monthly Dropdown */}
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Daily">Daily</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="px-6 py-6 hover:bg-gray-50">
              {/* Assignment Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {assignment.title}
              </h3>
              
              {/* Assignment Details Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 flex-1 min-w-0">
                  {/* Student Info */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Student :</span>
                    {assignment.assignedStudents.slice(0, 1).map((student) => (
                      <div key={student.userId} className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-orange-700">
                            {student.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {student.username}
                        </span>
                      </div>
                    ))}
                    {assignment.totalAssignedStudents > 1 && (
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        +{assignment.totalAssignedStudents - 1} more
                      </span>
                    )}
                  </div>
                  
                  {/* Assigned Creation Date */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Assigned Creation Date :</span>
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{formatDate(assignment.createdAt)}</span>
                  </div>
                  
                  {/* Deadline */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Deadline :</span>
                    <span className={`text-sm font-medium whitespace-nowrap ${getDeadlineColor(assignment.deadline)}`}>
                      {formatDeadline(assignment.deadline)}
                    </span>
                  </div>
                  
                  {/* Song Selected */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Song Selected :</span>
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">Wonderwall (Ver 1)</span>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Status :</span>
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      assignment.status ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {assignment.status ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  {/* Edit Button */}
                  <button className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Edit size={16} />
                  </button>
                  
                  {/* Delete Button */}
                  <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                    <Trash2 size={16} />
                  </button>
                  
                  {/* View Detail Button */}
                  <button 
                    onClick={() => handleViewDetail(assignment._id)}
                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors flex items-center space-x-1"
                  >
                    <span>View Detail</span>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {/* {assignments.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2">
              <button className="px-3 py-1 text-purple-600 bg-purple-100 rounded text-sm font-medium">
                1
              </button>
              <button className="px-3 py-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded text-sm">
                2
              </button>
              <button className="px-3 py-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded text-sm">
                3
              </button>
              <span className="text-gray-400 text-sm">...</span>
              <button className="px-3 py-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded text-sm">
                99
              </button>
              <button className="px-3 py-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )} */}
        
        {/* Empty State */}
        {assignments.length === 0 && (
          <div className="p-12 text-center">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Assignments Found</h2>
            <p className="text-gray-600">You haven't created any assignments yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}