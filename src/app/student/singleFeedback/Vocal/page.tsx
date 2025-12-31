"use client"
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Modal } from 'react-bootstrap';
import { RateClassForm } from '@/student/rateClass'; // Adjust path if needed

interface VocalFeedbackData {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  classId: {
    _id: string;
    className: string;
  };
  vocalTechniqueAndControl: string;
  toneQualityAndRange: string;
  rhythmTimingAndMusicality: string;
  dictionAndArticulation: string;
  expressionAndPerformance: string;
  progressAndPracticeHabits: string;
  personalFeedback: string;
  createdAt: string;
  updatedAt: string;
}

interface VocalFeedbackResponse {
  success: boolean;
  count: number;
  data: VocalFeedbackData[];
}

const VocalFeedbackPage = () => {
  const [feedbackData, setFeedbackData] = useState<VocalFeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  // Modal state
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const classIdFromUrl = urlParams.get('classId');
      const studentIdFromUrl = urlParams.get('studentId');
      setClassId(classIdFromUrl);
      setStudentId(studentIdFromUrl);
    }
  }, []);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!classId || !studentId) {
        setError('Missing required parameters: classId and studentId');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`/Api/singleFeedback/vocal?classId=${classId}&studentId=${studentId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result: VocalFeedbackResponse = await response.json();
        if (result.success) setFeedbackData(result.data || []);
        else setError('Failed to fetch feedback data');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching feedback');
      } finally {
        setLoading(false);
      }
    };
    if (classId && studentId) fetchFeedback();
  }, [classId, studentId]);

  const handleBack = () => window.history.back();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading vocal feedback...</div>
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
        <h1 className="text-3xl font-bold text-orange-600 mb-8">Vocal Student Feedback</h1>
        
        {feedbackData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No vocal feedback data available.</p>
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
                    {/* Vocal Technique and Control */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">Vocal Technique & Control</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.vocalTechniqueAndControl || 'No feedback provided'}
                      </p>
                    </div>
                    {/* Tone Quality and Range */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">Tone Quality & Range</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.toneQualityAndRange || 'No feedback provided'}
                      </p>
                    </div>
                    {/* Rhythm, Timing and Musicality */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">Rhythm, Timing & Musicality</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.rhythmTimingAndMusicality || 'No feedback provided'}
                      </p>
                    </div>
                    {/* Diction and Articulation */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">Diction & Articulation</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.dictionAndArticulation || 'No feedback provided'}
                      </p>
                    </div>
                    {/* Expression and Performance */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">Expression & Performance</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.expressionAndPerformance || 'No feedback provided'}
                      </p>
                    </div>
                    {/* Progress and Practice Habits */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">Progress & Practice Habits</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {feedback.progressAndPracticeHabits || 'No feedback provided'}
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
                    <button 
                      className="btn btn-primary mt-3"
                      onClick={() => {
                        setSelectedClassId(feedback.classId._id);
                        setShowRateModal(true);
                      }}
                    >
                      Give Rating
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal show={showRateModal} onHide={() => setShowRateModal(false)} centered>
        <Modal.Header closeButton />
        <Modal.Body>
          <RateClassForm 
            classId={selectedClassId} 
            isModal={true} 
            onSuccess={() => setShowRateModal(false)}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VocalFeedbackPage;