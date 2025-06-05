"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface FeedbackData {
  _id: string;
  attendance: number;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  classId: {
    _id: string;
    className: string;
  };
  rhythm: string;
  theoreticalUnderstanding: string;
  performance: string;
  earTraining: string;
  assignment: string;
  technique: string;
  personalFeedback: string;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackResponse {
  success: boolean;
  count: number;
  data: FeedbackData[];
  feedbackAllStudent: FeedbackData[];
}

const FeedbackPage = () => {
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classId, setclassId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  // Get IDs from URL using window.location (works in browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Method 1: Using URLSearchParams with window.location.search
      const urlParams = new URLSearchParams(window.location.search);
      const classIdFromUrl = urlParams.get('classId');
      const studentIdFromUrl = urlParams.get('studentId');
      
      setclassId(classIdFromUrl);
      setStudentId(studentIdFromUrl);

      // Method 2: Alternative - parsing window.location.href manually
      // const url = new URL(window.location.href);
      // const classIdFromUrl = url.searchParams.get('classId');
      // const studentIdFromUrl = url.searchParams.get('studentId');

      // Method 3: Alternative - using window.location.pathname for route params
      // If your URL structure is like: /feedback/classId/studentId
      // const pathParts = window.location.pathname.split('/');
      // const classIdFromUrl = pathParts[2]; // Adjust index based on your route structure
      // const studentIdFromUrl = pathParts[3];

      console.log('Current URL:', window.location.href);
      console.log('class ID:', classIdFromUrl);
      console.log('Student ID:', studentIdFromUrl);
    }
  }, []);

  // Fetch feedback data from API
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!classId || !studentId) {
        setError('Missing required parameters: classId and studentId');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/Api/singleFeedback/Music?classId=${classId}&userId=${studentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: FeedbackResponse = await response.json();

        if (result.success) {
          setFeedbackData(result.data || []);
        } else {
          setError('Failed to fetch feedback data');
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching feedback');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when we have both IDs
    if (classId && studentId) {
      fetchFeedback();
    }
  }, [classId, studentId]);

  const handleBack = () => {
    // Handle back navigation
    window.history.back();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading feedback...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-orange-600 mb-8">Student Feedback</h1>
        
        {feedbackData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No feedback data available.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbackData.map((feedback) => (
              <div key={feedback._id} className="bg-white rounded-lg shadow-sm border">
                {/* Student Info Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-orange-600">
                        {feedback.userId.name}
                      </h2>
                      <p className="text-gray-600">{feedback.userId.email}</p>
                      <p className="text-sm text-gray-500">{feedback.classId.className}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatDate(feedback.createdAt)}
                      </p>
                      
                    </div>
                  </div>
                </div>

                {/* Feedback Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rhythm */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">Rhythm</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.rhythm || 'No feedback provided'}
                      </p>
                    </div>

                    {/* Theoretical Understanding */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">
                        Theoretical Understanding
                      </h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.theoreticalUnderstanding || 'No feedback provided'}
                      </p>
                    </div>

                    {/* Performance */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">Performance</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.performance || 'No feedback provided'}
                      </p>
                    </div>

                    {/* Ear Training */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">Ear Training</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.earTraining || 'No feedback provided'}
                      </p>
                    </div>

                    {/* Assignment */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">Assignment</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.assignment || 'No feedback provided'}
                      </p>
                    </div>

                    {/* Technique */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">Technique</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.technique || 'No feedback provided'}
                      </p>
                    </div>
                  </div>

                  {/* Personal Feedback - Full Width */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-orange-600 mb-2">
                      Personal Feedback
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-md">
                      {feedback.personalFeedback || 'No personal feedback provided'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;