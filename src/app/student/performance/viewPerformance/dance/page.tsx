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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';

interface FeedbackItem {
  _id: string;
  userId: string;
  classId: string;
  technique: string | number;
  musicality: string | number;
  retention: string | number;
  performance: string | number;
  effort: string | number;
  personalFeedback: string;
  createdAt: string;
  updatedAt: string;
}

interface ClassInfo {
  sessionNo: number;
  technique: number;
  musicality: number;
  retention: number;
  performance: number;
  effort: number;
  personalFeedback: string;
  averageScore: number;
  performanceLevel: 'good' | 'medium' | 'poor';
  recommendedImprovement: string;
}
import dynamic from 'next/dynamic';

// Create a non-SSR version of the component
const StudentFeedbackDashboardClient = dynamic(
  () => Promise.resolve(StudentFeedbackDashboard),
  { ssr: false }
);


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
        const response = await fetch(`/Api/studentFeedbackForTutor/dance?courseId=${courseId}&studentId=${studentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch feedback data');
        }
        
        const result = await response.json();
        
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
        const processedData: ClassInfo[] = Object.values(groupedByClassId).map((item: FeedbackItem, index: number) => {
          // Parse string values to numbers if necessary
          const technique = typeof item.technique === 'string' ? parseFloat(item.technique) : item.technique;
          const musicality = typeof item.musicality === 'string' ? parseFloat(item.musicality) : item.musicality;
          const retention = typeof item.retention === 'string' ? parseFloat(item.retention) : item.retention;
          const performance = typeof item.performance === 'string' ? parseFloat(item.performance) : item.performance;
          const effort = typeof item.effort === 'string' ? parseFloat(item.effort) : item.effort;
          
          // Calculate average score
          // Define weights for each category (in decimal form)
          const techniqueWeight = 0.20;    // 20%
          const musicalityWeight = 0.20;   // 20%
          const retentionWeight = 0.20;    // 20%
          const performanceWeight = 0.20;  // 20%
          const effortWeight = 0.20;       // 20%

          // Calculate weighted score by multiplying each score by its weight
          const weightedScore = 
              (technique * techniqueWeight) +
              (musicality * musicalityWeight) +
              (retention * retentionWeight) +
              (performance * performanceWeight) +
              (effort * effortWeight);

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
              'technique': technique,
              'musicality': musicality,
              'retention': retention,
              'performance': performance,
              'effort': effort
            };
            
            const lowestArea = Object.entries(scores).reduce((a, b) => a[1] < b[1] ? a : b)[0];
            recommendedImprovement = `Work on improving your ${lowestArea}.`;
          } else {
            performanceLevel = 'poor';
            recommendedImprovement = 'Schedule additional practice sessions. Focus on fundamentals.';
          }
          
          return {
            sessionNo: index + 1, // Assuming sessions are ordered in the API response
            technique,
            musicality,
            retention,
            performance,
            effort,
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
            technique: 0,
            musicality: 0,
            retention: 0,
            performance: 0,
            effort: 0
          };
          
          processedData.forEach(session => {
            skillTotals.technique += session.technique;
            skillTotals.musicality += session.musicality;
            skillTotals.retention += session.retention;
            skillTotals.performance += session.performance;
            skillTotals.effort += session.effort;
          });
          
          const sessionCount = processedData.length;
          
          setAverageSkillScores({
            technique: +(skillTotals.technique / sessionCount).toFixed(2),
            musicality: +(skillTotals.musicality / sessionCount).toFixed(2),
            retention: +(skillTotals.retention / sessionCount).toFixed(2),
            performance: +(skillTotals.performance / sessionCount).toFixed(2),
            effort: +(skillTotals.effort / sessionCount).toFixed(2)
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
          
          Object.entries(groupedByClass).forEach(([classId, feedbacks]: [string, FeedbackItem[]]) => {
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
              technique: Math.max(...feedbacks.map((f: any) => parseFloat(f.technique) || 0)),
              musicality: Math.max(...feedbacks.map((f: any) => parseFloat(f.musicality) || 0)),
              retention: Math.max(...feedbacks.map((f: any) => parseFloat(f.retention) || 0)),
              performance: Math.max(...feedbacks.map((f: any) => parseFloat(f.performance) || 0)),
              effort: Math.max(...feedbacks.map((f: any) => parseFloat(f.effort) || 0))
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
  }, [courseId, studentId]);
    
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
    return `${(score * 10).toFixed(0)}%`;
  };

  // Define fields and their colors for individual graphs
  const fields = [
    { key: 'technique', name: 'Technique', color: '#82ca9d' },
    { key: 'musicality', name: 'Musicality', color: '#ff7300' },
    { key: 'retention', name: 'Retention', color: '#ff4466' },
    { key: 'performance', name: 'Performance', color: '#9467bd' },
    { key: 'effort', name: 'Effort', color: '#e377c2' }
  ];

  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 7) return '#4CAF50';  // Green for good
    if (score >= 5) return '#FF9800';  // Orange for medium
    return '#F44336';                  // Red for poor
  };

  // Custom active shape for gauge chart
  const renderActiveShape = (props: any) => {
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
        {/* Add tick marks for scale */}
        <text x={cx - outerRadius + 15} y={cy -1} textAnchor="end" fontSize="11" fill="#666">0</text>
        <text x={cx} y={cy - outerRadius +20} textAnchor="middle" fontSize="11" fill="#666">5</text>
        <text x={cx + outerRadius - 25} y={cy} textAnchor="start" fontSize="11" fill="#666">10</text>
      </g>
    );
  };

  // Function to render gauge chart for average skill scores
  const renderGaugeChart = (field: any) => {
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
                wrapperStyle={{ paddingTop: 10, paddingLeft: 75}}
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
        <div className="flex justify-center items-center mt-4 text-sm">
          <div className="flex items-center mr-8">
            <div className="w-4 h-4 mr-2" style={{ backgroundColor: field.color }}></div>
            <span className="text-gray-800">Your Score</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#228B22' }}></div>
            <span className="text-gray-800">Top Score</span>
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
            onClick={() => router.push(`/student/courses?studentId=${studentId}`)} 
            className="mr-4 p-2 rounded-full bg-gray-200 hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="text-orange-500" size={24} />
          </button>
          <h1 className="text-3xl font-bold text-orange-500">Your Performance Dashboard</h1>
        </div>
        <p className="text-gray-600">Track your progress across different sessions and skills</p>
      </header>
      
      {/* Overall Course Performance Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Overall Course Performance</h2>
        
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
          {averageSkillScores.overall !== undefined && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Overall Performance Score</h3>
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
                  Average performance across all {feedbackData.length} session{feedbackData.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Scorometers section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Overall Skill Performance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map(field => renderGaugeChart(field))}
        </div>
      </section>
      
      {/* Individual field graphs */}
      <section className="mb-10">
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
                    Personal Feedback
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

// Export this as the default component
export default function ViewPerformancePage() {
  return <StudentFeedbackDashboardClient />;
}