import React from "react";

interface DataPoint {
  week: number;
  yourScore: number;
  topScore: number;
}

interface SkillChartProps {
  title: string;
  data: DataPoint[];
}

const SkillChart: React.FC<SkillChartProps> = ({ title, data }) => {
  const maxScore = 10;
  const chartHeight = 240;
  const chartWidth = 320;
  const padding = 50;

  // Catmull–Rom to Bézier smoothing
  const createSmoothPath = (points: number[], isArea = false) => {
    if (points.length < 2) return "";

    const coords = points.map((score, index) => ({
      x: padding + (index * (chartWidth - 2 * padding)) / (points.length - 1),
      y:
        chartHeight -
        padding -
        (score / maxScore) * (chartHeight - 2 * padding),
    }));

    let d = `M ${coords[0].x} ${coords[0].y}`;

    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i - 1] || coords[i];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    if (isArea) {
      const lastX = coords[coords.length - 1].x;
      const firstX = coords[0].x;
      const bottomY = chartHeight - padding;
      d += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    }

    return d;
  };

  const yourScores = data.map((d) => d.yourScore);
  const topScores = data.map((d) => d.topScore);

  return (
    <div className="">
      {/* Title */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          {title}
        </h3>
      </div>

      {/* Chart */}
      <div className="flex justify-center">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="overflow-visible"
        >
          {/* Tick marks on Y axis */}
          {[0, 2, 4, 6, 8, 10].map((value) => {
            const y =
              chartHeight -
              padding -
              (value / maxScore) * (chartHeight - 2 * padding);
            return (
              <g key={value}>
                <line
                  x1={padding - 5}
                  y1={y}
                  x2={padding}
                  y2={y}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Tick marks on X axis */}
          {[0, 2, 4, 6, 8, 10].map((value, index) => {
            const x = padding + (index * (chartWidth - 2 * padding)) / 5;
            return (
              <g key={value}>
                <line
                  x1={x}
                  y1={chartHeight - padding}
                  x2={x}
                  y2={chartHeight - padding + 5}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={chartHeight - padding + 18}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Areas */}
          <path
            d={createSmoothPath(topScores, true)}
            fill="#FBBF24"
            fillOpacity={0.4}
          />
          <path
            d={createSmoothPath(yourScores, true)}
            fill="#3B82F6"
            fillOpacity={0.4}
          />

          {/* Lines */}
          <path
            d={createSmoothPath(topScores)}
            stroke="#FBBF24"
            strokeWidth="3"
            fill="none"
          />
          <path
            d={createSmoothPath(yourScores)}
            stroke="#3B82F6"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>

      {/* X-axis label */}
      <div className="text-center mt-2">
        <span className="text-sm text-gray-500">Score</span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-600">Your Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-sm text-gray-600">Top Score</span>
        </div>
      </div>
    </div>
  );
};

export default SkillChart;
