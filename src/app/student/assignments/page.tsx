"use client"

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { FileText, Calendar, Clock, ChevronLeft, AlertCircle, Download, Check } from 'lucide-react';

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

// Loading component for Suspense fallback
function AssignmentsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500">Course Assignments</h1>
          <p className="text-gray-500 mt-2">Loading...</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-center items-center p-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Extract the main component logic
function AssignmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const classId = searchParams.get('classId');
  const courseId = searchParams.get('courseId');
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('My Course');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'due' | 'completed'>('due');
  
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
  
  // Filter assignments based on active tab
  const filteredAssignments = assignments.filter(assignment => {
    if (activeTab === 'due') {
      return !assignment.status; // Show assignments that are not completed
    } else {
      return assignment.status; // Show completed assignments
    }
  });

  // Count assignments for each category
  const dueCount = assignments.filter(a => !a.status).length;
  const completedCount = assignments.filter(a => a.status).length;
 
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
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">Assignments</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Course Title */}
        <div className="mb-6">
          <h2 className="text-xl text-gray-600">{courseTitle}</h2>
        </div>

        {/* Toggle Buttons */}
        <div className="mb-8">
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('due')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'due'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Due Assignments
              {dueCount > 0 && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === 'due' 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  {dueCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'completed'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Completed
              {completedCount > 0 && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === 'completed' 
                    ? 'bg-gray-800 bg-opacity-20 text-white' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {completedCount}
                </span>
              )}
            </button>
          </div>
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
          ) : filteredAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <FileText size={48} className="text-orange-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {activeTab === 'due' ? 'No Due Assignments' : 'No Completed Assignments'}
              </h2>
              <p className="text-gray-500">
                {activeTab === 'due' 
                  ? 'Great! You have no pending assignments.' 
                  : 'You haven\'t completed any assignments yet.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAssignments.map((assignment) => (
                <div key={assignment._id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h2 className={`text-xl font-semibold mb-2 group-hover:text-orange-500 ${
                            assignment.status ? 'text-gray-500 line-through' : 'text-gray-800'
                          }`}>
                            {assignment.title}
                          </h2>
                          {assignment.status && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                              <Check size={12} />
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

// Main component with Suspense wrapper
export default function AssignmentsList() {
  return (
    <Suspense fallback={<AssignmentsLoading />}>
      <AssignmentsContent />
    </Suspense>
  );
}