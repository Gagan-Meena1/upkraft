// StatsCard.tsx
import React from "react";

interface StatsCardProps {
  value: string | number;
  label: string;
  type?: "default" | "rating";
  rating?: number;
  showPercentage?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  type = "default",
  rating = 0,
  showPercentage = false,
}) => {
  const renderStars = () => {
    return (
      <div className="stars-container mb-2 d-flex justify-content-left">
        {[...Array(5)].map((_, index) => (
          <span key={index} className="star-icon mx-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={index < Math.floor(rating) ? "#FFD700" : "#E0E0E0"}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke={index < Math.floor(rating) ? "#FFD700" : "#E0E0E0"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="col-md-12 mb-3">
      <div className="card-box">
        {type === "rating" ? (
          <div className="d-flex flex-column align-items-left">
            {renderStars()}
            <h2 className="top-text">
              {rating > 0 ? `${rating}/5.0` : "No ratings yet"}
            </h2>
            <p className="bottom-text">{label}</p>
          </div>
        ) : (
          <>
            <h2 className="top-text">
              {value}
              {showPercentage && "%"}
            </h2>
            <p className="bottom-text">{label}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default StatsCard;