"use client"
import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Link from "next/link";
import './FeedbackPending.css'

interface FeedbackPendingProps {
  count?: number;
}

const FeedbackPending: React.FC<FeedbackPendingProps> = ({ count = 0 }) => {
const [pendingFeedbackCount, setpendingFeedbackCount] = useState<number>(0);  const value = count;
  const maxValue = 20;

  return (
    <div className="text-center progress-bar-pending-sec">
        <h2 className="mb-4">Feedback Pending</h2>
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
                <p>Feedback Pending</p>
            </div>

            <Link href="/tutor/feedback-pending" className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
                <span>Give Feedback</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H20.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 19L21 12L14 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
        </div>
    </div>
  );
};

export default FeedbackPending