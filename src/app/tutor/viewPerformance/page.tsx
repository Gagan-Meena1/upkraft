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
  Sector
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
const [isSubmittingScore, setIsSubmittingScore] = useState<boolean>(false);
const [scoreSubmissionStatus, setScoreSubmissionStatus] = useState<{
  success: boolean;
  message: string;
} | null>(null);


// Function to submit performance score to API
const submitPerformanceScore = async (score: number) => {
  if (!courseId || !studentId) {
    console.error('Missing courseId or studentId');
    return;
  }

  setIsSubmittingScore(true);
  setScoreSubmissionStatus(null);

  try {
    console.log('Submitting performance score:', { courseId, studentId, score });
    
    const response = await fetch('/Api/getPerformanceScore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId,
        studentId,
        score: score
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit performance score');
    }

    console.log('Performance score submitted successfully:', result);
    setScoreSubmissionStatus({
      success: true,
      message: result.message || 'Performance score saved successfully'
    });

    // Hide success message after 3 seconds
    setTimeout(() => {
      setScoreSubmissionStatus(null);
    }, 3000);

  } catch (error) {
    console.error('Error submitting performance score:', error);
    setScoreSubmissionStatus({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save performance score'
    });

    // Hide error message after 5 seconds
    setTimeout(() => {
      setScoreSubmissionStatus(null);
    }, 5000);
  } finally {
    setIsSubmittingScore(false);
  }
};


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
  const roundedScore = +overallScore.toFixed(2);
  
  // Store with 2 decimal places
  setAverageSkillScores(prev => ({
    ...prev,
    overall: roundedScore
  }));
  
  // Submit the performance score to API
  submitPerformanceScore(roundedScore);
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
    { key: 'rhythm', name: 'Rhythm', color: '#82ca9d' },
    { key: 'theoretical', name: 'Theoretical Understanding', color: '#ff7300' },
    { key: 'performance', name: 'Performance', color: '#ff4466' },
    { key: 'earTraining', name: 'Ear Training', color: '#9467bd' },
    { key: 'assignment', name: 'Assignment Completion', color: '#8c564b' },
    { key: 'technique', name: 'Technique', color: '#e377c2' }
  ];

  // Add star rating and progress bar helpers from student dashboard
  const getStarRating = (score: number) => {
    const fullStars = Math.floor(score / 2);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400 text-3xl">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300 text-3xl">★</span>);
      }
    }
    return stars;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-orange-500';
    return 'bg-red-500';
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
        {/* <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        /> */}
        {/* <Sector
          cx={cx}
          cy={cy}
          startAngle={180}
          endAngle={0}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill="transparent"
          stroke="#e0e0e0"
        /> */}
        <Sector
          cx={cx}
          cy={cy}
          startAngle={180}
          endAngle={0}
          innerRadius={outerRadius }
          outerRadius={outerRadius + 20}
          fill="#e0e0e0"
        />
       <Sector
          cx={cx}
          cy={cy}
          startAngle={180}
          endAngle={180 - (180 * value / 10)}
          innerRadius={outerRadius }
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
        <text x={cx + outerRadius - 25} y={cy } textAnchor="start" fontSize="11" fill="#666">10</text>
      </g>
    );
  };

  // Function to render gauge chart for average skill scores
  const renderGaugeChart = (field: any) => {
    const score = averageSkillScores[field.key] || 0;
    const data = [{ name: field.name, value: score }];
    
    // Calculate angle based on score (0-10 scale)
    const angle = 180 - (180 * (score / 10));
    
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
            onClick={() => router.push(`/tutor/courseDetailsForFeedback/${courseId}?studentId=${studentId}`)} 
            className="mr-4 p-2 rounded-full bg-gray-200 hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="text-orange-500" size={24} />
          </button>
          <h1 className="text-3xl font-bold text-orange-500">Your Performance Dashboard</h1>
        </div>
        <p className="text-gray-600">Track your progress across different sessions and skills</p>
      </header>

      {/* New Overall Course Performance Section */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-4">Overall Course Performance</h2>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-baseline">
            <span className={`text-6xl font-bold ${getScoreColor(averageSkillScores.overall || 0)}`}>
              {averageSkillScores.overall?.toFixed(1)}
            </span>
            <span className="text-2xl text-gray-500 ml-2">/10</span>
          </div>
          <div className="flex justify-center space-x-1">
            {getStarRating(averageSkillScores.overall || 0)}
          </div>
          <p className="text-gray-600 text-center mt-4">
            This performance score is based on {feedbackData.length} evaluated classes.
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500 mt-2">
            <div>Total Classes: {feedbackData.length}</div>
            <div>Evaluated Classes: {feedbackData.length}</div>
          </div>
        </div>
      </div>

      {/* New Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {fields.map(field => (
          <div key={field.key} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-900">{field.name}</h3>
              </div>
              <div className="flex items-baseline">
                <span className={`text-xl font-semibold ${getScoreColor(averageSkillScores[field.key] || 0)}`}>
                  {averageSkillScores[field.key]?.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 ml-1">/10</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressBarColor(averageSkillScores[field.key] || 0)}`}
                style={{ width: `${(averageSkillScores[field.key] || 0) * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>

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

// Export this as the default component
export default function ViewPerformancePage() {
  return <StudentFeedbackDashboardClient />;
}