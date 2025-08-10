import React from 'react';

interface PerformanceMetricProps {
  title: string;
  score: number;
  maxScore?: number;
  color: string;
}

const PerformanceMetric: React.FC<PerformanceMetricProps> = ({ 
  title, 
  score, 
  maxScore = 10, 
  color 
}) => {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{title}</span>
      <div className="flex items-center gap-3">
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-800 min-w-[2rem]">
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

export default PerformanceMetric;