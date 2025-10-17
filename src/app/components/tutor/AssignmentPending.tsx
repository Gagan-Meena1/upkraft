"use client"
import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Link from "next/link";
import './FeedbackPending.css'

interface FeedbackPendingProps {
  count?: number;
  loading?: boolean;

}

const AssignmentPending: React.FC<FeedbackPendingProps> = ({ count = 0 , loading = false }) => {
const [pendingFeedbackCount, setpendingFeedbackCount] = useState<number>(0);  const value = count;
  const maxValue = 20;

  // Loading state
 if (loading) {
  return (
    <div className="text-center progress-bar-pending-sec">
      <h2 className="mb-4">Assignment Pending</h2>
      <div className="feedback-pending-sec">
        <div className="feedback-progress">
          <div className="feedback-progress-box">
            <div className="flex items-center justify-center h-32 w-32 mx-auto">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
            </div>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>

        <div className="btn btn-primary d-flex align-items-center justify-content-center gap-2 opacity-50 cursor-not-allowed">
          <span>Loading...</span>
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="text-center progress-bar-pending-sec">
        <h2 className="mb-4 !text-[20px]">Assignment</h2>
        <div className="feedback-pending-sec">
            <div className="feedback-progress">
                <div className="feedback-progress-box">
                    <CircularProgressbar
                    value={value}
                    strokeWidth={3}
                    maxValue={maxValue}
                    text={`${value}`}
                    styles={buildStyles({
                        textSize: "18px",
                        textColor: "#000",
                        pathColor: "red",
                        trailColor: "#f0f0f0",
                    })}
                    />
                </div>
                <p>Assignment</p>
            </div>

            <Link href="/student/assignments" className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
                <span>Assignment</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H20.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 19L21 12L14 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
        </div>
    </div>
  );
};

export default AssignmentPending