import React from "react";
import {
  CircularProgressbar,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import './SemiCircleProgress.css'

interface SemiCircleProgressProps {
  value: number; 
  label: string; 
}

const SemiCircleProgress = ({ value, label }: SemiCircleProgressProps) => {
  const percentage = (value / 10) * 100; 

  return (
    <div className="progressbar-helf  text-center">
    <p className="label-text mb-4" >
      {label}
    </p>
    <div className="progress-bodt-text">
      <div className="half-circle-progressbar">
        <CircularProgressbar
          value={percentage}
          strokeWidth={6}
          circleRatio={0.5}
          styles={buildStyles({
            rotation: 0.75, 
            strokeLinecap: "round",
            pathColor: "#fbbf24",
            trailColor: "#fdf4e3",
          })}
        />
      </div>

      <div className="progress-value">
        {value}
        <span className="pregree-devide">
          /10
        </span>
      </div>
    </div>
    </div>
  );
};

export default SemiCircleProgress 
