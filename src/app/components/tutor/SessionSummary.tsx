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
  totalAssignments?: number;
  completedAssignments?: number;
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
    const [classesCSAT, setClassesCSAT] = useState<Map<string, number | null>>(new Map());


  // Helper: choose endpoint by category (Music default)
  const getFeedbackEndpoint = (category?: string) => {
    switch ((category || '').toLowerCase()) {
      case 'dance':
        return '/Api/studentFeedbackForTutor/dance';
      case 'drawing':
        return '/Api/studentFeedbackForTutor/drawing';
      default:
        return '/Api/studentFeedbackForTutor'; // Music
    }
  };

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);

        // 1) Get tutor’s courses shared with this student (must include category)
        const tutorRes = await fetch(`/Api/tutorInfoForStudent?tutorId=${tutorId}`);
        const tutorJson = await tutorRes.json();
        const courses = Array.isArray(tutorJson?.courses) ? tutorJson.courses : [];
        if (!courses.length) {
          setSessions([]);
          return;
        }

        // 2) Fetch class meta
        const classesRes = await fetch(`/Api/getClasses?tutorId=${tutorId}`);
        const classesJson = await classesRes.json();
                const csatMap = new Map<string, number | null>();

        const classMeta = new Map<string, { title?: string; startTime?: string }>();
        const classIds: string[] = [];
        if (classesJson?.success && Array.isArray(classesJson.classes)) {
          classesJson.classes.forEach((cls: any) => {
                        const avgCSAT = calculateAverageCSAT(cls.csat || []);

            const id = String(cls._id);
                        csatMap.set(id, avgCSAT);

            classMeta.set(id, { title: cls.title, startTime: cls.startTime });
            classIds.push(id);
          });
        }

        // 3) For each class, fetch assignment stats for this student
        const statsEntries = await Promise.all(
          classIds.map(async (id) => {
            try {
              const res = await fetch(`/Api/sessionSummary?classId=${id}&studentId=${studentId}`);
              if (!res.ok) {
                return [id, { total: 0, completed: 0 }] as const;
              }
              const d = await res.json();
              console.log("Fetched stats for classId ", id, ": ", d);
              return [id, { total: Number(d.totalStudentAssignments || 0), completed: Number(d.completedAssignments || 0) }] as const;
            } catch {
              return [id, { total: 0, completed: 0 }] as const;
            }
          })
        );
        const statsMap = new Map<string, { total: number; completed: number }>(statsEntries);

        // 4) Fetch feedback per course using category-specific endpoint
        const feedbackResults = await Promise.all(
          courses.map(async (c: any) => {
            const endpoint = getFeedbackEndpoint(c?.category);
            try {
              const res = await fetch(`${endpoint}?courseId=${c._id}&studentId=${studentId}`);
              if (!res.ok) return null;
              return await res.json();
            } catch {
              return null;
            }
          })
        );

        // 5) Flatten and normalize to table rows, enrich with assignment stats
        const rows: SessionFeedback[] = [];
        feedbackResults.forEach((fj: any) => {
          if (fj?.success && Array.isArray(fj.data)) {
            fj.data.forEach((item: any, idx: number) => {
              const classIdRaw =
                item.class?._id || item.classId?._id || item.classId || item.class || null;
              const classId = classIdRaw ? String(classIdRaw) : undefined;

              const meta = classId ? classMeta.get(classId) : undefined;
              const start = meta?.startTime || item.class?.startTime || item.createdAt;

              const stat = classId ? statsMap.get(classId) : undefined;
              const totalStudentAssignments = stat?.total ?? 0;
              const completedAssignments = stat?.completed ?? 0;

              rows.push({
                _id: String(item._id),
                classId,
                classTitle:
                  item.class?.title ||
                  item.classId?.title ||
                  meta?.title ||
                  `Session ${idx + 1}`,
                date: start ? new Date(start).toLocaleDateString() : '',
                performanceScore: Number(item.performance ?? 0),
                qualityScore: Number(item.qualityScore ?? 0),
                tutorCSAT: classId ? (csatMap.get(classId) ?? null) : null,
                assignmentCompletionRate: 0,
                tutorFeedback: item.personalFeedback ?? item.feedback ?? '',
                totalAssignments: totalStudentAssignments,
                completedAssignments: completedAssignments,
              });
            });
          }
        });

        // Sort by date desc
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

                  <th className='text-center'>Assignments (Completed/Total)</th>
                  <th>Performance Feedback</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7}>Loading...</td></tr>
                ) : sessions.length === 0 ? (
                  <tr><td colSpan={7}>No sessions found.</td></tr>
                ) : (
                  sessions.map(session => (
                    <tr key={session._id}>
                      <td>{session.classTitle}</td>
                      <td>{session.date}</td>
                      <td className='text-center'>{session.performanceScore}/<span>10</span></td>
                      <td className='text-center'>{session.qualityScore}/<span>10</span></td>
                      <td className='text-center'>
                        {session.tutorCSAT !== null && session.tutorCSAT > 0 ? (
                          <StarRating rating={session.tutorCSAT} />
                        ) : (
                          <span className="text-muted small">Not Rated</span>
                        )}
                      </td>
                      <td className='text-center'>
                        {(session.completedAssignments ?? 0)} / {(session.totalAssignments ?? 0)}
                      </td>
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