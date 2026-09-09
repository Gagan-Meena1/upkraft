"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./StudentFeedbackModal.css";

interface PerformanceScore {
  userId: string | { _id: string; username: string };
  score: number;
  date: string;
}

interface CourseWithPerformance {
  _id: string;
  title: string;
  category?: string;
  duration?: string;
  performanceScores?: PerformanceScore[];
  instructorId?: string | { _id: string; username: string };
}

interface StudentFeedbackModalProps {
  studentId: string;
  studentName: string;
  /** If courses are already available (from myStudents API), pass them to avoid an extra fetch */
  courses?: CourseWithPerformance[];
  onClose: () => void;
}

function getStudentScore(
  course: CourseWithPerformance,
  studentId: string
): number | null {
  const found = course.performanceScores?.find((s) => {
    const uid = typeof s.userId === "string" ? s.userId : s.userId?._id;
    return uid === studentId;
  });
  return found ? found.score : null;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="sfm-score-badge sfm-score-badge--none">No score yet</span>;
  }

  const val = Number(score);
  let modifier = "sfm-score-badge--low";
  let label = "Needs Work";

  if (val >= 8) {
    modifier = "sfm-score-badge--excellent";
    label = "Excellent";
  } else if (val >= 6) {
    modifier = "sfm-score-badge--good";
    label = "Good";
  } else if (val >= 4) {
    modifier = "sfm-score-badge--average";
    label = "Average";
  }

  return (
    <span className={`sfm-score-badge ${modifier}`}>
      ★ {val.toFixed(1)}/10 · {label}
    </span>
  );
}

export default function StudentFeedbackModal({
  studentId,
  studentName,
  courses: propCourses,
  onClose,
}: StudentFeedbackModalProps) {
  const [courses, setCourses] = useState<CourseWithPerformance[]>(propCourses || []);
  const [loading, setLoading] = useState(!propCourses);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propCourses) return;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/Api/studentCourses?studentId=${studentId}`);
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [studentId, propCourses]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const initials = studentName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="sfm-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sfm-modal">
        {/* Header */}
        <div className="sfm-header">
          <div className="sfm-header-inner">
            <div className="sfm-header-left">
              <div className="sfm-avatar">{initials}</div>
              <div>
                <h3 className="sfm-name">{studentName}</h3>
                <p className="sfm-subtitle">Performance &amp; Feedback</p>
              </div>
            </div>
            <button className="sfm-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="sfm-body">
          {loading ? (
            <div className="sfm-loading">
              <div className="sfm-spinner" />
            </div>
          ) : error ? (
            <div className="sfm-error">{error}</div>
          ) : courses.length === 0 ? (
            <div className="sfm-empty">
              <div className="sfm-empty-icon">📚</div>
              <p className="sfm-empty-text">No courses found for this student</p>
            </div>
          ) : (
            <div className="sfm-course-list">
              {courses.map((course) => {
                const score = getStudentScore(course, studentId);
                const tutorId =
                  typeof course.instructorId === "string"
                    ? course.instructorId
                    : course.instructorId?._id;

                return (
                  <div key={course._id} className="sfm-course-card">
                    {/* Course header row */}
                    <div className="sfm-course-header">
                      <div className="sfm-course-info">
                        <h4 className="sfm-course-title">{course.title}</h4>
                        <div className="sfm-course-meta">
                          {course.category && (
                            <span className="sfm-category-tag">{course.category}</span>
                          )}
                          {course.duration && (
                            <span className="sfm-duration">{course.duration}</span>
                          )}
                        </div>
                      </div>
                      <ScoreBadge score={score} />
                    </div>

                    {/* Action buttons */}
                    <div className="sfm-actions">
                      {/* <Link
                        href={`/tutor/viewPerformance?courseId=${course._id}&studentId=${studentId}`}
                        className="sfm-btn-primary"
                      >
                        📊 View Performance
                      </Link> */}
                      {tutorId && (
                        <Link
                          href={`/tutor/session-summary?studentId=${studentId}&tutorId=${tutorId}&courseId=${course._id}`}
                          className="sfm-btn-secondary"
                        >
                          📋 Session Summary
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
