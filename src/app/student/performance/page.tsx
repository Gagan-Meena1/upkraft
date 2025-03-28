"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Book, 
  Clock, 
  BarChart2,
  Award
} from 'lucide-react';

// Performance data interface
interface PerformanceCourse {
  id: string;
  name: string;
  instructor: string;
  overallScore: number;
  progress: number;
}

// Example performance data
const performanceData: PerformanceCourse[] = [
  {
    id: '1',
    name: 'Web Development Bootcamp',
    instructor: 'Michael Chen',
    overallScore: 85,
    progress: 70
  },
  {
    id: '2',
    name: 'Data Science Masterclass',
    instructor: 'Dr. Sarah Johnson',
    overallScore: 92,
    progress: 85
  }
];

export default function StudentPerformanceOverview() {
  const router = useRouter();

  const calculatePerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 to-gray-100 p-6">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-orange-500">Performance Overview</h1>
        <button 
          onClick={() => router.push('/student')}
          className="hover:bg-gray-100 text-orange-500 font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Performance Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {performanceData.map((course) => (
          <div 
            key={course.id} 
            className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105"
          >
            {/* Course Performance Header */}
            <div className="p-6 bg-gray-500 text-black flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{course.name}</h2>
                <p className="text-black">{course.instructor}</p>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="p-6 space-y-4 bg-blue-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Award className="text-blue-500" size={20} />
                  <span>
                    Overall Score: 
                    <span className={`ml-2 px-2 py-1 rounded ${calculatePerformanceColor(course.overallScore)}`}>
                      {course.overallScore}%
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <BarChart2 className="text-blue-500" size={20} />
                  <span>Progress: {course.progress}%</span>
                </div>
              </div>

              {/* Performance Details Button */}
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => router.push(`/student/performance/${course.id}`)}
                  className="bg-green-500 text-black px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FileText size={16} />
                  Performance Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}