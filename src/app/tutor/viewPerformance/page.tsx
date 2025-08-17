'use client';
import dynamic from 'next/dynamic';

// Create a non-SSR version of the component
const StudentFeedbackDashboardClient = dynamic(
  () => Promise.resolve(StudentFeedbackDashboard),
  { ssr: false }
);


import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BarChart3 } from 'lucide-react';
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
  Sector,
  AreaChart,
  Area
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
  const studentId = searchParams.get('studentId');

  const [allStudentsFeedbackData, setAllStudentsFeedbackData] = useState<any[]>([]);
  const [feedbackData, setFeedbackData] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [averageSkillScores, setAverageSkillScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!courseId) {
        setError('Course ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/Api/studentFeedbackForTutor?courseId=${courseId}&studentId=${studentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch feedback data');
        }
        
        const result = await response.json();
        
        console.log("result : ",result);
        
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch feedback data');
        }
        // Process the data - group by classId, keeping only the latest feedback for each
        const groupedByClassId: Record<string, FeedbackItem> = result.data.reduce((acc: Record<string, FeedbackItem>, item: FeedbackItem) => {
          // If this is the first entry for this classId, add it
          if (!acc[item.classId]) {
            acc[item.classId] = item;
          } 
          // If we already have an entry for this classId, compare dates and keep the newest one
          else {
            const existingDate = new Date(acc[item.classId].createdAt);
            const newDate = new Date(item.createdAt);
            
            if (newDate > existingDate) {
              acc[item.classId] = item;
            }
          }
          return acc;
        }, {});
        // Process the data
        const processedData: ClassInfo[] = Object.values(groupedByClassId).map((item: FeedbackItem, index: number) => {          // Parse string values to numbers if necessary
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
          const rhythmWeight = 1/6;        // 20%
          const theoreticalWeight = 1/6;   // 15%
          const performanceWeight = 1/6;   // 30%
          const earTrainingWeight = 1/6;   // 10%
          const assignmentWeight = 1/6;    // 15%
          const techniqueWeight = 1/6;     // 10%

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

        // Calculate average skills scores
        if (processedData.length > 0) {
          const skillTotals = {
            rhythm: 0,
            theoretical: 0,
            performance: 0,
            earTraining: 0,
            assignment: 0,
            technique: 0
          };
          
          processedData.forEach(session => {
            skillTotals.rhythm += session.rhythm;
            skillTotals.theoretical += session.theoretical;
            skillTotals.performance += session.performance;
            skillTotals.earTraining += session.earTraining;
            skillTotals.assignment += session.assignment;
            skillTotals.technique += session.technique;
          });
          
          const sessionCount = processedData.length;
          
          setAverageSkillScores({
            rhythm: +(skillTotals.rhythm / sessionCount).toFixed(2),
            theoretical: +(skillTotals.theoretical / sessionCount).toFixed(2),
            performance: +(skillTotals.performance / sessionCount).toFixed(2),
            earTraining: +(skillTotals.earTraining / sessionCount).toFixed(2),
            assignment: +(skillTotals.assignment / sessionCount).toFixed(2),
            technique: +(skillTotals.technique / sessionCount).toFixed(2)
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
        // Process the all-student feedback data
      // Process the all-student feedback data
      if (result.feedbackAllStudent && Array.isArray(result.feedbackAllStudent)) {
        // Group by classId (which represents sessions)
        const groupedByClass: Record<string, FeedbackItem[]> = result.feedbackAllStudent.reduce((acc: Record<string, FeedbackItem[]>, item: FeedbackItem) => {
          if (!acc[item.classId]) {
            acc[item.classId] = [];
          }
          acc[item.classId].push(item);
          return acc;
        }, {});
          
          // For each class/session, find the top score for each metric
          const topScoresBySession: any[] = [];
          
          Object.entries(groupedByClass).forEach(([classId, feedbacks]: [string, FeedbackItem[]]) => {            // Find the matching session number from individual student data
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
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Format score as percentage
  const formatScore = (score: number) => {
    return `${(score * 10).toFixed(0)}%`;
  };

  // Define fields and their colors for individual graphs
  const fields = [
    { key: 'rhythm', name: 'Rhythm', color: '#82ca9d' },
    { key: 'theoretical', name: 'Theoretical Understanding', color: '#ff7300' },
    { key: 'performance', name: 'Performance', color: '#ff4466' },
    { key: 'earTraining', name: 'Ear Training', color: '#9467bd' },
    { key: 'assignment', name: 'Assignment Completion', color: '#8c564b' },
    { key: 'technique', name: 'Technique', color: '#e377c2' }
  ];

  // Get star rating
  const getStarRating = (score: number) => {
    const fullStars = Math.floor(score / 2);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-orange-400 text-lg">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300 text-lg">☆</span>);
      }
    }
    return stars;
  };

  // MetricCard component matching the second design
  const MetricCard = ({ title, value }: { title: string; value: string }) => (
    <div className="flex flex-col">
      <div className="text-sm text-gray-700 mb-3">{title}</div>
      <div className="flex items-center justify-between">
        <div className="w-20 h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 rounded-full shadow-sm"></div>
        <div className="text-lg font-semibold text-purple-600 ml-4">
          {value}<span className="text-xs text-gray-500">/10</span>
        </div>
      </div>
    </div>
  );

  // Function to render individual field graphs with comparison (keeping original logic)
  const renderFieldGraph = (field: any) => {
    return (
      <div key={field.key} className="bg-white">
        <h4 className="text-sm font-medium text-gray-800 mb-4 text-center">{field.name}</h4>
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={feedbackData}
              margin={{ top: 10, right: 10, left: 30, bottom: 40 }}
            >
              <defs>
                <linearGradient id={`topScoreGradient-${field.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F4A460" stopOpacity={0.9}/>
                  <stop offset="50%" stopColor="#DEB887" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="#F5DEB3" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id={`yourScoreGradient-${field.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8A2BE2" stopOpacity={0.9}/>
                  <stop offset="50%" stopColor="#9370DB" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="#DDA0DD" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="sessionNo" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                domain={[0, 10]} 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                ticks={[0, 2, 4, 6, 8, 10]}
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
              
              {/* Your score area */}
              <Area 
                type="monotone" 
                dataKey={field.key} 
                stroke="#8A2BE2" 
                fill={`url(#yourScoreGradient-${field.key})`}
                strokeWidth={2}
              />
              
              {/* Top score area */}
              {allStudentsFeedbackData.length > 0 && (
                <Area 
                  type="monotone" 
                  data={allStudentsFeedbackData}
                  dataKey={field.key} 
                  stroke="#D2691E" 
                  fill={`url(#topScoreGradient-${field.key})`}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <div className="text-xs text-gray-500 mb-1">Session</div>
          </div>
          <div className="absolute left-0 top-0 bottom-8 flex items-center justify-center">
            <div className="text-xs text-gray-500 transform -rotate-90 whitespace-nowrap">
              Score
            </div>
          </div>
        </div>
        
        {/* Add a legend for comparison */}
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <span className="text-gray-600">Your Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
            <span className="text-gray-600">Top Score</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.push(`/tutor/courseDetailsForFeedback/${courseId}?studentId=${studentId}`)} 
          className="mr-4 p-2 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-sm"
          aria-label="Go back"
        >
          <ArrowLeft className="text-gray-600" size={24} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Performance Dashboard</h1>
      </div>

      {/* Overall Course Performance */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Overall Course Performance</h1>
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="grid grid-cols-7 gap-8 items-start">
            {/* Main Score Card */}
            <div className="col-span-2">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {averageSkillScores.overall || 0}<span className="text-lg text-gray-500 font-normal">/10</span>
              </div>
              <div className="flex mb-4">
                {getStarRating(averageSkillScores.overall || 0)}
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                This performance score is based<br />
                on {feedbackData.length} evaluated classes.
              </div>
            </div>
            
            {/* Metric Cards Grid */}
            <div className="col-span-5 grid grid-cols-2 gap-x-16 gap-y-8">
              <MetricCard title="Rhythm" value={averageSkillScores.rhythm?.toString() || "0"} />
              <MetricCard title="Theoretical Understanding" value={averageSkillScores.theoretical?.toString() || "0"} />
              <MetricCard title="Ear Training" value={averageSkillScores.earTraining?.toString() || "0"} />
              <MetricCard title="Performance" value={averageSkillScores.performance?.toString() || "0"} />
              <MetricCard title="Assignment Completion" value={averageSkillScores.assignment?.toString() || "0"} />
              <MetricCard title="Technique" value={averageSkillScores.technique?.toString() || "0"} />
            </div>
          </div>
        </div>
      </div>

      {/* Latest Personal Feedback */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Latest Personal Feedback</h2>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-gray-700 text-sm">
            {feedbackData.length > 0 && feedbackData[feedbackData.length - 1].personalFeedback 
              ? feedbackData[feedbackData.length - 1].personalFeedback
              : "No personal feedback available yet."
            }
          </div>
        </div>
      </div>

      {/* Session Feedback Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Session Feedback Summary</h2>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Session Number</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Score</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Performance</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Personal Feedback</th>
              </tr>
            </thead>
            <tbody>
              {feedbackData.map((row, index) => (
                <tr key={index} className={index < feedbackData.length - 1 ? "border-b border-gray-100" : ""}>
                  <td className="px-6 py-4 text-sm text-gray-900">Session - {row.sessionNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.averageScore}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${getPerformanceColor(row.performanceLevel)}`}>
                    {row.performanceLevel.charAt(0).toUpperCase() + row.performanceLevel.slice(1)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.personalFeedback || 'No feedback provided'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Skills Progress */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Individual Skills Progress</h2>
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="grid grid-cols-3 gap-8">
            {fields.map(field => renderFieldGraph(field))}
          </div>
          {/* Bottom border line */}
          <div className="mt-8 border-b border-gray-300"></div>
        </div>
      </div>
    </div>
  );
};

// Export this as the default component
export default function ViewPerformancePage() {
  return <StudentFeedbackDashboardClient />;
}