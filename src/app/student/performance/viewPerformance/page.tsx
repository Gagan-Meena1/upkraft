'use client';
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
  ResponsiveContainer
} from 'recharts';

interface FeedbackItem {
  _id: string;
  userId: string;
  classId: string;
  attendance: number;
  rhythm: number;
  theoreticalUnderstanding: number;
  performance: number;
  earTraining: number;
  assignment: number;
  technique: number;
  personalFeedback: string;
  createdAt: string;
}

interface ClassInfo {
  sessionNo: number;
  attendance: number;
  rhythm: number;
  theoretical: number;
  understanding: number;
  performance: number;
  earTraining: number;
  assignment: number;
  technique: number;
  personalFeedback: string;
  averageScore: number;
  performanceLevel: 'good' | 'medium' | 'poor';
  recommendedImprovement: string;
}

const StudentFeedbackDashboard = () => {
    const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [allStudentsFeedbackData, setAllStudentsFeedbackData] = useState<any[]>([]);
  const [feedbackData, setFeedbackData] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!courseId) {
        setError('Course ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/Api/studentFeedback?courseId=${courseId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch feedback data');
        }
        
        const result = await response.json();
        console.log("11111111111111111111111111111111111111111111111111111111111");
        
        console.log("result : ",result);
        
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch feedback data');
        }
        
        // Process the data
        // Process the data
const processedData: ClassInfo[] = result.data.map((item: FeedbackItem, index: number) => {
    // Parse string values to numbers if necessary
    const rhythm = typeof item.rhythm === 'string' ? parseFloat(item.rhythm) : item.rhythm;
    const theoreticalUnderstanding = typeof item.theoreticalUnderstanding === 'string' ? 
      parseFloat(item.theoreticalUnderstanding) : item.theoreticalUnderstanding;
    const performance = typeof item.performance === 'string' ? 
      parseFloat(item.performance) : item.performance;
    const earTraining = typeof item.earTraining === 'string' ? 
      parseFloat(item.earTraining) : item.earTraining;
    const assignment = typeof item.assignment === 'string' ? 
      parseFloat(item.assignment) : item.assignment;
    const technique = typeof item.technique === 'string' ? 
      parseFloat(item.technique) : item.technique;
    
    // Calculate average score (excluding attendance)
    // Define weights for each category (in decimal form)
const rhythmWeight = 0.20;        // 20%
const theoreticalWeight = 0.15;   // 15%
const performanceWeight = 0.30;   // 30%
const earTrainingWeight = 0.10;   // 10%
const assignmentWeight = 0.15;    // 15%
const techniqueWeight = 0.10;     // 10%

// Calculate weighted score by multiplying each score by its weight
const weightedScore = 
    (rhythm * rhythmWeight) +
    (theoreticalUnderstanding * theoreticalWeight) +
    (performance * performanceWeight) +
    (earTraining * earTrainingWeight) +
    (assignment * assignmentWeight) +
    (technique * techniqueWeight);

// Store the weighted average score with 2 decimal places
const averageScore = +weightedScore.toFixed(2);
    // Determine performance level
    let performanceLevel: 'good' | 'medium' | 'poor';
    let recommendedImprovement = '';
    
    if (averageScore >= 7) {
      performanceLevel = 'good';
      recommendedImprovement = 'Continue with current progress. Focus on advanced techniques.';
    } else if (averageScore >= 5) {
      performanceLevel = 'medium';
      
      // Find the lowest scoring area
      const scores = {
        'rhythm': rhythm,
        'theoretical understanding': theoreticalUnderstanding,
        'performance': performance,
        'ear training': earTraining,
        'assignment completion': assignment,
        'technique': technique
      };
      
      const lowestArea = Object.entries(scores).reduce((a, b) => a[1] < b[1] ? a : b)[0];
      recommendedImprovement = `Work on improving your ${lowestArea}.`;
    } else {
      performanceLevel = 'poor';
      recommendedImprovement = 'Schedule additional practice sessions. Focus on fundamentals.';
    }
    
    return {
      sessionNo: index + 1, // Assuming sessions are ordered in the API response
      attendance: typeof item.attendance === 'string' ? parseFloat(item.attendance) : item.attendance,
      rhythm: rhythm,
      theoretical: theoreticalUnderstanding,
      understanding: theoreticalUnderstanding,
      performance: performance,
      earTraining: earTraining,
      assignment: assignment,
      technique: technique,
      personalFeedback: item.personalFeedback,
      averageScore,
      performanceLevel,
      recommendedImprovement
    };
  });
        
        // Sort by session number
        processedData.sort((a, b) => a.sessionNo - b.sessionNo);
        
        setFeedbackData(processedData);

          // Process the all-student feedback data
      if (result.feedbackAllStudent && Array.isArray(result.feedbackAllStudent)) {
        // Group by classId (which represents sessions)
        const groupedByClass = result.feedbackAllStudent.reduce((acc: any, item: FeedbackItem) => {
          if (!acc[item.classId]) {
            acc[item.classId] = [];
          }
          acc[item.classId].push(item);
          return acc;
        }, {});
        
        // For each class/session, find the top score for each metric
        const topScoresBySession: any[] = [];
        
        Object.entries(groupedByClass).forEach(([classId, feedbacks]: [string, any]) => {
          // Find the matching session number from individual student data
          const matchingSession = processedData.find(item => 
            result.data.some((dataItem: FeedbackItem) => 
              dataItem.classId === classId 
            )
          );
          
          const sessionNo = matchingSession ? matchingSession.sessionNo : topScoresBySession.length + 1;
          
          // Find top scores for each metric
          const topScores = {
            sessionNo,
            classId,
            rhythm: Math.max(...feedbacks.map((f: any) => parseFloat(f.rhythm) || 0)),
            theoretical: Math.max(...feedbacks.map((f: any) => parseFloat(f.theoreticalUnderstanding) || 0)),
            performance: Math.max(...feedbacks.map((f: any) => parseFloat(f.performance) || 0)),
            earTraining: Math.max(...feedbacks.map((f: any) => parseFloat(f.earTraining) || 0)),
            assignment: Math.max(...feedbacks.map((f: any) => parseFloat(f.assignment) || 0)),
            technique: Math.max(...feedbacks.map((f: any) => parseFloat(f.technique) || 0)),
          };
          
          topScoresBySession.push(topScores);
        });
        
        // Sort by session number
        topScoresBySession.sort((a, b) => a.sessionNo - b.sessionNo);
        
        setAllStudentsFeedbackData(topScoresBySession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchFeedbackData();
}, [courseId]);
      
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-orange-500 text-xl">Loading feedback data...</div>
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
        <div className="text-gray-500 text-xl">No feedback data available for this course.</div>
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

  // Format score as percentage
  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(0)}%`;
  };

  // Define fields and their colors for individual graphs
  const fields = [
    // { key: 'attendance', name: 'Attendance', color: '#8884d8' },
    { key: 'rhythm', name: 'Rhythm', color: '#82ca9d' },
    { key: 'theoretical', name: 'Theoretical Understanding', color: '#ff7300' },
    { key: 'performance', name: 'Performance', color: '#ff4466' },
    { key: 'earTraining', name: 'Ear Training', color: '#9467bd' },
    { key: 'assignment', name: 'Assignment Completion', color: '#8c564b' },
    { key: 'technique', name: 'Technique', color: '#e377c2' }
  ];

  // Function to render individual field graphs
  // Function to render individual field graphs with comparison
const renderFieldGraph = (field: any) => {
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
              formatter={(value, name) => {
              if (name === "topScore") return [`${value}/10`, "Top Score"];
                return [`${value}/10`, field.name];
              }}
              separator=": "
              labelFormatter={(label) => `Session ${label}`}
              contentStyle={{ padding: '8px' }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: 10,paddingLeft: 75}}
              iconSize={10}
              iconType="circle"
              margin={{ top: 10 }}
            />
            
            {/* Your score line */}
            <Line 
              type="monotone" 
              dataKey={field.key} 
              stroke={field.color} 
              name={field.name}
              strokeWidth={2}
              activeDot={{ r: 8 }} 
            />
            
            {/* Top score line */}
            {allStudentsFeedbackData.length > 0 && (
              <Line 
                type="monotone" 
                data={allStudentsFeedbackData}
                dataKey={field.key} 
                stroke="#228B22" 
                name="topScore"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ stroke: '#228B22', strokeWidth: 2, r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Add a legend for comparison */}
      <div className="flex justify-center items-center ml-19 mt-4 text-sm">
        <div className="flex items-center mr-8">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: field.color }}></div>
          <span className='text-gray-800'>Your Score</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#228B22' }}></div>
          <span className='text-gray-800'>Top Score</span>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
     <header className="mb-8">
  <div className="flex items-center mb-2">
    <button 
      onClick={() => router.push('/student/performance')} 
      className="mr-4 p-2 rounded-full bg-gray-200 hover:bg-gray-100 transition-colors"
      aria-label="Go back"
    >
      <ArrowLeft className="text-orange-500" size={24} />
    </button>
    <h1 className="text-3xl font-bold text-orange-500">Your Performance Dashboard</h1>
  </div>
  <p className="text-gray-600">Track your progress across different sessions and skills</p>
</header>
      
      {/* Main graphs section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Overall Performance</h2>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl text-gray-800 mb-4">Overall Skill Development</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feedbackData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="sessionNo" 
                  label={{ value: 'Session Number', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  domain={[0, 10]} 
                  label={{ value: 'Score', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip />
                <Legend />
                  
                <Line type="monotone" dataKey="rhythm" stroke="#82ca9d" />
                <Line type="monotone" dataKey="theoretical" stroke="#ff7300" />
                <Line type="monotone" dataKey="performance" stroke="#ff4466" />
                <Line type="monotone" dataKey="earTraining" stroke="#9467bd" />
                <Line type="monotone" dataKey="technique" stroke="#e377c2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Individual field graphs */}
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Individual Skills Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map(field => renderFieldGraph(field))}
        </div>
      </section>
      
      {/* Feedback table section */}
      <section>
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Session Feedback Summary</h2>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutor Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommended Improvement
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
                      {session.averageScore}
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
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">Latest Personal Feedback</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-700">{feedbackData[feedbackData.length - 1].personalFeedback}</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentFeedbackDashboard;