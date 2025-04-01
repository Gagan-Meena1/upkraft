"use client"

import { useState, useEffect } from "react";
import axios from "axios";

interface Student {
  _id: string;
  username: string;
  email: string;
  contact: string;
}

interface FeedbackData {
  studentId: string;
  attendance: number;
  rhythm: number;
  theoreticalUnderstanding: number;
  performance: number;
  earTraining: number;
  assignment: number;
  technique: number;
}

export default function StudentFeedbackPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    studentId: "",
    attendance: 5,
    rhythm: 5,
    theoreticalUnderstanding: 5,
    performance: 5,
    earTraining: 5,
    assignment: 5,
    technique: 5
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Get the query parameters from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const classId = urlParams.get('classId');
        const courseId = urlParams.get('courseId');
        
        // Make sure both parameters exist
        if (!classId || !courseId) {
          console.error("Missing required parameters");
          return;
        }
        const response = await axios.get(`/Api/courseStudent?classId=${classId}&courseId=${courseId}`);
        setStudents(response.data.filteredUsers || []);
      } catch (error:any) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const openFeedbackModal = (student: Student) => {
    setSelectedStudent(student);
    setFeedback({
      studentId: student._id,
      attendance: 5,
      rhythm: 5,
      theoreticalUnderstanding: 5,
      performance: 5,
      earTraining: 5,
      assignment: 5,
      technique: 5
    });
    setFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSliderChange = (field: keyof Omit<FeedbackData, 'studentId'>, value: number) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const submitFeedback = async () => {
    setSubmitting(true);
    try {
      await axios.post("Api/feedback/studentFeedback", feedback);
      setSuccessMessage(`Feedback for ${selectedStudent?.username} submitted successfully!`);
      setTimeout(() => {
        setSuccessMessage("");
        closeFeedbackModal();
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const feedbackCategories = [
    { key: 'attendance' as const, label: 'Attendance' },
    { key: 'rhythm' as const, label: 'Rhythm' },
    { key: 'theoreticalUnderstanding' as const, label: 'Theoretical Understanding of Topic' },
    { key: 'performance' as const, label: 'Performance/Demonstration' },
    { key: 'earTraining' as const, label: 'Ear Training' },
    { key: 'assignment' as const, label: 'Assignment' },
    { key: 'technique' as const, label: 'Technique' }
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900">
      {/* Navigation */}
      <nav className="w-full py-6 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div className="font-extrabold text-2xl text-gray-800">UPKRAFT</div>
        <div className="text-xl font-semibold text-orange-600">Student Feedback</div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-full mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Students</h1>
        <p className="text-gray-600 mb-8">Provide feedback for your students by clicking on the feedback button.</p>
        
        {loading ? (
          <div className="w-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-100 py-3 px-6 font-medium text-gray-700">
              <div>Student</div>
              <div>Email</div>
              <div>Contact</div>
              <div className="text-right">Action</div>
            </div>
            
            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {students.map((student) => (
                <div key={student._id} className="grid grid-cols-4 py-4 px-6 items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                      {student.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-3 font-medium">{student.username}</span>
                  </div>
                  <div className="text-gray-600">{student.email}</div>
                  <div className="text-gray-600">{student.contact}</div>
                  <div className="text-right">
                    <button
                      onClick={() => openFeedbackModal(student)}
                      className="px-4 py-2 bg-gray-900 text-gray-50 font-medium rounded-lg hover:bg-gray-800 transition"
                    >
                      Provide Feedback
                    </button>
                  </div>
                </div>
              ))}
              
              {students.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No students found for this class and course.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Feedback for {selectedStudent.username}
                </h2>
                <button
                  onClick={closeFeedbackModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {successMessage ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                  {successMessage}
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    Rate the student's performance in each category using the sliders below (1-10).
                  </p>
                  
                  <div className="space-y-6">
                    {feedbackCategories.map((category) => (
                      <div key={category.key} className="space-y-2">
                        <div className="flex justify-between">
                          <label className="font-medium text-gray-700">{category.label}</label>
                          <span className="text-gray-900 font-bold">{feedback[category.key]}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feedback[category.key]}
                          onChange={(e) => handleSliderChange(category.key, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1</span>
                          <span>10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <button
                      onClick={submitFeedback}
                      disabled={submitting}
                      className="w-full px-6 py-3 bg-gray-900 text-gray-50 font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        "Submit Feedback"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-gray-50 py-8 px-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          © 2025 UPKRAFT. All rights reserved.
        </div>
      </footer>
    </div>
  );
}