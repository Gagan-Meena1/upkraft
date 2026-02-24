'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Course } from '../types/student.types';
import { ExpandableText } from './ExpandableText';
import ClassSelectionModal, { AssignPayload } from '@/app/components/addClass'; // adjust import path

interface ClassItem {
  _id: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface CourseEnrolledItemProps {
  course: Course;
  studentId: string;
  tutorId?: string;
}

export const CourseEnrolledItem: React.FC<CourseEnrolledItemProps> = ({
  course,
  studentId,
  tutorId,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const studentPerformanceScore = course.performanceScores?.find(
    (score) =>
      (typeof score.userId === 'string' ? score.userId : score.userId._id) === studentId
  );

  const handleOpenModal = async () => {
    setModalOpen(true);
    setLoadingClasses(true);
    setStatusMessage(null);
    try {
      console.log("Fetching classes for course:", course);
      const res = await axios.get(`/Api/tutors/courses/${course._id}`);
      setClasses(res.data?.classDetails ?? res.data ?? []);
    } catch (e) {
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleConfirm = async (payload: AssignPayload) => {
    try {
      const response = await axios.post('/Api/addStudentToCourse', {
        courseId: course._id,
        studentId,
        classIds: payload.classIds,
        // simpleMode doesn't send startDate/message/credits,
        // but they'll be empty strings/0 — safe to omit or send as-is
      });
      setStatusMessage({
        text: response.data.message || 'Classes assigned successfully!',
        type: 'success',
      });
      setModalOpen(false);
    } catch (err: any) {
      setStatusMessage({
        text: err.response?.data?.message || 'Failed to assign classes',
        type: 'error',
      });
    }
  };

  return (
    <div className="enrolled-box">
      <h4>{course.title}</h4>
      <p className="course-desc">
        <ExpandableText text={course.description} maxChars={100} />
      </p>

      {statusMessage && (
        <p className={`text-sm mt-1 ${statusMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {statusMessage.text}
        </p>
      )}

      <div className="assignments-list d-flex align-items-center gap-2 flex-wrap w-100 justify-content-between">
        <ul className="d-flex align-items-center gap-xl-4 gap-2 flex-wrap p-0 m-0 w-100">
          <li className="d-flex align-items-center gap-2">
            <span className="student-text">Sessions :</span>
            <span className="student-txt"><strong>{course.curriculum.length}</strong></span>
          </li>
          <li className="d-flex align-items-center gap-2">
            <span className="student-text">Duration :</span>
            <span className="student-txt"><strong>{course.duration}</strong></span>
          </li>
          <li className="d-flex align-items-center gap-2">
            <span className="student-text">Fee :</span>
            <span className="student-txt"><strong>Rs {course.price}</strong></span>
          </li>
          {studentPerformanceScore && (
            <li className="d-flex align-items-center gap-2">
              <span className="student-text">Performance :</span>
              <span className="student-txt">
                <strong>{Number(studentPerformanceScore.score).toFixed(1)}/10</strong>
              </span>
            </li>
          )}
        </ul>
      </div>

      <div className="right-assignment my-course-student-right mt-xxl-0 mt-3">
        <div className="student-assignment my-course-student d-flex align-items-center flex-wrap gap-xl-4 gap-2">
          <ul className="d-flex align-items-center w-full-width gap-2 list-unstyled flex-wrap m-0 p-0">
            <li>
              <Link
                href={`/tutor/viewPerformance?courseId=${course._id}&studentId=${studentId}`}
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
              >
                <span>View Performance</span>
                <svg width="23" height="24" viewBox="0 0 23 24" fill="none">
                  <path d="M7.25551 16.2428C7.13049 16.1178 7.06025 15.9482 7.06025 15.7714C7.06025 15.5946 7.13049 15.425 7.25551 15.3L13.66 8.89551L8.66973 8.89645C8.58207 8.89645 8.49527 8.87918 8.41428 8.84564C8.33329 8.81209 8.25971 8.76292 8.19773 8.70094C8.13574 8.63896 8.08657 8.56537 8.05303 8.48439C8.01948 8.4034 8.00222 8.3166 8.00222 8.22894C8.00222 8.14128 8.01948 8.05448 8.05303 7.9735C8.08657 7.89251 8.13574 7.81892 8.19773 7.75694C8.25971 7.69496 8.33329 7.64579 8.41428 7.61224C8.49527 7.5787 8.58207 7.56143 8.66973 7.56143H15.2694C15.3571 7.56132 15.4439 7.57851 15.525 7.61202C15.606 7.64552 15.6796 7.69469 15.7416 7.75669C15.8036 7.8187 15.8528 7.89233 15.8863 7.97337C15.9198 8.0544 15.937 8.14125 15.9369 8.22894L15.9369 14.8286C15.9369 14.9163 15.9196 15.0031 15.8861 15.084C15.8525 15.165 15.8034 15.2386 15.7414 15.3006C15.6794 15.3626 15.6058 15.4118 15.5248 15.4453C15.4438 15.4788 15.357 15.4961 15.2694 15.4961C15.1817 15.4961 15.0949 15.4788 15.0139 15.4453C14.933 15.4118 14.8594 15.3626 14.7974 15.3006C14.7354 15.2386 14.6862 15.165 14.6527 15.084C14.6191 15.0031 14.6019 14.9163 14.6019 14.8286L14.6028 9.83831L8.19832 16.2428C8.0733 16.3678 7.90373 16.4381 7.72692 16.4381C7.55011 16.4381 7.38054 16.3678 7.25551 16.2428Z" fill="white"/>
                </svg>
              </Link>
            </li>
            <li>
              <Link
                href={`/tutor/session-summary?studentId=${studentId}&tutorId=${tutorId}&courseId=${course._id}`}
                className="btn btn-border padding-fixed d-flex align-items-center justify-content-center gap-2"
              >
                <span>Session Summary</span>
                <svg width="23" height="24" viewBox="0 0 23 24" fill="none">
                  <path d="M7.25551 16.2428C7.13049 16.1178 7.06025 15.9482 7.06025 15.7714C7.06025 15.5946 7.13049 15.425 7.25551 15.3L13.66 8.89551L8.66973 8.89645C8.58207 8.89645 8.49527 8.87918 8.41428 8.84564C8.33329 8.81209 8.25971 8.76292 8.19773 8.70094C8.13574 8.63896 8.08657 8.56537 8.05303 8.48439C8.01948 8.4034 8.00222 8.3166 8.00222 8.22894C8.00222 8.14128 8.01948 8.05448 8.05303 7.9735C8.08657 7.89251 8.13574 7.81892 8.19773 7.75694C8.25971 7.69496 8.33329 7.64579 8.41428 7.61224C8.49527 7.5787 8.58207 7.56143 8.66973 7.56143H15.2694C15.3571 7.56132 15.4439 7.57851 15.525 7.61202C15.606 7.64552 15.6796 7.69469 15.7416 7.75669C15.8036 7.8187 15.8528 7.89233 15.8863 7.97337C15.9198 8.0544 15.937 8.14125 15.9369 8.22894L15.9369 14.8286C15.9369 14.9163 15.9196 15.0031 15.8861 15.084C15.8525 15.165 15.8034 15.2386 15.7414 15.3006C15.6794 15.3626 15.6058 15.4118 15.5248 15.4453C15.4438 15.4788 15.357 15.4961 15.2694 15.4961C15.1817 15.4961 15.0949 15.4788 15.0139 15.4453C14.933 15.4118 14.8594 15.3626 14.7974 15.3006C14.7354 15.2386 14.6862 15.165 14.6527 15.084C14.6191 15.0031 14.6019 14.9163 14.6019 14.8286L14.6028 9.83831L8.19832 16.2428C8.0733 16.3678 7.90373 16.4381 7.72692 16.4381C7.55011 16.4381 7.38054 16.3678 7.25551 16.2428Z" fill="#6E09BD"/>
                </svg>
              </Link>
            </li>

            {/* ── NEW: Manage Classes button ── */}
            <li>
              <button
                onClick={handleOpenModal}
                className="btn btn-border padding-fixed d-flex align-items-center justify-content-center gap-2"
              >
                <span>Manage Classes</span>
                <svg width="23" height="24" viewBox="0 0 23 24" fill="none">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="#6E09BD" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Class Selection Modal ── */}
      <ClassSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        classes={classes}
        loading={loadingClasses}
        courseId={course._id}
        creditsPerCourse={[]}
        simpleMode={true}        // ← hides start date / message / credits
      />
    </div>
  );
};