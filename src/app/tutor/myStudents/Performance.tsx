import React from "react";
import SkillChart from "./components/SkillChart";
import PerformanceMetric from "./components/PerformanceMetric";
import { Music, TrendingUp, MessageCircle } from "lucide-react";
import PerformanceOverview from "./components/PerformanceOverview";

function Performance() {
  const skillsData = {
    rhythm: [
      { week: 1, yourScore: 3.5, topScore: 8.5 },
      { week: 2, yourScore: 4.2, topScore: 8.8 },
      { week: 3, yourScore: 5.1, topScore: 9.0 },
      { week: 4, yourScore: 5.8, topScore: 9.2 },
      { week: 5, yourScore: 6.2, topScore: 9.3 },
      { week: 6, yourScore: 6.0, topScore: 9.1 },
    ],
    theoreticalUnderstanding: [
      { week: 1, yourScore: 2.8, topScore: 8.2 },
      { week: 2, yourScore: 3.5, topScore: 8.5 },
      { week: 3, yourScore: 4.0, topScore: 8.7 },
      { week: 4, yourScore: 4.2, topScore: 8.9 },
      { week: 5, yourScore: 4.6, topScore: 9.0 },
      { week: 6, yourScore: 4.4, topScore: 8.8 },
    ],
    earTraining: [
      { week: 1, yourScore: 2.0, topScore: 7.8 },
      { week: 2, yourScore: 2.5, topScore: 8.0 },
      { week: 3, yourScore: 2.8, topScore: 8.2 },
      { week: 4, yourScore: 3.0, topScore: 8.4 },
      { week: 5, yourScore: 3.2, topScore: 8.6 },
      { week: 6, yourScore: 3.0, topScore: 8.3 },
    ],
    performance: [
      { week: 1, yourScore: 4.0, topScore: 8.5 },
      { week: 2, yourScore: 4.8, topScore: 8.7 },
      { week: 3, yourScore: 5.2, topScore: 8.9 },
      { week: 4, yourScore: 5.6, topScore: 9.1 },
      { week: 5, yourScore: 5.8, topScore: 9.2 },
      { week: 6, yourScore: 5.5, topScore: 9.0 },
    ],
    technique: [
      { week: 1, yourScore: 4.5, topScore: 8.8 },
      { week: 2, yourScore: 5.2, topScore: 9.0 },
      { week: 3, yourScore: 5.8, topScore: 9.2 },
      { week: 4, yourScore: 6.2, topScore: 9.4 },
      { week: 5, yourScore: 6.8, topScore: 9.5 },
      { week: 6, yourScore: 6.5, topScore: 9.3 },
    ],
    assignmentCompletion: [
      { week: 1, yourScore: 2.5, topScore: 8.0 },
      { week: 2, yourScore: 3.0, topScore: 8.2 },
      { week: 3, yourScore: 3.5, topScore: 8.4 },
      { week: 4, yourScore: 3.8, topScore: 8.6 },
      { week: 5, yourScore: 4.2, topScore: 8.8 },
      { week: 6, yourScore: 4.0, topScore: 8.5 },
    ],
  };

  const sessionFeedback = [
    {
      session: 1,
      score: 5.33,
      performance: "Start",
      recommendation: "Great job keeping a steady tempo today",
      color: "text-gray-600",
    },
    {
      session: 2,
      score: 4.67,
      performance: "Poor",
      recommendation: "Work on smoothing transitions between chords",
      color: "text-red-600",
    },
    {
      session: 3,
      score: 7.17,
      performance: "Good",
      recommendation: "Your hand posture has really improved",
      color: "text-blue-600",
    },
    {
      session: 4,
      score: 6.17,
      performance: "Moderate",
      recommendation: "Try practicing the left hand separately for accuracy",
      color: "text-yellow-600",
    },
    {
      session: 5,
      score: 4.53,
      performance: "Poor",
      recommendation: "Excellent dynamics—your expression is growing",
      color: "text-red-600",
    },
  ];

  return (
    <div className="h-full bg-gray-50 overflow-y-auto space-y-6">
      {/* Overall Course Performance */}
      <PerformanceOverview />

      {/* Latest Personal Feedback */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[#212121] mb-4 flex items-center gap-2">
          Latest Personal Feedback
        </h2>
        <hr className="border-gray-200 mb-4" />
        <p className="text-black text-[16px]">Session 3 class feedback</p>
      </div>

      {/* Session Feedback Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[#212121] mb-4 flex items-center gap-2">
          Session Feedback Summary
        </h2>
        <hr className="border-gray-200 mb-4" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4  text-black text-[16px] font-semibold">
                  Session Number
                </th>
                <th className="text-left py-3 px-4  text-black text-[16px] font-semibold">
                  Score
                </th>
                <th className="text-left py-3 px-4  text-black text-[16px] font-semibold">
                  Performance
                </th>
                <th className="text-left py-3 px-4  text-black text-[16px] font-semibold">
                  Recommended Improvement
                </th>
              </tr>
            </thead>
            <tbody>
              {sessionFeedback.map((session, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-black">
                    Session - {session.session}
                  </td>
                  <td className="py-3 px-4 font-medium text-black">
                    {session.score}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${session.color}`}>
                      {session.performance}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-black text-sm">
                    {session.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Skills Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Individual Skills Progress
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkillChart title="Rhythm" data={skillsData.rhythm} />
          <SkillChart
            title="Theoretical Understanding"
            data={skillsData.theoreticalUnderstanding}
          />
          <SkillChart title="Ear Training" data={skillsData.earTraining} />
          <SkillChart title="Performance" data={skillsData.performance} />
          <SkillChart title="Technique" data={skillsData.technique} />
          <SkillChart
            title="Assignment Completion"
            data={skillsData.assignmentCompletion}
          />
        </div>
      </div>
    </div>
  );
}

export default Performance;
