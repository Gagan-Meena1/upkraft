"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { FileText, Calendar, Clock, ArrowLeft, ChevronRight, AlertCircle, Download, Check } from 'lucide-react';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status?: boolean;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

export default function AssignmentsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const classId = searchParams.get('classId');
  const courseId = searchParams.get('courseId');
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('My Course');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // Construct URL with query parameters if they exist
        let url = `/Api/assignment`;
        if (courseId) {
          url += `?courseId=${courseId}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch assignments');
        }
        
        const data = await response.json();
        console.log("data :" ,data);
        
        if (data.success) {
          setAssignments(data.assignments || []);
          
          // Set course title from the first assignment if available
          if (data.assignments && data.assignments.length > 0 && data.assignments[0].courseTitle) {
            setCourseTitle(data.assignments[0].courseTitle);
          } else {
            setCourseTitle('My Course');
          }
        } else {
          throw new Error(data.error || 'Failed to fetch assignments');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssignments();
  }, [courseId]);
  
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
  
  // Function to format date in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric', 
      minute: 'numeric'
    }).format(date);
  };
  
  // Function to check if deadline is passed
  const isDeadlinePassed = (deadlineString: string) => {
    const deadline = new Date(deadlineString);
    const now = new Date();
    return deadline < now;
  };
  
  // Function to calculate days remaining until deadline
  const getDaysRemaining = (deadlineString: string) => {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Assignments | {courseTitle}</title>
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 hover:text-orange-500 transition-colors duration-200 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="font-medium">Back</span>
        </button>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500">Course Assignments</h1>
          <p className="text-gray-500 mt-2">{courseTitle}</p>
        </div>
        
        {/* Main content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {isLoading ? (
            <div className="flex justify-center items-center p-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <AlertCircle size={48} className="text-orange-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Assignments</h2>
              <p className="text-gray-500">{error}</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <FileText size={48} className="text-orange-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Assignments Yet</h2>
              <p className="text-gray-500">There are no assignments for this course yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Checkbox for completion status */}
                      <div className="flex items-center mt-1">
                        <button
                          onClick={() => handleStatusChange(assignment._id, assignment.status || false)}
                          disabled={updatingStatus === assignment._id}
                          className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                            ${assignment.status 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-orange-400'
                            }
                            ${updatingStatus === assignment._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          {updatingStatus === assignment._id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />
                          ) : assignment.status ? (
                            <Check size={12} />
                          ) : null}
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h2 className={`text-xl font-semibold mb-2 group-hover:text-orange-500 ${
                            assignment.status ? 'text-gray-500 line-through' : 'text-gray-800'
                          }`}>
                            {assignment.title}
                          </h2>
                          {assignment.status && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <Calendar size={16} className="mr-2 text-orange-400" />
                          <span>Due: {formatDate(assignment.deadline)}</span>
                          
                          {!assignment.status && (
                            <>
                              {isDeadlinePassed(assignment.deadline) ? (
                                <span className="ml-4 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                  Deadline passed
                                </span>
                              ) : getDaysRemaining(assignment.deadline) <= 2 ? (
                                <span className="ml-4 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                                  {getDaysRemaining(assignment.deadline) <= 0 
                                    ? 'Due today' 
                                    : `${getDaysRemaining(assignment.deadline)} day${getDaysRemaining(assignment.deadline) !== 1 ? 's' : ''} left`}
                                </span>
                              ) : (
                                <span className="ml-4 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  {getDaysRemaining(assignment.deadline)} days left
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        
                        <p className={`mb-4 line-clamp-2 ${
                          assignment.status ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {assignment.description}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock size={16} className="mr-2 text-orange-400" />
                          <span>Posted on {formatDate(assignment.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-3">
                      {assignment.fileUrl && (
                        <a 
                          href={assignment.fileUrl} 
                          download={assignment.fileName || true}
                          className="flex items-center text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
                        >
                          <Download size={16} className="mr-2" />
                          {assignment.fileName || 'Download attachment'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}