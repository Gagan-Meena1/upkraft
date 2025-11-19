"use client";
import dynamic from "next/dynamic";

// Create a non-SSR version of the component
const StudentFeedbackDashboardClient = dynamic(
  () => Promise.resolve(StudentFeedbackDashboard),
  { ssr: false }
);

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";
import ProgressBar from "react-bootstrap/ProgressBar";
import IndividualProgress from '@/app/components/tutor/IndividualProgress';
import { useRouter } from "next/navigation";
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
} from "recharts";
import Link from "next/link";


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
  performanceLevel: "good" | "medium" | "poor";
  recommendedImprovement: string;
}

const StudentFeedbackDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const studentId = searchParams.get("studentId");

  const [allStudentsFeedbackData, setAllStudentsFeedbackData] = useState<any[]>(
    []
  );
  const [feedbackData, setFeedbackData] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [averageSkillScores, setAverageSkillScores] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!courseId) {
        setError("Course ID is required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `/Api/studentFeedbackForTutor?courseId=${courseId}&studentId=${studentId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch feedback data");
        }

        const result = await response.json();

        console.log("result : ", result);

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch feedback data");
        }
        // Process the data - group by classId, keeping only the latest feedback for each
        const groupedByClassId: Record<string, FeedbackItem> =
          result.data.reduce(
            (acc: Record<string, FeedbackItem>, item: FeedbackItem) => {
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
            },
            {}
          );
        // Process the data
        const processedData: ClassInfo[] = Object.values(groupedByClassId).map(
          (item: FeedbackItem, index: number) => {
            // Parse string values to numbers if necessary
            const rhythm =
              typeof item.rhythm === "string"
                ? parseFloat(item.rhythm)
                : item.rhythm;
            const theoreticalUnderstanding =
              typeof item.theoreticalUnderstanding === "string"
                ? parseFloat(item.theoreticalUnderstanding)
                : item.theoreticalUnderstanding;
            const performance =
              typeof item.performance === "string"
                ? parseFloat(item.performance)
                : item.performance;
            const earTraining =
              typeof item.earTraining === "string"
                ? parseFloat(item.earTraining)
                : item.earTraining;
            const assignment =
              typeof item.assignment === "string"
                ? parseFloat(item.assignment)
                : item.assignment;
            const technique =
              typeof item.technique === "string"
                ? parseFloat(item.technique)
                : item.technique;

            // Calculate average score (excluding attendance)
            // Define weights for each category (in decimal form)
            const rhythmWeight = 1 / 6; // 20%
            const theoreticalWeight = 1 / 6; // 15%
            const performanceWeight = 1 / 6; // 30%
            const earTrainingWeight = 1 / 6; // 10%
            const assignmentWeight = 1 / 6; // 15%
            const techniqueWeight = 1 / 6; // 10%

            // Calculate weighted score by multiplying each score by its weight
            const weightedScore =
              rhythm * rhythmWeight +
              theoreticalUnderstanding * theoreticalWeight +
              performance * performanceWeight +
              earTraining * earTrainingWeight +
              assignment * assignmentWeight +
              technique * techniqueWeight;

            // Store the weighted average score with 2 decimal places
            const averageScore = +weightedScore.toFixed(2);
            // Determine performance level
            let performanceLevel: "good" | "medium" | "poor";
            let recommendedImprovement = "";

            if (averageScore >= 7) {
              performanceLevel = "good";
              recommendedImprovement =
                "Continue with current progress. Focus on advanced techniques.";
            } else if (averageScore >= 5) {
              performanceLevel = "medium";

              // Find the lowest scoring area
              const scores = {
                rhythm: rhythm,
                "theoretical understanding": theoreticalUnderstanding,
                performance: performance,
                "ear training": earTraining,
                "assignment completion": assignment,
                technique: technique,
              };

              const lowestArea = Object.entries(scores).reduce((a, b) =>
                a[1] < b[1] ? a : b
              )[0];
              recommendedImprovement = `Work on improving your ${lowestArea}.`;
            } else {
              performanceLevel = "poor";
              recommendedImprovement =
                "Schedule additional practice sessions. Focus on fundamentals.";
            }

            return {
              sessionNo: index + 1, // Assuming sessions are ordered in the API response
              attendance:
                typeof item.attendance === "string"
                  ? parseFloat(item.attendance)
                  : item.attendance,
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
              recommendedImprovement,
            };
          }
        );

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
            technique: 0,
          };

          processedData.forEach((session) => {
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
            technique: +(skillTotals.technique / sessionCount).toFixed(2),
          });
        }
        // Calculate overall performance score (average of all session averages)
        if (processedData.length > 0) {
          const overallScore =
            processedData.reduce(
              (total, session) => total + session.averageScore,
              0
            ) / processedData.length;
          // Store with 2 decimal places
          setAverageSkillScores((prev) => ({
            ...prev,
            overall: +overallScore.toFixed(2),
          }));
        }
        // Process the all-student feedback data
        // Process the all-student feedback data
        if (
          result.feedbackAllStudent &&
          Array.isArray(result.feedbackAllStudent)
        ) {
          // Group by classId (which represents sessions)
          const groupedByClass: Record<string, FeedbackItem[]> =
            result.feedbackAllStudent.reduce(
              (acc: Record<string, FeedbackItem[]>, item: FeedbackItem) => {
                if (!acc[item.classId]) {
                  acc[item.classId] = [];
                }
                acc[item.classId].push(item);
                return acc;
              },
              {}
            );

          // For each class/session, find the top score for each metric
          const topScoresBySession: any[] = [];

          Object.entries(groupedByClass).forEach(
            ([classId, feedbacks]: [string, FeedbackItem[]]) => {
              // Find the matching session number from individual student data
              const matchingSession = processedData.find((item) =>
                result.data.some(
                  (dataItem: FeedbackItem) => dataItem.classId === classId
                )
              );

              const sessionNo = matchingSession
                ? matchingSession.sessionNo
                : topScoresBySession.length + 1;

              // Find top scores for each metric
              const topScores = {
                sessionNo,
                classId,
                rhythm: Math.max(
                  ...feedbacks.map((f: any) => parseFloat(f.rhythm) || 0)
                ),
                theoretical: Math.max(
                  ...feedbacks.map(
                    (f: any) => parseFloat(f.theoreticalUnderstanding) || 0
                  )
                ),
                performance: Math.max(
                  ...feedbacks.map((f: any) => parseFloat(f.performance) || 0)
                ),
                earTraining: Math.max(
                  ...feedbacks.map((f: any) => parseFloat(f.earTraining) || 0)
                ),
                assignment: Math.max(
                  ...feedbacks.map((f: any) => parseFloat(f.assignment) || 0)
                ),
                technique: Math.max(
                  ...feedbacks.map((f: any) => parseFloat(f.technique) || 0)
                ),
              };

              topScoresBySession.push(topScores);
            }
          );

          // Sort by session number
          topScoresBySession.sort((a, b) => a.sessionNo - b.sessionNo);

          setAllStudentsFeedbackData(topScoresBySession);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
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
        <div className="text-gray-500 text-xl">
          No feedback data available for this course.
        </div>
      </div>
    );
  }

  // Get performance colors for the table
  const getPerformanceColor = (level: string) => {
    switch (level) {
      case "good":
        return "text-green-600";
      case "medium":
        return "text-orange-500";
      case "poor":
        return "text-red-500";
      default:
        return "";
    }
  };

  // Format score as percentage
  const formatScore = (score: number) => {
    return `${(score * 10).toFixed(0)}%`;
  };

  // Define fields and their colors for individual graphs
  const fields = [
    { key: "rhythm", name: "Rhythm", color: "#82ca9d" },
    { key: "theoretical", name: "Theoretical Understanding", color: "#ff7300" },
    { key: "performance", name: "Performance", color: "#ff4466" },
    { key: "earTraining", name: "Ear Training", color: "#9467bd" },
    { key: "assignment", name: "Assignment Completion", color: "#8c564b" },
    { key: "technique", name: "Technique", color: "#e377c2" },
  ];

  // Add star rating and progress bar helpers from student dashboard
  const getStarRating = (score: number) => {
    const fullStars = Math.floor(score / 2);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400 text-3xl">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300 text-3xl">
            ★
          </span>
        );
      }
    }
    return stars;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-orange-500";
    return "text-red-500";
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-orange-500";
    return "bg-red-500";
  };

  // Custom active shape for gauge chart
  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      value,
    } = props;

    return (
      <g>
        <text
          x={cx}
          y={cy + 30}
          dy={8}
          textAnchor="middle"
          fill={getScoreColor(value)}
        >
          <tspan x={cx} dy="0" fontSize="24" fontWeight="bold">
            {value}
          </tspan>
          <tspan x={cx} dy="20" fontSize="12" fill="#666">
            /10
          </tspan>
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
          innerRadius={outerRadius}
          outerRadius={outerRadius + 20}
          fill="#e0e0e0"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={180}
          endAngle={180 - (180 * value) / 10}
          innerRadius={outerRadius}
          outerRadius={outerRadius + 20}
          fill={getScoreColor(value)}
        />
        {/* Add a needle pointer */}
        <line
          x1={cx}
          y1={cy}
          x2={
            cx +
            (outerRadius + 25) *
              Math.cos((Math.PI * (180 - (180 * value) / 10)) / 180)
          }
          y2={
            cy -
            (outerRadius + 25) *
              Math.sin((Math.PI * (180 - (180 * value) / 10)) / 180)
          }
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
        <text
          x={cx - outerRadius + 15}
          y={cy - 1}
          textAnchor="end"
          fontSize="11"
          fill="#666"
        >
          0
        </text>
        <text
          x={cx}
          y={cy - outerRadius + 20}
          textAnchor="middle"
          fontSize="11"
          fill="#666"
        >
          5
        </text>
        <text
          x={cx + outerRadius - 25}
          y={cy}
          textAnchor="start"
          fontSize="11"
          fill="#666"
        >
          10
        </text>
      </g>
    );
  };

  // Function to render gauge chart for average skill scores
  const renderGaugeChart = (field: any) => {
    const score = averageSkillScores[field.key] || 0;
    const data = [{ name: field.name, value: score }];

    // Calculate angle based on score (0-10 scale)
    const angle = 180 - 180 * (score / 10);

    return (
      <div key={field.key} className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
          {field.name}
        </h3>
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
          <span
            className={`font-medium ${
              getScoreColor(score) === "text-green-500"
                ? "text-green-600"
                : getScoreColor(score) === "text-orange-500"
                ? "text-orange-500"
                : "text-red-500"
            }`}
          >
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
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {field.name}
        </h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={feedbackData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="sessionNo"
                label={{
                  value: "Session Number",
                  position: "insideBottom",
                  offset: -5,
                }}
                padding={{ left: 10, right: 10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={[0, 10]}
                label={{ value: "Score", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "topScore") return [`${value}/10`, "Top Score"];
                  return [`${value}/10`, field.name];
                }}
                separator=": "
                labelFormatter={(label) => `Session ${label}`}
                contentStyle={{ padding: "8px" }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 10, paddingLeft: 75 }}
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
                  dot={{ stroke: "#228B22", strokeWidth: 2, r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Add a legend for comparison */}
        <div className="flex justify-center items-center mt-4 text-sm">
          <div className="flex items-center mr-8">
            <div
              className="w-4 h-4 mr-2"
              style={{ backgroundColor: field.color }}
            ></div>
            <span className="text-gray-800">Your Score</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 mr-2"
              style={{ backgroundColor: "#228B22" }}
            ></div>
            <span className="text-gray-800">Top Score</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="course-quality-details-sec">
      <div className="row">
        {/* Overall Course Performance */}
        <div className="col-xl-4 col-md-12 mb-4">
          <div className="card-box">
            <div className="course-quality text-center">
              <h3>Overall Course Performance</h3>
              <h4>
                {averageSkillScores.overall ?? "-"}
                <span>/10</span>
              </h4>
              <ul className="reting-review d-flex align-items-center gap-2 justify-content-center list-unstyled p-0 m-0">
                <li>{getStarRating(averageSkillScores.overall ?? 0)}</li>
              </ul>
              <p className="m-0 p-0">
                This performance score is based on {feedbackData.length} evaluated classes.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="col-xl-4 col-md-6 mb-4">
          <div className="progressbar-line-sec">
            <div className="card-box mb-3 d-flex align-items-center gap-2 justify-content-between">
              <div className="left-progress-bar">
                <h6 className="mb-2">Rhythm</h6>
                <ProgressBar
                  now={averageSkillScores.rhythm * 10}
                  variant=""
                  style={{ height: "8px", backgroundColor: "#eee" }}
                >
                  <div
                    style={{
                      width: `${averageSkillScores.rhythm * 10}%`,
                      height: "100%",
                      backgroundColor: "#7b2ff7",
                      borderRadius: "6px",
                    }}
                  ></div>
                </ProgressBar>
              </div>
              <div className="right-text-box">
                <span className="main-text"> {averageSkillScores.rhythm ?? "-"}</span>
                <span className="text-muted">/10</span>
              </div>
            </div>
            <div className="card-box mb-3 d-flex align-items-center gap-2 justify-content-between">
              <div className="left-progress-bar">
                <h6 className="mb-2">Ear Training</h6>
                <ProgressBar
                  now={averageSkillScores.earTraining * 10}
                  variant=""
                  style={{ height: "8px", backgroundColor: "#eee" }}
                >
                  <div
                    style={{
                      width: `${averageSkillScores.earTraining * 10}%`,
                      height: "100%",
                      backgroundColor: "#7b2ff7",
                      borderRadius: "6px",
                    }}
                  ></div>
                </ProgressBar>
              </div>
              <div className="right-text-box">
                <span className="main-text"> {averageSkillScores.earTraining ?? "-"}</span>
                <span className="text-muted">/10</span>
              </div>
            </div>
            <div className="card-box mb-0 d-flex align-items-center gap-2 justify-content-between">
              <div className="left-progress-bar">
                <h6 className="mb-2">Assignment Completion</h6>
                <ProgressBar
                  now={averageSkillScores.assignment * 10}
                  variant=""
                  style={{ height: "8px", backgroundColor: "#eee" }}
                >
                  <div
                    style={{
                      width: `${averageSkillScores.assignment * 10}%`,
                      height: "100%",
                      backgroundColor: "#7b2ff7",
                      borderRadius: "6px",
                    }}
                  ></div>
                </ProgressBar>
              </div>
              <div className="right-text-box">
                <span className="main-text"> {averageSkillScores.assignment ?? "-"}</span>
                <span className="text-muted">/10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6 mb-4">
          <div className="progressbar-line-sec">
            <div className="card-box mb-3 d-flex align-items-center gap-2 justify-content-between">
              <div className="left-progress-bar">
                <h6 className="mb-2">Theoretical Understanding</h6>
                <ProgressBar
                  now={averageSkillScores.theoretical * 10}
                  variant=""
                  style={{ height: "8px", backgroundColor: "#eee" }}
                >
                  <div
                    style={{
                      width: `${averageSkillScores.theoretical * 10}%`,
                      height: "100%",
                      backgroundColor: "#7b2ff7",
                      borderRadius: "6px",
                    }}
                  ></div>
                </ProgressBar>
              </div>
              <div className="right-text-box">
                <span className="main-text"> {averageSkillScores.theoretical ?? "-"}</span>
                <span className="text-muted">/10</span>
              </div>
            </div>
            <div className="card-box mb-3 d-flex align-items-center gap-2 justify-content-between">
              <div className="left-progress-bar">
                <h6 className="mb-2">Performance</h6>
                <ProgressBar
                  now={averageSkillScores.performance * 10}
                  variant=""
                  style={{ height: "8px", backgroundColor: "#eee" }}
                >
                  <div
                    style={{
                      width: `${averageSkillScores.performance * 10}%`,
                      height: "100%",
                      backgroundColor: "#7b2ff7",
                      borderRadius: "6px",
                    }}
                  ></div>
                </ProgressBar>
              </div>
              <div className="right-text-box">
                <span className="main-text"> {averageSkillScores.performance ?? "-"}</span>
                <span className="text-muted">/10</span>
              </div>
            </div>
            <div className="card-box mb-0 d-flex align-items-center gap-2 justify-content-between">
              <div className="left-progress-bar">
                <h6 className="mb-2">Technique</h6>
                <ProgressBar
                  now={averageSkillScores.technique * 10}
                  variant=""
                  className="w-100"
                  style={{ height: "8px", backgroundColor: "#eee" }}
                >
                  <div
                    style={{
                      width: `${averageSkillScores.technique * 10}%`,
                      height: "100%",
                      backgroundColor: "#7b2ff7",
                      borderRadius: "6px",
                    }}
                  ></div>
                </ProgressBar>
              </div>
              <div className="right-text-box">
                <span className="main-text"> {averageSkillScores.technique ?? "-"}</span>
                <span className="text-muted">/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Personal Feedback */}
        <div className="col-md-12 mb-4">
          <div className="card-box overall-card-box">
            <h2>Latest Personal Feedback</h2>
            <hr className="hr-light mb-4 mt-4" />
            <p className="m-0">
              {feedbackData.length > 0
                ? feedbackData[feedbackData.length - 1].personalFeedback || "No feedback available"
                : "No feedback available"}
            </p>
          </div>
        </div>

        {/* Session Feedback Summary Table */}
        <div className="col-md-12 mb-4">
          <div className="card-box feedback-summary-sec">
            <h2>Session Feedback Summary</h2>
            <div className="table-sec assignments-list-box border-0 mb-0 pb-0">
              <div className="table-responsive">
                <table className="table align-middle m-0">
                  <thead>
                    <tr>
                      <th className="col-3">Session Number</th>
                      <th className="col-2">Score</th>
                      <th className="col-2">Performance</th>
                      <th className="col-5">Recommended Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackData.map((session, idx) => (
                      <tr key={idx}>
                        <td>Session - {session.sessionNo}</td>
                        <td>{session.averageScore}</td>
                        <td>
                          <span className={
                            session.performanceLevel === "good"
                              ? "green-text"
                              : session.performanceLevel === "medium"
                              ? "yellow-text"
                              : "red-text"
                          }>
                            {session.performanceLevel.charAt(0).toUpperCase() + session.performanceLevel.slice(1)}
                          </span>
                        </td>
                        <td>{session.personalFeedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Progress Charts */}
        <div className="col-md-12 mb-4">
          <IndividualProgress 
            feedbackData={feedbackData}
            averageSkillScores={averageSkillScores}
            allStudentsFeedbackData={allStudentsFeedbackData}
          />
        </div>
      </div>
    </div>
  );
};

// Export this as the default component
export default function ViewPerformancePage() {
  return <StudentFeedbackDashboardClient />;
}
