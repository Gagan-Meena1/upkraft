"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface StudentData {
  success: boolean;
  message: string;
  studentId: string;
  username: string;
  email: string;
  courses: {
    _id: string;
    title: string;
    description?: string;
    curriculum: Array<{
      sessionNo: string;
      topic: string;
      tangibleOutcome: string;
      _id: string;
    }>;
    [key: string]: any;
  };
  class: {
    _id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    [key: string]: any;
  };
}

interface FeedbackFormData {
  // attendance: number;
  rhythm: number;
  theoretical: number;
  understanding: number;
  performance: number;
  earTraining: number;
  assignment: number;
  technique: number;
  feedback: string;
}

const StudentFeedbackPage = () => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [feedbackData, setFeedbackData] = useState<FeedbackFormData>({
    // attendance: 5,
    rhythm: 5,
    theoretical: 5,
    understanding: 5,
    performance: 5,
    earTraining: 5,
    assignment: 5,
    technique: 5,
    feedback: ''
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Get query parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const studentId = urlParams.get('studentId');
        const courseId = urlParams.get('courseId');
        const classId = urlParams.get('classId');
        
        // Check if required parameters exist
        if (!studentId || !courseId || !classId) {
          setError('Missing required parameters: studentId, courseId, or classId');
          setLoading(false);
          return;
        }
        
        // Construct the API URL with query parameters
        const apiUrl = `/Api/singleStudentFeedback?studentId=${studentId}&courseId=${courseId}&classId=${classId}`;
        
        // Make the API call
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success) {
          setStudentData(data);
        } else {
          setError('Failed to load student data');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchStudentData();
  }, []);

  const handleSliderChange = (field: keyof FeedbackFormData, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setFeedbackData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedbackData(prev => ({
      ...prev,
      feedback: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set submitting state to true to disable the button
    setIsSubmitting(true);
    
    try {
      // Add your submission logic here
      console.log('Submitting feedback:', {
        studentId: studentData?.studentId,
        courseId: studentData?.courses?._id,
        classId: studentData?.class?._id,
        ...feedbackData
      });
      
      // Example submission code:
      const response = await fetch(`/Api/studentFeedback?studentId=${studentData?.studentId}&courseId=${studentData?.courses._id}&classId=${studentData?.class._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentData?.studentId,
          courseId: studentData?.courses?._id,
          classId: studentData?.class?._id,
          ...feedbackData
        })
      });
      
      // Add a small delay to simulate processing (optional)
      await new Promise(resolve => setTimeout(resolve, 500));
       // Check if the request was successful
    const result = await response.json();
    
    if (result.success) {
      // Navigate to the course details page after submission
      window.location.href = `/tutor/courseDetailsForFeedback/${studentData?.courses._id}?studentId=${studentData?.studentId}`;
    } else {
      // Handle API error
      throw new Error(result.message || 'Failed to submit feedback');
    }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // If there's an error, re-enable the button
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading student data...</p>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-md">
          <p className="text-red-500">{error || 'Failed to load student data'}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0 m-0 mt-0 pt-0">
      <div className="w-full px-0 p-0 m-0">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-400 text-white p-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">Student Performance Evaluation</h1>
              
              <Link 
                href={`/tutor/courseDetailsForFeedback/${studentData.courses._id}?studentId=${studentData.studentId}`}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center text-sm"
              >
                <ArrowLeft className="mr-1" size={16} />
                Back to Course
              </Link>
            </div>
            <p className="text-white/80">Provide feedback on student's performance</p>
          </div>
          
          <div className="p-6">
            {/* Student & Course Info */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-orange-500">Student</h3>
                  <p className="text-gray-700 font-medium text-lg">{studentData.username}</p>
                  <p className="text-gray-500 text-sm">{studentData.email}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-orange-500">Course</h3>
                  <p className="text-gray-700 font-medium text-lg">{studentData.courses.title}</p>
                  <p className="text-gray-500 text-sm">{studentData.courses.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-orange-500">Class</h3>
                <p className="text-gray-700 font-medium text-lg">{studentData.class.title}</p>
                <p className="text-gray-500 text-sm">{studentData.class.description}</p>
                <p className="text-gray-600 text-xs mt-1">
                  {formatDate(studentData.class.startTime)} - {formatDate(studentData.class.endTime)}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Attendance */}
             
                  
                  {/* Rhythm */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Rhythm</label>
                      <span className="text-orange-500 font-medium">{feedbackData.rhythm}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.rhythm}
                      onChange={(e) => handleSliderChange('rhythm', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* Theoretical */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Theoretical Knowledge</label>
                      <span className="text-orange-500 font-medium">{feedbackData.theoretical}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.theoretical}
                      onChange={(e) => handleSliderChange('theoretical', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* Understanding */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Understanding of Topic</label>
                      <span className="text-orange-500 font-medium">{feedbackData.understanding}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.understanding}
                      onChange={(e) => handleSliderChange('understanding', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* Performance */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Performance</label>
                      <span className="text-orange-500 font-medium">{feedbackData.performance}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.performance}
                      onChange={(e) => handleSliderChange('performance', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* Ear Training */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Ear Training</label>
                      <span className="text-orange-500 font-medium">{feedbackData.earTraining}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.earTraining}
                      onChange={(e) => handleSliderChange('earTraining', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* Assignment */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Assignment</label>
                      <span className="text-orange-500 font-med     ium">{feedbackData.assignment}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.assignment}
                      onChange={(e) => handleSliderChange('assignment', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* Technique */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Technique</label>
                      <span className="text-orange-500 font-medium">{feedbackData.technique}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.technique}
                      onChange={(e) => handleSliderChange('technique', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
                
                {/* Personal Feedback */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Personal Feedback & Areas for Improvement</label>
                  <textarea 
                    placeholder="Provide detailed feedback and suggestions for improvement..." 
                    className="w-full min-h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                    value={feedbackData.feedback}
                    onChange={handleTextChange}
                  />
                </div>
                
                {/* Submit Button */}
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full py-2 px-4 ${isSubmitting ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'} text-white font-medium rounded-md transition-colors`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedbackPage;