// StatsCardsContainer.tsx
import React from "react";
import StatsCard from "./StatsCard";

interface StatsCardsContainerProps {
  studentCount: number;
  assignmentCompletionPercentage: number;
  averageCSATRating: number;
}

const StatsCardsContainer: React.FC<StatsCardsContainerProps> = ({
  studentCount,
  assignmentCompletionPercentage,
  averageCSATRating,
}) => {
  return (
    <div className="col-xxl-4 col-md-12 order-xxl-2 order-sm-2 order-md-3 mb-4">
      <div className="details-student-box">
        <div className="row">
          <StatsCard
            value={studentCount}
            label="Total Active Students"
          />
          
          <StatsCard
            value={assignmentCompletionPercentage}
            label="Assignment Completion %"
            showPercentage
          />
          
          <StatsCard
            value={averageCSATRating}
            label="Tutor Rating"
            type="rating"
            rating={averageCSATRating}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsCardsContainer;