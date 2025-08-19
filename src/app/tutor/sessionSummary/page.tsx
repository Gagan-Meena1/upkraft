"use client"
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Send } from 'lucide-react';

interface SessionData {
  _id: string;
  title: string;
  date: string;
  performanceScore: number;
  sessionQualityScore: number;
  tutorCRAT: string;
  assignmentCompletionRate: number;
  tutorFeedback: string;
}

const SessionSummaryPage = () => {
  const [sessionData, setSessionData] = useState<SessionData[]>([
    {
      _id: '1',
      title: 'Keys & Notes Discovery',
      date: '12 Aug 2025',
      performanceScore: 5.6,
      sessionQualityScore: 5.6,
      tutorCRAT: 'Beginner',
      assignmentCompletionRate: 70,
      tutorFeedback: 'Open chords, strumming patterns'
    },
    {
      _id: '2',
      title: 'Basic Finger Exercises',
      date: 'The Beatles',
      performanceScore: 5.6,
      sessionQualityScore: 5.6,
      tutorCRAT: 'Beginner',
      assignmentCompletionRate: 80,
      tutorFeedback: 'I-IV-V progressions, block chords'
    },
    {
      _id: '3',
      title: 'Introduction to Scales',
      date: 'The Beatles',
      performanceScore: 5.6,
      sessionQualityScore: 5.6,
      tutorCRAT: 'Intermediate',
      assignmentCompletionRate: 90,
      tutorFeedback: 'Simple chord patterns, singalong'
    },
    {
      _id: '4',
      title: 'Simple Melodies',
      date: 'Bob Dylan',
      performanceScore: 5.6,
      sessionQualityScore: 5.6,
      tutorCRAT: 'Beginner',
      assignmentCompletionRate: 70,
      tutorFeedback: 'Fingerstyle, position shifts'
    },
    {
      _id: '5',
      title: 'Chords & Progressions',
      date: 'Leonard Cohen',
      performanceScore: 5.6,
      sessionQualityScore: 5.6,
      tutorCRAT: 'Intermediate',
      assignmentCompletionRate: 60,
      tutorFeedback: 'G-D-Am7-C loop'
    }
  ]);

  const [loading, setLoading] = useState(false);

  const handleNotify = (sessionId: string, feedback: string) => {
    // Handle notification logic here
    console.log(`Notifying about session ${sessionId}: ${feedback}`);
  };

  const getCRATColor = (crat: string) => {
    switch (crat.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Summary</h1>
          <p className="text-gray-600">Comprehensive overview of student performance across all sessions</p>
        </div>

        {/* Session Summary Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Session Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Performance Score</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Session Quality Score</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Tutor CRAT</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Assignment Completion Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tutor Feedback / Remarks</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessionData.map((session, index) => (
                  <tr key={session._id} className="hover:bg-gray-50 transition-colors">
                    {/* Session Title */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{session.title}</div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{session.date}</div>
                    </td>

                    {/* Performance Score */}
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900">
                        <span className="text-lg font-bold text-purple-600">{session.performanceScore}</span>
                        <span className="text-gray-500">/10</span>
                      </div>
                    </td>

                    {/* Session Quality Score */}
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900">
                        <span className="text-lg font-bold text-purple-600">{session.sessionQualityScore}</span>
                        <span className="text-gray-500">/10</span>
                      </div>
                    </td>

                    {/* Tutor CRAT */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getCRATColor(session.tutorCRAT)}`}>
                        {session.tutorCRAT}
                      </span>
                    </td>

                    {/* Assignment Completion Rate */}
                    <td className="px-6 py-4 text-center">
                      <div className={`text-lg font-bold ${getCompletionColor(session.assignmentCompletionRate)}`}>
                        {session.assignmentCompletionRate}%
                      </div>
                    </td>

                    {/* Tutor Feedback */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs">
                        {session.tutorFeedback}
                      </div>
                    </td>

                    {/* Action - Notify Button */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleNotify(session._id, session.tutorFeedback)}
                        className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors gap-2"
                      >
                        <span>Notify</span>
                        <Send size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {(sessionData.reduce((sum, session) => sum + session.performanceScore, 0) / sessionData.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Average Performance Score</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {(sessionData.reduce((sum, session) => sum + session.sessionQualityScore, 0) / sessionData.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Average Quality Score</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(sessionData.reduce((sum, session) => sum + session.assignmentCompletionRate, 0) / sessionData.length)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Average Completion Rate</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{sessionData.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Sessions</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-end">
          <button className="inline-flex items-center border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors gap-2">
            <span>Export Report</span>
            <ArrowUpRight size={16} />
          </button>
          
          <button className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors gap-2">
            <span>Send Summary to Student</span>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryPage;