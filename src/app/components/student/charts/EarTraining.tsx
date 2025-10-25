import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

interface EarTrainingProps {
  feedbackData: any[];
  averageSkillScores: Record<string, number>;
  allStudentsFeedbackData?: any[];
}

const EarTraining: React.FC<EarTrainingProps> = ({
  feedbackData,
  averageSkillScores,
  allStudentsFeedbackData = [],
}) => {
  const labels = feedbackData.map((item, idx) => item.sessionNo ?? idx + 1);
  const yourScores = feedbackData.map(item => item.earTraining ?? 0);
  const topScores =
    allStudentsFeedbackData.length > 0
      ? allStudentsFeedbackData.map(item => item.earTraining ?? 0)
      : [];

  const data = {
    labels,
    datasets: [
      {
        label: "Top Score",
        data: topScores.length === labels.length ? topScores : new Array(labels.length).fill(null),
        borderColor: "#FFC357",
        backgroundColor: "rgba(246,183,60,0.3)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
      {
        label: "Your Score",
        data: yourScores,
        borderColor: "#3549F8",
        backgroundColor: "rgba(79,142,247,0.3)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Session" },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Score" },
        beginAtZero: true,
        grid: { display: false },
      },
    },
  };

  return (
    <div style={{ width: "100%", margin: "auto" }}>
      <h3 style={{ textAlign: "center" }}>Ear Training</h3>
      <Line data={data} options={options} />
    </div>
  );
};

export default EarTraining;