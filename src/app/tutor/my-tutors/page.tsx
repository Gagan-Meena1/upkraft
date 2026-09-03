"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Users, Eye } from "lucide-react";

interface TutorItem {
  _id: string;
  username: string;
  email: string;
  contact?: string;
  city?: string;
  state?: string;
  courses?: { _id: string; title: string; category: string }[];
  students?: string[];
}

export default function MyTutorsPage() {
  const [tutors, setTutors] = useState<TutorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/Api/tutor-trainer/my-tutors");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch tutors");
        }

        setTutors(data.tutors || []);
      } catch (err: any) {
        console.error("Error fetching tutors:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutors();
  }, []);

  const filteredTutors = tutors.filter(
    (tutor) =>
      tutor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="side-details-box">
      <div className="content-area">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <Link
              href="/tutor"
              className="d-flex align-items-center text-decoration-none"
              style={{ color: "#6b7280" }}
            >
              <ChevronLeft size={20} />
            </Link>
            <h4
              className="mb-0 fw-bold"
              style={{ color: "#1e293b", fontSize: "1.5rem" }}
            >
              My Tutors
            </h4>
          </div>
          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              placeholder="Search tutors..."
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
        ) : filteredTutors.length === 0 ? (
          <div
            className="text-center p-5 rounded-3"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <Users size={48} className="mb-3" style={{ color: "#cbd5e1" }} />
            <p className="mb-0" style={{ color: "#94a3b8" }}>
              {searchTerm
                ? "No tutors found matching your search."
                : "No tutors assigned to you yet."}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3" style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              Showing {filteredTutors.length}{" "}
              {filteredTutors.length === 1 ? "tutor" : "tutors"}
            </p>

            <div className="table-responsive">
              <table className="table table-hover align-middle" style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th className="border-0 px-3 py-3" style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Name
                    </th>
                    <th className="border-0 px-3 py-3" style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Email
                    </th>
                    <th className="border-0 px-3 py-3" style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Contact
                    </th>
                    <th className="border-0 px-3 py-3" style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      City
                    </th>
                    <th className="border-0 px-3 py-3" style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Courses
                    </th>
                    <th className="border-0 px-3 py-3 text-center" style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Students
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTutors.map((tutor) => (
                    <tr
                      key={tutor._id}
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
                              backgroundColor: "#f1f5f9",
                              color: "#3b82f6",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                            }}
                          >
                            {tutor.username.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>
                            {tutor.username}
                          </span>
                        </div>
                      </td>
                      <td className="border-0 px-3 py-3" style={{ color: "#64748b", fontSize: "0.875rem" }}>
                        {tutor.email}
                      </td>
                      <td className="border-0 px-3 py-3" style={{ color: "#64748b", fontSize: "0.875rem" }}>
                        {tutor.contact || "—"}
                      </td>
                      <td className="border-0 px-3 py-3" style={{ color: "#64748b", fontSize: "0.875rem" }}>
                        {tutor.city || "—"}
                      </td>
                      <td className="border-0 px-3 py-3">
                        <div className="d-flex flex-wrap gap-1">
                          {tutor.courses && tutor.courses.length > 0
                            ? tutor.courses.slice(0, 2).map((course) => (
                                <span
                                  key={course._id}
                                  className="badge"
                                  style={{
                                    backgroundColor: "#eff6ff",
                                    color: "#3b82f6",
                                    fontSize: "0.7rem",
                                    fontWeight: 500,
                                    padding: "4px 8px",
                                  }}
                                >
                                  {course.title}
                                </span>
                              ))
                            : <span style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>—</span>}
                          {tutor.courses && tutor.courses.length > 2 && (
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
                              +{tutor.courses.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border-0 px-3 py-3 text-center">
                        <Link
                          href={`/tutor/my-tutors/students?tutorId=${tutor._id}&tutorName=${encodeURIComponent(tutor.username)}`}
                          className="btn btn-sm d-inline-flex align-items-center gap-1"
                          style={{
                            backgroundColor: "#3b82f6",
                            color: "#ffffff",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            textDecoration: "none",
                            border: "none",
                          }}
                        >
                          <Eye size={14} />
                          Students
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
