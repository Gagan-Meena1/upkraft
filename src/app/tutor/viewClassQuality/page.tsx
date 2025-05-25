'use client';
import dynamic from 'next/dynamic';

// Create a non-SSR version of the component
const ClassQualityDashboardClient = dynamic(
  () => Promise.resolve(ClassQualityDashboard),
  { ssr: false }
);

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';

interface ClassQualityItem {
  _id: string;
  classDuration: string;
  sessionFocusAreaStatedClearly: string;
  instructorId: string;
  class: string;
  ContentDeliveredAligningToDriveSessionFocusArea: string;
  studentEngagement: string;
  studentPracticallyDemonstratedProgressOnConcept: string;
  KeyPerformance: string;
  tutorCommunicationTonality: string;
  personalFeedback: string;
  createdAt: string;
  updatedAt: string;
}

interface ClassInfo {
  sessionNo: number;
  classDuration: number;
  sessionFocusAreaStatedClearly: number;
  contentDelivered: number;
  studentEngagement: number;
  studentProgress: number;
  keyPerformance: number;
  tutorCommunication: number;
  personalFeedback: string;
  averageScore: number;
  performanceLevel: 'good' | 'medium' | 'poor';
  recommendedImprovement: string;
}

const ClassQualityDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const tutorId = searchParams.get('tutorId');

  const [feedbackData, setFeedbackData] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [averageSkillScores, setAverageSkillScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!courseId ) {
        setError('Course ID and Tutor ID are required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/Api/admin/classQuality?courseId=${courseId}&tutorId=${tutorId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch class quality data');
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch class quality data');
        }

        // Process the data - group by class, keeping only the latest feedback for each
        const groupedByClassId: Record<string, ClassQualityItem> = result.data.reduce((acc: Record<string, ClassQualityItem>, item: ClassQualityItem) => {
          // If this is the first entry for this classId, add it
          if (!acc[item.class]) {
            acc[item.class] = item;
          } 
          // If we already have an entry for this classId, compare dates and keep the newest one
          else {
            const existingDate = new Date(acc[item.class].createdAt);
            const newDate = new Date(item.createdAt);
            
            if (newDate > existingDate) {
              acc[item.class] = item;
            }
          }
          return acc;
        }, {});

        // Process the data
        const processedData: ClassInfo[] = Object.values(groupedByClassId).map((item: ClassQualityItem, index: number) => {
          // Parse string values to numbers
          const classDuration = typeof item.classDuration === 'string' ? parseFloat(item.classDuration) : item.classDuration;
          const sessionFocusAreaStatedClearly = typeof item.sessionFocusAreaStatedClearly === 'string' ? 
            parseFloat(item.sessionFocusAreaStatedClearly) : item.sessionFocusAreaStatedClearly;
          const contentDelivered = typeof item.ContentDeliveredAligningToDriveSessionFocusArea === 'string' ? 
            parseFloat(item.ContentDeliveredAligningToDriveSessionFocusArea) : item.ContentDeliveredAligningToDriveSessionFocusArea;
          const studentEngagement = typeof item.studentEngagement === 'string' ? 
            parseFloat(item.studentEngagement) : item.studentEngagement;
          const studentProgress = typeof item.studentPracticallyDemonstratedProgressOnConcept === 'string' ? 
            parseFloat(item.studentPracticallyDemonstratedProgressOnConcept) : item.studentPracticallyDemonstratedProgressOnConcept;
          const keyPerformance = typeof item.KeyPerformance === 'string' ? 
            parseFloat(item.KeyPerformance) : item.KeyPerformance;
          const tutorCommunication = typeof item.tutorCommunicationTonality === 'string' ? 
            parseFloat(item.tutorCommunicationTonality) : item.tutorCommunicationTonality;
          
          // Calculate average score
          // Define weights for each category (in decimal form)
          const focusAreaWeight = 0.15;       // 15%
          const contentWeight = 0.20;         // 20%
          const engagementWeight = 0.15;      // 15%
          const progressWeight = 0.20;        // 20%
          const performanceWeight = 0.20;     // 20%
          const communicationWeight = 0.10;   // 10%

          // Calculate weighted score by multiplying each score by its weight
          const weightedScore = 
              (sessionFocusAreaStatedClearly * focusAreaWeight) +
              (contentDelivered * contentWeight) +
              (studentEngagement * engagementWeight) +
              (studentProgress * progressWeight) +
              (keyPerformance * performanceWeight) +
              (tutorCommunication * communicationWeight);

          // Store the weighted average score with 2 decimal places
          const averageScore = +weightedScore.toFixed(2);
          
          // Determine performance level - UPDATED FOR 10-POINT SCALE
          let performanceLevel: 'good' | 'medium' | 'poor';
          let recommendedImprovement = '';
          
          if (averageScore >= 8) {  // Changed from 4 to 8 for 10-point scale
            performanceLevel = 'good';
            recommendedImprovement = 'Continue with current methodology. Focus on refining advanced teaching techniques.';
          } else if (averageScore >= 6) {  // Changed from 3 to 6 for 10-point scale
            performanceLevel = 'medium';
            
            // Find the lowest scoring area
            const scores = {
              'session focus clarity': sessionFocusAreaStatedClearly,
              'content delivery': contentDelivered,
              'student engagement': studentEngagement,
              'student progress': studentProgress,
              'key performance': keyPerformance,
              'communication': tutorCommunication
            };
            
            const lowestArea = Object.entries(scores).reduce((a, b) => a[1] < b[1] ? a : b)[0];
            recommendedImprovement = `Work on improving your ${lowestArea}.`;
          } else {
            performanceLevel = 'poor';
            recommendedImprovement = 'Schedule additional training sessions. Focus on core teaching fundamentals.';
          }
          
          return {
            sessionNo: index + 1, // Assuming sessions are ordered in the API response
            classDuration: classDuration,
            sessionFocusAreaStatedClearly: sessionFocusAreaStatedClearly,
            contentDelivered: contentDelivered,
            studentEngagement: studentEngagement,
            studentProgress: studentProgress,
            keyPerformance: keyPerformance,
            tutorCommunication: tutorCommunication,
            personalFeedback: item.personalFeedback,
            averageScore,
            performanceLevel,
            recommendedImprovement
          };
        });
        
        // Sort by session number
        processedData.sort((a, b) => a.sessionNo - b.sessionNo);
        
        setFeedbackData(processedData);

        // Calculate average skills scores
        if (processedData.length > 0) {
          const skillTotals = {
            sessionFocusAreaStatedClearly: 0,
            contentDelivered: 0,
            studentEngagement: 0,
            studentProgress: 0,
            keyPerformance: 0,
            tutorCommunication: 0
          };
          
          processedData.forEach(session => {
            skillTotals.sessionFocusAreaStatedClearly += session.sessionFocusAreaStatedClearly;
            skillTotals.contentDelivered += session.contentDelivered;
            skillTotals.studentEngagement += session.studentEngagement;
            skillTotals.studentProgress += session.studentProgress;
            skillTotals.keyPerformance += session.keyPerformance;
            skillTotals.tutorCommunication += session.tutorCommunication;
          });
          
          const sessionCount = processedData.length;
          
          setAverageSkillScores({
            sessionFocusAreaStatedClearly: +(skillTotals.sessionFocusAreaStatedClearly / sessionCount).toFixed(2),
            contentDelivered: +(skillTotals.contentDelivered / sessionCount).toFixed(2),
            studentEngagement: +(skillTotals.studentEngagement / sessionCount).toFixed(2),
            studentProgress: +(skillTotals.studentProgress / sessionCount).toFixed(2),
            keyPerformance: +(skillTotals.keyPerformance / sessionCount).toFixed(2),
            tutorCommunication: +(skillTotals.tutorCommunication / sessionCount).toFixed(2)
          });
        }
        
        // Calculate overall performance score (average of all session averages)
        if (processedData.length > 0) {
          const overallScore = processedData.reduce((total, session) => total + session.averageScore, 0) / processedData.length;
          // Store with 2 decimal places
          setAverageSkillScores(prev => ({
            ...prev,
            overall: +overallScore.toFixed(2)
          }));
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeedbackData();
  }, [courseId, tutorId]);
    
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-orange-500 text-xl">Loading class quality data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (feedbackData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
          <button 
            onClick={() => router.back()} 
            className="mr-4 p-2 rounded-full bg-gray-200 hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="text-orange-500" size={24} />
          </button>
        <div className="text-gray-500 text-xl">No class quality data available for this course.</div>
      </div>
    );
  }

  // Get performance colors for the table
  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'good':
        return 'text-green-600';
      case 'medium':
        return 'text-orange-500';
      case 'poor':
        return 'text-red-500';
      default:
        return '';
    }
  };

  // Format score as percentage - UPDATED FOR 10-POINT SCALE
  const formatScore = (score: number) => {
    return `${(score * 10).toFixed(0)}%`;  // Changed from 20 to 10 for 10-point scale
  };

  // Define fields and their colors for individual graphs
  const fields = [
    { key: 'sessionFocusAreaStatedClearly', name: 'Session Focus Clarity', color: '#82ca9d' },
    { key: 'contentDelivered', name: 'Content Delivery', color: '#ff7300' },
    { key: 'studentEngagement', name: 'Student Engagement', color: '#ff4466' },
    { key: 'studentProgress', name: 'Student Progress', color: '#9467bd' },
    { key: 'keyPerformance', name: 'Key Performance', color: '#8c564b' },
    { key: 'tutorCommunication', name: 'Communication', color: '#e377c2' }
  ];

  // Function to get color based on score - UPDATED FOR 10-POINT SCALE
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4CAF50';  // Green for good - changed from 4 to 8
    if (score >= 6) return '#FF9800';  // Orange for medium - changed from 3 to 6
    return '#F44336';                  // Red for poor
  };

  // Custom active shape for gauge chart - UPDATED FOR 10-POINT SCALE
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill={getScoreColor(value)}>
          <tspan x={cx} dy="0" fontSize="24" fontWeight="bold">{value}</tspan>
          <tspan x={cx} dy="20" fontSize="12" fill="#666">/10</tspan>
        </text>
        <Sector
          cx={cx}
          cy={cy}
          startAngle={180}
          endAngle={0}
          innerRadius={outerRadius}
          outerRadius={outerRadius + 20}
          fill="#e0e0e0"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={180}
          endAngle={180 - (180 * value / 10)}
          innerRadius={outerRadius}
          outerRadius={outerRadius + 20}
          fill={getScoreColor(value)}
        />
        {/* Add a needle pointer */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + (outerRadius + 25) * Math.cos(Math.PI * (180 - (180 * value / 10)) / 180)}
          y2={cy - (outerRadius + 25) * Math.sin(Math.PI * (180 - (180 * value / 10)) / 180)}
          stroke={getScoreColor(value)}
          strokeWidth={3}
        />
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={getScoreColor(value)}
          stroke="none"
        />
        {/* Add tick marks for scale - UPDATED FOR 10-POINT SCALE */}
        <text x={cx - outerRadius + 15} y={cy - 1} textAnchor="end" fontSize="11" fill="#666">0</text>
        <text x={cx} y={cy - outerRadius + 20} textAnchor="middle" fontSize="11" fill="#666">5</text>
        <text x={cx + outerRadius - 25} y={cy} textAnchor="start" fontSize="11" fill="#666">10</text>
      </g>
    );
  };

  // Function to render gauge chart for average skill scores
  const renderGaugeChart = (field) => {
    const score = averageSkillScores[field.key] || 0;
    const data = [{ name: field.name, value: score }];
    
    return (
      <div key={field.key} className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">{field.name}</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={0}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={getScoreColor(score)} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-center">
          <span className={`font-medium ${getScoreColor(score) === '#4CAF50' ? 'text-green-600' : 
            getScoreColor(score) === '#FF9800' ? 'text-orange-500' : 'text-red-500'}`}>
            Average: {score}/10
          </span>
        </div>
      </div>
    );
  };

  // Function to render individual field graphs
  const renderFieldGraph = (field) => {
    return (
      <div key={field.key} className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{field.name}</h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={feedbackData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="sessionNo" 
                label={{ value: 'Session Number', position: 'insideBottom', offset: -5 }}
                padding={{ left: 10, right: 10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 10]}
                label={{ value: 'Score', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => [`${value}/10`, field.name]}
                separator=": "
                labelFormatter={(label) => `Session ${label}`}
                contentStyle={{ padding: '8px' }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: 10, paddingLeft: 75}}
                iconSize={10}
                iconType="circle"
                margin={{ top: 10 }}
              />
              
              {/* Score line */}
              <Line 
                type="monotone" 
                dataKey={field.key} 
                stroke={field.color} 
                name={field.name}
                strokeWidth={2}
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <div className="flex items-center mb-2">
          <button 
            onClick={() => router.back()} 
            className="mr-4 p-2 rounded-full bg-gray-200 hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="text-orange-500" size={24} />
          </button>
          <h1 className="text-3xl font-bold text-orange-500">Class Quality Dashboard</h1>
        </div>
        <p className="text-gray-600">Track class quality metrics across different sessions</p>
      </header>

      {/* Overall Course Performance */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Overall Class Quality</h2>
        
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
          {averageSkillScores.overall !== undefined && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Overall Quality Score</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={0}
                      activeShape={renderActiveShape}
                      data={[{ name: 'Overall', value: averageSkillScores.overall }]}
                      cx="50%"
                      cy="50%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={getScoreColor(averageSkillScores.overall)} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-lg font-bold">
                  <span className={`${getScoreColor(averageSkillScores.overall) === '#4CAF50' ? 'text-green-600' : 
                    getScoreColor(averageSkillScores.overall) === '#FF9800' ? 'text-orange-500' : 'text-red-500'}`}>
                    {averageSkillScores.overall}/10
                  </span>
                </p>
                <p className="text-gray-600 mt-2">
                  Average quality across all {feedbackData.length} session{feedbackData.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Scorometers section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Quality Metrics Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map(field => renderGaugeChart(field))}
        </div>
      </section>
      
      {/* Individual field graphs */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Individual Metrics Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map(field => renderFieldGraph(field))}
        </div>
      </section>
      
      {/* Feedback table section */}
      <section>
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Session Quality Summary</h2>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedbackData.map((session) => (
                  <tr key={session.sessionNo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {session.sessionNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.averageScore}/10
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${getPerformanceColor(session.performanceLevel)}`}>
                        {session.performanceLevel.charAt(0).toUpperCase() + session.performanceLevel.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {session.personalFeedback}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* Personal Feedback Section */}
      {feedbackData.length > 0 && feedbackData[feedbackData.length - 1].personalFeedback && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">Latest Quality Feedback</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-700">{feedbackData[feedbackData.length - 1].personalFeedback}</p>
          </div>
        </section>
      )}
    </div>
  );
};

// Export this as the default component
export default function ClassQualityPage() {
  return <ClassQualityDashboardClient />;
}