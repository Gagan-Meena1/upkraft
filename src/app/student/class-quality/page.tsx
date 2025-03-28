"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft } from 'lucide-react';


// Define the type for session data
interface SessionData {
  sessionNo: number;
  score: number;
  summary: string;
}

const SessionSummaryTable: React.FC = () => {
    const router = useRouter();

  // Sample data with original fields
  const sessionData: SessionData[] = [
    { 
      sessionNo: 1, 
      score: 85, 
      summary: "Initial session with good performance and steady progress." 
    },
    { 
      sessionNo: 2, 
      score: 92, 
      summary: "Significant improvement in problem-solving skills." 
    },
    { 
      sessionNo: 3, 
      score: 88, 
      summary: "Consistent performance with minor areas for improvement." 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 to-gray-100 p-6">
        {/* Add this block */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => router.push('/student')}
          className="hover:bg-gray-100 text-orange-500 font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Student Dashboard
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="text-gray-800" size={20} />
            <h3 className="text-lg font-bold text-gray-800">Session Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-100 border-b border-blue-200">
                  <th className="p-3 text-left border-r border-blue-200 text-gray-800 font-bold">Session No</th>
                  <th className="p-3 text-left border-r border-blue-200 text-gray-800 font-bold">Score</th>
                  <th className="p-3 text-left text-gray-800 font-bold">Summary</th>
                </tr>
              </thead>
              <tbody>
                {sessionData.map((session) => (
                  <tr 
                    key={session.sessionNo} 
                    className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                  >
                    <td className="p-3 border-r border-gray-200 text-blue-900">{session.sessionNo}</td>
                    <td className="p-3 border-r border-gray-200 text-blue-900">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div 
                            className={`h-full ${
                              session.score >= 90 ? 'bg-green-500' : 
                              session.score >= 80 ? 'bg-blue-500' : 
                              session.score >= 70 ? 'bg-yellow-500' : 
                              session.score >= 60 ? 'bg-orange-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${session.score}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold ${
                          session.score >= 90 ? 'text-green-700' : 
                          session.score >= 80 ? 'text-blue-700' : 
                          session.score >= 70 ? 'text-yellow-700' : 
                          session.score >= 60 ? 'text-orange-700' : 'text-red-700'
                        }`}>
                          {session.score}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-blue-900">{session.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryTable;