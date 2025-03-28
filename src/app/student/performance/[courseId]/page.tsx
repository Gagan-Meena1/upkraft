"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  FileText, 
  Book, 
  Clock, 
  BarChart2,
  Award,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// New interface for class details
interface ClassDetail {
    classNo: number;
    tutorScore: number;
    tutorRemarks: string;
    recommendedImprovement: string;
  }
// Performance details interface
interface PerformanceDetails {
  id: string;
  name: string;
  instructor: string;
  overallScore: number;
  progress: number;
  attendance: number;
  totalClasses: number;
  topicsCovered: string[];
  recentScores: number[];
  classDetails: ClassDetail[];

}

// Mock performance details data (updated with class details)
const performanceDetailsData: { [key: string]: PerformanceDetails } = {
    '1': {
      id: '1',
      name: 'Web Development Bootcamp',
      instructor: 'Michael Chen',
      overallScore: 85,
      progress: 70,
      attendance: 28,
      totalClasses: 36,
      topicsCovered: [
        'HTML & CSS Fundamentals',
        'JavaScript Advanced Concepts',
        'React.js Components'
      ],
      recentScores: [88, 82, 90],
      classDetails: [
        {
          classNo: 1,
          tutorScore: 85,
          tutorRemarks: "Good understanding of basic concepts",
          recommendedImprovement: "Practice more complex JavaScript scenarios"
        },
        {
          classNo: 2,
          tutorScore: 88,
          tutorRemarks: "Showing improvement in React components",
          recommendedImprovement: "Focus on state management techniques"
        },
        {
          classNo: 3,
          tutorScore: 90,
          tutorRemarks: "Excellent problem-solving skills",
          recommendedImprovement: "Explore advanced design patterns"
        }
      ]
    },
    // ... rest of the existing code remains the same
  };

// Chart data preparation
const prepareBarChartData = (details: PerformanceDetails) => [
  { parameter: 'Overall Score', value: details.overallScore },
  { parameter: 'Progress', value: details.progress },
  { parameter: 'Attendance', value: (details.attendance / details.totalClasses) * 100 }
];

const preparePieChartData = (details: PerformanceDetails) => [
  { name: 'Recent Scores Avg', value: details.recentScores.reduce((a, b) => a + b, 0) / details.recentScores.length }
];

export default function StudentPerformanceDetails() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [mounted, setMounted] = useState(false);
  const [details, setDetails] = useState<PerformanceDetails | null>(null);

  useEffect(() => {
    setMounted(true);
    // Simulate data fetching (in real app, this would be an actual API call)
    const courseDetails = performanceDetailsData[courseId];
    setDetails(courseDetails);
  }, [courseId]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const barChartData = useMemo(() => details ? prepareBarChartData(details) : [], [details]);
  const pieChartData = useMemo(() => details ? preparePieChartData(details) : [], [details]);

  // Memoized chart rendering to prevent unnecessary re-renders
  const renderBarChart = useMemo(() => {
    if (!details) return null;
    return (
      <BarChart 
        width={500} 
        height={300} 
        data={barChartData}
        key="bar-chart"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="parameter" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8">
          {barChartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Bar>
      </BarChart>
    );
  }, [barChartData, COLORS, details]);

  const renderPieChart = useMemo(() => {
    if (!details) return null;
    return (
      <PieChart 
        width={500} 
        height={300}
        key="pie-chart"
      >
        <Pie
          data={pieChartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieChartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    );
  }, [pieChartData, COLORS, details]);

  if (!mounted || !details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-300 to-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading performance details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => router.push('/student/performance')}
          className="hover:bg-gray-100 text-orange-500 font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Performance Overview
        </button>
        <h1 className="text-4xl font-bold text-orange-500">Performance Details</h1>
      </div>

      {/* Performance Details Container */}
      <div className="bg-white shadow-lg rounded-xl p-6 space-y-6">
        {/* Course Header */}
        <div className="bg-gray-500 text-white p-4 rounded-lg">
          <h2 className="text-2xl font-bold">{details.name}</h2>
          <p>{details.instructor}</p>
        </div>

        {/* Performance Summary */}
        <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-gray-800" size={20} />
            <h3 className="font-bold text-gray-800">Overall Score</h3>
          </div>
          <p className={`text-2xl font-bold ${
            details.overallScore >= 90 ? 'text-green-700' : 
            details.overallScore >= 80 ? 'text-blue-700' : 
            details.overallScore >= 70 ? 'text-yellow-700' : 'text-red-700'
          }`}>
            {details.overallScore}%
          </p>
        </div>

        {/* Similar styling for other summary boxes */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-gray-800" size={20} />
            <h3 className="font-bold text-gray-800">Attendance</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {details.attendance}/{details.totalClasses} 
            <span className="text-sm text-gray-800 ml-2">
              ({Math.round((details.attendance / details.totalClasses) * 100)}%)
            </span>
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="text-gray-800" size={20} />
            <h3 className="font-bold text-gray-800">Progress</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">{details.progress}%</p>
        </div>
      </div>

        {/* Topics Covered */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Book className="text-gray-500" size={20} />
            <h3 className="text-lg font-bold text-gray-700">Topics Covered</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {details.topicsCovered.map((topic, index) => (
              <span 
                key={index} 
                className="bg-blue-100 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>


         {/* Class Details Table */}
        {/* Class Details Table */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="text-gray-800" size={20} />
          <h3 className="text-lg font-bold text-gray-800">Class Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-100 border-b border-blue-200">
                <th className="p-3 text-left border-r border-blue-200 text-gray-800 font-bold">Class No</th>
                <th className="p-3 text-left border-r border-blue-200 text-gray-800 font-bold">Tutor Score</th>
                <th className="p-3 text-left border-r border-blue-200 text-gray-800 font-bold">Tutor Remarks</th>
                <th className="p-3 text-left text-gray-800 font-bold">Recommended Improvement</th>
              </tr>
            </thead>
            <tbody>
              {details.classDetails.map((classDetail) => (
                <tr 
                  key={classDetail.classNo} 
                  className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                >
                  <td className="p-3 border-r border-gray-200 text-blue-900">{classDetail.classNo}</td>
                  <td className="p-3 border-r border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div 
                          className={`h-full ${
                            classDetail.tutorScore >= 90 ? 'bg-green-500' : 
                            classDetail.tutorScore >= 80 ? 'bg-blue-500' : 
                            classDetail.tutorScore >= 70 ? 'bg-yellow-500' : 
                            classDetail.tutorScore >= 60 ? 'bg-orange-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${classDetail.tutorScore}%` }}
                        ></div>
                      </div>
                      <span className={`font-bold ${
                        classDetail.tutorScore >= 90 ? 'text-green-700' : 
                        classDetail.tutorScore >= 80 ? 'text-blue-700' : 
                        classDetail.tutorScore >= 70 ? 'text-yellow-700' : 
                        classDetail.tutorScore >= 60 ? 'text-orange-700' : 'text-red-700'
                      }`}>
                        {classDetail.tutorScore}%
                      </span>
                      <span className={`font-semibold text-sm ${
                        classDetail.tutorScore >= 90 ? 'text-green-800' : 
                        classDetail.tutorScore >= 80 ? 'text-gray-800' : 
                        classDetail.tutorScore >= 70 ? 'text-yellow-800' : 
                        classDetail.tutorScore >= 60 ? 'text-orange-800' : 'text-red-800'
                      }`}>
                        {classDetail.tutorScore >= 90 ? 'A' : 
                         classDetail.tutorScore >= 80 ? 'B' : 
                         classDetail.tutorScore >= 70 ? 'C' : 
                         classDetail.tutorScore >= 60 ? 'D' : 'F'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 border-r border-gray-200 text-blue-900">{classDetail.tutorRemarks}</td>
                  <td className="p-3 text-blue-900">{classDetail.recommendedImprovement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Performance Breakdown</h3>
            {renderBarChart}
          </div>

          {/* Pie Chart */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Recent Scores Distribution</h3>
            {renderPieChart}
          </div>
        </div>
      </div>
    </div>
  );
}