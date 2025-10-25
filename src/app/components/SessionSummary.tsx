"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface SessionFeedback {
  _id: string;
  classId?: string; // Add this to link feedback to class
  classTitle: string;
  date: string;
  performanceScore: number;
  qualityScore: number;
  tutorCSAT: number | null; // Change from string to number | null
  assignmentCompletionRate: number;
  tutorFeedback: string;
}

const calculateAverageCSAT = (csatArray: Array<{ userId: any; rating: number }>) => {
  if (!csatArray || csatArray.length === 0) return null;
  const sum = csatArray.reduce((acc, item) => acc + item.rating, 0);
  return sum / csatArray.length;
};

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="d-flex align-items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="text-warning">★</span>
      ))}
      {hasHalfStar && <span className="text-warning">⯨</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="text-muted">☆</span>
      ))}
      <span className="ms-1 small text-muted">({rating.toFixed(1)})</span>
    </div>
  );
};

const SessionSummary = ({ studentId, tutorId }: { studentId: string, tutorId: string }) => {
  const [sessions, setSessions] = useState<SessionFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [classesCSAT, setClassesCSAT] = useState<Map<string, number | null>>(new Map()); // Add this


  useEffect(() => {
  async function fetchSummary() {
    try {
      setLoading(true);

      // 1) Get tutor courses (existing code)
      const tutorRes = await fetch(`/Api/tutorInfoForStudent?tutorId=${tutorId}`);
      const tutorJson = await tutorRes.json();
      const courses = Array.isArray(tutorJson?.courses) ? tutorJson.courses : [];

      if (!courses.length) {
        setSessions([]);
        setLoading(false);
        return;
      }

      // 2) Fetch feedback per course for this student (existing code)
      const feedbackResults = await Promise.all(
        courses.map((c: any) =>
          fetch(`/Api/studentFeedbackForTutor?courseId=${c._id}&studentId=${studentId}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        )
      );

      // 3) Fetch classes for CSAT data (NEW)
      const classesRes = await fetch(`/Api/getClasses?tutorId=${tutorId}`);
      const classesJson = await classesRes.json();
      
      // Create a map of classId -> average CSAT
      const csatMap = new Map<string, number | null>();
      if (classesJson.success && Array.isArray(classesJson.classes)) {
        classesJson.classes.forEach((cls: any) => {
          const avgCSAT = calculateAverageCSAT(cls.csat || []);
          csatMap.set(cls._id.toString(), avgCSAT);
        });
      }
      setClassesCSAT(csatMap);

      // 4) Flatten and map to table rows (existing code with modification)
      const rows: SessionFeedback[] = [];
      feedbackResults.forEach((fj: any) => {
        if (fj?.success && Array.isArray(fj.data)) {
          fj.data.forEach((item: any, idx: number) => {
            const classId = item.class?._id || item.classId?._id || item.classId;
            rows.push({
              _id: item._id,
              classId: classId?.toString(), // Store classId to look up CSAT
              classTitle: item.class?.title || item.classId?.title || `Session ${idx + 1}`,
              date: item.class?.startTime
                ? new Date(item.class.startTime).toLocaleDateString()
                : (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""),
              performanceScore: Number(item.performance ?? 0),
              qualityScore: Number(item.qualityScore ?? 0),
              tutorCSAT: classId ? (csatMap.get(classId.toString()) ?? null) : null, // Get CSAT from map
              assignmentCompletionRate: Number(item.assignmentCompletionRate ?? 0),
              tutorFeedback: item.personalFeedback ?? item.feedback ?? "",
            });
          });
        }
      });

      // Optional: sort by date desc
      rows.sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0));

      setSessions(rows);
    } finally {
      setLoading(false);
    }
  }
  if (studentId && tutorId) fetchSummary();
}, [studentId, tutorId]);

  return (
    <div className='card-box'>
      <div className='library-list-sec'>
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap overflow-x-auto">
          <div className='left-head w-100'>
            <h2 className='m-0'>Session Summary</h2>
          </div>
        </div>
        <div className='table-sec w-100 assignments-list-box'>
          <div className="table-responsive overflow-x-auto w-full">
            <table className="table align-middle m-0 min-w-[1000px]">
              <thead>
                <tr>
                  <th>Session Title</th>
                  <th>Date</th>
                  <th className='text-center'>Performance Score</th>
                  <th className='text-center'>Session Quality Score</th>
                  <th className='text-center'>Tutor CSAT</th>
                  <th className='text-center'>Assignment Completion Rate</th>
                  <th>Tutor Feedback / Remarks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8}>Loading...</td></tr>
                ) : sessions.length === 0 ? (
                  <tr><td colSpan={8}>No sessions found.</td></tr>
                ) : (
                  sessions.map(session => (
                    <tr key={session._id}>
                      <td>{session.classTitle}</td>
                      <td>{session.date}</td>
                      <td className='text-center'>{session.performanceScore}/<span>10</span></td>
                      <td className='text-center'>{session.qualityScore}/<span>10</span></td>
                      <td className='text-center'>
                      {session.tutorCSAT !== null ? (
                        <StarRating rating={session.tutorCSAT} />
                      ) : (
                        <Link 
                          href={`/student/rateClass?classId=${session.classId}`} 
                          className='btn btn-sm btn-outline-primary'
                        >
                          Give Rating
                        </Link>
                      )}
                    </td>
                      <td className='text-center'>{session.assignmentCompletionRate}%</td>
                      <td>{session.tutorFeedback}</td>
                      <td>
                        <Link href={`/tutor`} className='btn btn-primary d-flex align-items-center gap-2 justify-content-center small'>
                          <span>Notify</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionSummary