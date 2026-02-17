"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "react-bootstrap";
import { RateClassForm } from "../student/rateClass/page";

interface SessionFeedback {
  _id: string;
  classId?: string;
  classTitle: string;
  date: string;
  performanceScore: number;
  qualityScore: number;
  tutorCSAT: number | null;
  assignmentCompletionRate: number;
  tutorFeedback: string;
  tutorName?: string; // ✅ Add tutor name to identify which tutor
}

const calculateAverageCSAT = (
  csatArray: Array<{ userId: any; rating: number }>
) => {
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
        <span key={`full-${i}`} className="text-warning">
          ★
        </span>
      ))}
      {hasHalfStar && <span className="text-warning">⯨</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="text-muted">
          ☆
        </span>
      ))}
      <span className="ms-1 small text-muted">({rating.toFixed(1)})</span>
    </div>
  );
};

const SessionSummary = ({
  studentId,
  tutorIds, // ✅ Changed from tutorId to tutorIds array
}: {
  studentId: string;
  tutorIds: string[]; // ✅ Now accepts array of tutor IDs
}) => {
  const [sessions, setSessions] = useState<SessionFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [classesCSAT, setClassesCSAT] = useState<Map<string, number | null>>(
    new Map()
  );
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();

  // Helper: choose endpoint by category
  const getFeedbackEndpoint = (category?: string) => {
    switch ((category || "").toLowerCase()) {
      case "dance":
        return "/Api/studentFeedbackForTutor/dance";
      case "drawing":
        return "/Api/studentFeedbackForTutor/drawing";
      default:
        return "/Api/studentFeedbackForTutor"; // Music
    }
  };

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);

        // ✅ Return early if no tutors
        if (!tutorIds || tutorIds.length === 0) {
          setSessions([]);
          setLoading(false);
          return;
        }

        const allSessions: SessionFeedback[] = [];
        const csatMap = new Map<string, number | null>();

        // ✅ Loop through each tutor ID
        for (const tutorId of tutorIds) {
          if (!tutorId) continue;

          // 1) Get tutor's courses shared with this student
          const tutorRes = await fetch(
            `/Api/tutorInfoForStudent?tutorId=${tutorId}`
          );
         const tutorJson = await tutorRes.json();

// Find the tutor's data in the map
const tutorCourseData = tutorJson?.tutorCoursesMap?.find(
  (item: any) => item.tutorId === tutorId
);

const tutorName = tutorCourseData?.tutorName || 'Unknown Tutor';
const courses = tutorCourseData?.courses || [];
          
          if (!courses.length) continue;

          // 2) Fetch class meta and CSAT for this tutor
          const classesRes = await fetch(`/Api/getClasses?tutorId=${tutorId}`);
          const classesJson = await classesRes.json();
          const classMeta = new Map<
            string,
            { title: string; startTime: string }
          >();

          if (classesJson?.success && Array.isArray(classesJson.classes)) {
            classesJson.classes.forEach((cls: any) => {
              const avgCSAT = calculateAverageCSAT(cls.csat || []);
              const id = String(cls._id);
              csatMap.set(id, avgCSAT);
              classMeta.set(id, { title: cls.title, startTime: cls.startTime });
            });
          }

          // 3) Fetch feedback per course using category-specific endpoint
          const feedbackResults = await Promise.all(
            courses.map(async (c: any) => {
              const endpoint = getFeedbackEndpoint(c?.category);
              try {
                const res = await fetch(
                  `${endpoint}?courseId=${c._id}&studentId=${studentId}`
                );
                if (!res.ok) return null;
                return await res.json();
              } catch {
                return null;
              }
            })
          );

          // 4) Flatten and normalize to table rows
          feedbackResults.forEach((fj: any) => {
            if (fj?.success && Array.isArray(fj.data)) {
              fj.data.forEach((item: any, idx: number) => {
                const classIdRaw =
                  item.class?._id ||
                  item.classId?._id ||
                  item.classId ||
                  item.class ||
                  null;
                const classId = classIdRaw ? String(classIdRaw) : undefined;

                const meta = classId ? classMeta.get(classId) : undefined;
                const start =
                  meta?.startTime || item.class?.startTime || item.createdAt;

                allSessions.push({
                  _id: String(item._id),
                  classId,
                  classTitle:
                    item.class?.title ||
                    item.classId?.title ||
                    meta?.title ||
                    `Session ${idx + 1}`,
                  date: start ? new Date(start).toLocaleDateString() : "",
                  performanceScore: Number(item.performance ?? 0),
                  qualityScore: Number(item.qualityScore ?? 0),
                  tutorCSAT: classId ? csatMap.get(classId) ?? null : null,
                  assignmentCompletionRate: Number(
                    item.assignmentCompletionRate ?? 0
                  ),
                  tutorFeedback: item.personalFeedback ?? item.feedback ?? "",
                  tutorName, // ✅ Add tutor name
                });
              });
            }
          });
        }

        // ✅ Update the CSAT map with all collected data
        setClassesCSAT(csatMap);

        // Sort by date desc
        allSessions.sort(
          (a, b) =>
            (new Date(b.date).getTime() || 0) -
            (new Date(a.date).getTime() || 0)
        );
        
        setSessions(allSessions);
      } catch (error) {
        console.error("Error fetching session summary:", error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }
    
    if (studentId && tutorIds.length > 0) {
      fetchSummary();
    }
  }, [studentId, tutorIds]);

  return (
    <div className="card-box">
      <div className="library-list-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap overflow-x-auto">
          <div className="left-head w-100">
            <h2 className="m-0">Session Summary</h2>
            {/* ✅ Show count of tutors */}
            {tutorIds.length > 0 && (
              <p className="text-muted small mb-0">
                Showing sessions from {tutorIds.length} tutor{tutorIds.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="table-sec w-100 assignments-list-box">
          <div className="table-responsive overflow-x-auto w-full">
            <table className="table align-middle m-0 min-w-[1000px]">
              <thead>
                <tr>
                  <th>Session Title</th>
                  <th>Tutor</th> {/* ✅ Add tutor column */}
                  <th>Date</th>
                  <th className="text-center">Performance Score</th>
                  <th className="text-center">Session Quality Score</th>
                  <th className="text-center">Tutor CSAT</th>
                  <th className="text-center">Assignment Completion Rate</th>
                  <th>Performance Feedback</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9}>Loading...</td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={9}>No sessions found.</td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <React.Fragment key={session._id}>
                      <tr>
                        <td>{session.classTitle}</td>
                        <td>{session.tutorName}</td> {/* ✅ Display tutor name */}
                        <td>{session.date}</td>
                        <td className="text-center">
                          {session.performanceScore}/<span>10</span>
                        </td>
                        <td className="text-center">
                          {session.qualityScore}/<span>10</span>
                        </td>
                        <td className="text-center">
                          {session.tutorCSAT !== null ? (
                            <StarRating rating={session.tutorCSAT} />
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedClassId(session.classId);
                                setShowRateModal(true);
                              }}
                            >
                              Give Rating
                            </button>
                          )}
                        </td>
                        <td className="text-center">
                          {session.assignmentCompletionRate}%
                        </td>
                        <td>{session.tutorFeedback}</td>
                        <td>
                          <Link
                            href={`/student`}
                            className="btn btn-primary d-flex align-items-center gap-2 justify-content-center small"
                          >
                            <span>Notify</span>
                          </Link>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Move modal outside the map */}
      <Modal
        show={showRateModal}
        onHide={() => setShowRateModal(false)}
        centered
        backdrop
      >
        <style jsx global>{`
          .modal-backdrop.show {
            background-color: rgba(0, 0, 0, 0.15);
          }
        `}</style>

        <Modal.Header closeButton />
        <Modal.Body>
          <RateClassForm
            classId={selectedClassId}
            isModal
            onSuccess={() => setShowRateModal(false)}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SessionSummary;