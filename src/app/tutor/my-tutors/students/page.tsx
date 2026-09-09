"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, Users, Info, ClipboardList, BarChart3 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import StudentInfoPopup from "@/app/components/StudentInfoPopup";
import AssignmentModal from "@/app/components/AssignmentModal";
import StudentFeedbackModal from "@/app/components/StudentFeedbackModal";

interface Course {
  _id: string;
  title: string;
  category: string;
  performanceScores?: any[];
  instructorId?: any;
  duration?: string;
}

interface Student {
  _id: string;
  username: string;
  email: string;
  contact: string;
  city?: string;
  courses: Course[];
  pendingAssignments?: number;
  assignment?: string[];
}

function StudentsContent() {
  const searchParams = useSearchParams();
  const tutorId = searchParams.get("tutorId");
  const tutorName = searchParams.get("tutorName") || "Tutor";

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Popup states
  const [studentInfoId, setStudentInfoId] = useState<string | null>(null);
  const [assignmentStudent, setAssignmentStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [feedbackStudent, setFeedbackStudent] = useState<{
    id: string;
    name: string;
    courses: Course[];
  } | null>(null);

  useEffect(() => {
    if (!tutorId) {
      setError("No tutor ID provided");
      setIsLoading(false);
      return;
    }

    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/Api/myStudents?tutorId=${tutorId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch students");
        }

        // The myStudents API returns paginated data with students array
        const studentsList = data.filteredUsers || [];
        setStudents(Array.isArray(studentsList) ? studentsList : []);
      } catch (err: any) {
        console.error("Error fetching students:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [tutorId]);

  const filteredStudents = students.filter(
    (student) =>
      student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="side-details-box">
      <div className="content-area">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <Link
              href="/tutor/my-tutors"
              className="d-flex align-items-center text-decoration-none"
              style={{ color: "#6b7280" }}
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h4
                className="mb-0 fw-bold"
                style={{ color: "#1e293b", fontSize: "1.5rem" }}
              >
                Students of {decodeURIComponent(tutorName)}
              </h4>

            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              placeholder="Search students..."
              className="form-control"
              style={{ maxWidth: "250px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div
            className="text-center p-5 rounded-3"
            style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
          >
            <p className="mb-0">{error}</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div
            className="text-center p-5 rounded-3"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <Users size={48} className="mb-3" style={{ color: "#cbd5e1" }} />
            <p className="mb-0" style={{ color: "#94a3b8" }}>
              {searchTerm
                ? "No students found matching your search."
                : "This tutor has no students yet."}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3" style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              Showing {filteredStudents.length}{" "}
              {filteredStudents.length === 1 ? "student" : "students"}
            </p>

            <div className="table-responsive">
              <table className="table table-hover align-middle" style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th className="border-0 px-3 py-3" style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Name
                    </th>


                    <th className="border-0 px-3 py-3" style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Courses
                    </th>
                    <th className="border-0 px-3 py-3 text-center" style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Attendance
                    </th>
                    <th className="border-0 px-3 py-3 text-center" style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Assignments
                    </th>
                    <th className="border-0 px-3 py-3 text-center" style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Feedback
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                    >
                      <td className="border-0 px-3 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                              width: "36px",
                              height: "36px",
                              backgroundColor: "#fef3c7",
                              color: "#f59e0b",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                            }}
                          >
                            {student.username?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>
                            {student.username}
                          </span>
                        </div>
                      </td>


                      <td className="border-0 px-3 py-3">
                        <div className="d-flex flex-wrap gap-1">
                          {student.courses && student.courses.length > 0
                            ? student.courses.slice(0, 3).map((course) => (
                              <span
                                key={course._id}
                                className="badge"
                                style={{
                                  backgroundColor: "#fef3c7",
                                  color: "#d97706",
                                  fontSize: "0.7rem",
                                  fontWeight: 500,
                                  padding: "4px 8px",
                                }}
                              >
                                {course.title}
                              </span>
                            ))
                            : <span style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>—</span>}
                          {student.courses && student.courses.length > 3 && (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "#f1f5f9",
                                color: "#64748b",
                                fontSize: "0.7rem",
                                fontWeight: 500,
                                padding: "4px 8px",
                              }}
                            >
                              +{student.courses.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Attendance column */}
                      <td className="border-0 px-3 py-3 text-center">
                        <button
                          onClick={() => setStudentInfoId(student._id)}
                          className="btn btn-sm d-inline-flex align-items-center gap-1"
                          style={{
                            backgroundColor: "#8b5cf6",
                            color: "#ffffff",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            border: "none",
                          }}
                        >
                          <Info size={14} />
                          View
                        </button>
                      </td>

                      {/* Assignments column */}
                      <td className="border-0 px-3 py-3 text-center">
                        <button
                          onClick={() =>
                            setAssignmentStudent({
                              id: student._id,
                              name: student.username,
                            })
                          }
                          className="btn btn-sm d-inline-flex align-items-center gap-1"
                          style={{
                            backgroundColor: (student.pendingAssignments || 0) > 0 ? "#f59e0b" : "#3b82f6",
                            color: "#ffffff",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            border: "none",
                          }}
                        >
                          <ClipboardList size={14} />
                          {(student.pendingAssignments || 0) > 0
                            ? `${student.pendingAssignments} Pending`
                            : "View"}
                        </button>
                      </td>

                      {/* Feedback column */}
                      <td className="border-0 px-3 py-3 text-center">
                        <button
                          onClick={() =>
                            setFeedbackStudent({
                              id: student._id,
                              name: student.username,
                              courses: student.courses || [],
                            })
                          }
                          className="btn btn-sm d-inline-flex align-items-center gap-1"
                          style={{
                            backgroundColor: "#7c3aed",
                            color: "#ffffff",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            border: "none",
                          }}
                        >
                          <BarChart3 size={14} />
                          Feedback
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Student Info Popup (Attendance & Package details — hide payment for tutor trainer) */}
      {studentInfoId && (
        <StudentInfoPopup
          studentId={studentInfoId}
          onClose={() => setStudentInfoId(null)}
          hidePayment={true}
          hideContactDetails={true}
        />
      )}

      {/* Assignment Modal */}
      {assignmentStudent && (
        <AssignmentModal
          studentId={assignmentStudent.id}
          studentName={assignmentStudent.name}
          onClose={() => setAssignmentStudent(null)}
        />
      )}

      {/* Feedback Modal */}
      {feedbackStudent && (
        <StudentFeedbackModal
          studentId={feedbackStudent.id}
          studentName={feedbackStudent.name}
          courses={feedbackStudent.courses}
          onClose={() => setFeedbackStudent(null)}
        />
      )}
    </div>
  );
}

export default function TutorStudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="side-details-box">
          <div className="content-area d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      }
    >
      <StudentsContent />
    </Suspense>
  );
}
