"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft,ChevronLeft } from 'lucide-react';

interface FeedbackFormData {
  // attendance: number;
  classDuration: number,
    sessionFocusAreaStatedClearly: number,
    ContentDeliveredAligningToDriveSessionFocusArea: number,
    studentEngagement: number,
    studentPracticallyDemonstratedProgressOnConcept: number,
    tutorCommunicationTonality: number,
    KeyPerformance: number,
    personalFeedback: string
}


const StudentFeedbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutorId, setTutorId] = useState<string | undefined>();
  const [classId, setClassId] = useState<string | undefined>();
  const [courseId, setCourseId] = useState<string | undefined>();
  
  const [feedbackData, setFeedbackData] = useState<FeedbackFormData>({
    // attendance: 5,
    classDuration: 5,
    sessionFocusAreaStatedClearly: 5,
    ContentDeliveredAligningToDriveSessionFocusArea: 5,
    studentEngagement: 5,
    studentPracticallyDemonstratedProgressOnConcept: 5,
    tutorCommunicationTonality: 5,
    KeyPerformance: 5,
    personalFeedback: ''
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Get query parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const tutorIdurl = urlParams.get('tutorId');
        const courseIdurl = urlParams.get('courseId');
        const classIdurl = urlParams.get('classId');
        setTutorId(tutorIdurl);
        setClassId(classIdurl);
        setCourseId(courseIdurl);
        // Check if required parameters exist
        if (!tutorId || !courseId || !classId) {
          setError('Missing required parameters: tutorId, courseId, or classId');
          setLoading(false);
          return;
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
    personalFeedback: e.target.value  // Changed from 'feedback' to 'personalFeedback'
  }));
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set submitting state to true to disable the button
    setIsSubmitting(true);
    
    try {
      // Add your submission logic here
      console.log('Submitting feedback:', {
    
        ...feedbackData
      });
      
      // Example submission code:
      const response = await fetch(`/Api/admin/classQuality?tutorId=${tutorId}&courseId=${courseId}&classId=${classId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        
          ...feedbackData
        })
      });
      
      // Add a small delay to simulate processing (optional)
      await new Promise(resolve => setTimeout(resolve, 500));
       // Check if the request was successful
    const result = await response.json();
    
    if (result.success) {
      // Navigate to the course details page after submission
      window.location.href = `/admin/tutors/classQuality/${courseId}?tutorId=${tutorId}`;
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

  

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0 m-0 mt-0 pt-0">
      <div className="w-full px-0 p-0 m-0">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md">
      <div className="max-w-7xl mx-auto  sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
        <Link 
          href={`/admin/tutors/classQuality/${courseId}?tutorId=${tutorId}`} 
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="text-white h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Tutor Engagement</h1>
          <p className="text-white/80 text-sm mt-1">Provide detailed feedback on the tutor's participation and engagement</p>
        </div>
      </div>
    </div>
          
          <div className="p-6">
            {/* Student & Course Info */}
            
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* studentEngagement Metrics */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Attendance */}
             
                  
                  {/* classDuration */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Class Duration</label>
                      <span className="text-orange-500 font-medium">{feedbackData.classDuration}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.classDuration}
                      onChange={(e) => handleSliderChange('classDuration', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* sessionFocusAreaStatedClearly */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Session Focus Area Stated Clearly </label>
                      <span className="text-orange-500 font-medium">{feedbackData.sessionFocusAreaStatedClearly}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.sessionFocusAreaStatedClearly}
                      onChange={(e) => handleSliderChange('sessionFocusAreaStatedClearly', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* ContentDeliveredAligningToDriveSessionFocusArea */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Content Delivered Aligning To Drive Session Focus Area </label>
                      <span className="text-orange-500 font-medium">{feedbackData.ContentDeliveredAligningToDriveSessionFocusArea}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.ContentDeliveredAligningToDriveSessionFocusArea}
                      onChange={(e) => handleSliderChange('ContentDeliveredAligningToDriveSessionFocusArea', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* studentEngagement */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Student Engagement</label>
                      <span className="text-orange-500 font-medium">{feedbackData.studentEngagement}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.studentEngagement}
                      onChange={(e) => handleSliderChange('studentEngagement', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* Ear Training */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Student Practically Demonstrated Progress On Concept</label>
                      <span className="text-orange-500 font-medium">{feedbackData.studentPracticallyDemonstratedProgressOnConcept}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.studentPracticallyDemonstratedProgressOnConcept}
                      onChange={(e) => handleSliderChange('studentPracticallyDemonstratedProgressOnConcept', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* tutorCommunicationTonality */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Tutor Communication Tonality</label>
                      <span className="text-orange-500 font-med     ium">{feedbackData.tutorCommunicationTonality}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.tutorCommunicationTonality}
                      onChange={(e) => handleSliderChange('tutorCommunicationTonality', e)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* KeyPerformance */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700">Key Performance</label>
                      <span className="text-orange-500 font-medium">{feedbackData.KeyPerformance}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={feedbackData.KeyPerformance}
                      onChange={(e) => handleSliderChange('KeyPerformance', e)}
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
                    value={feedbackData.personalFeedback}
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