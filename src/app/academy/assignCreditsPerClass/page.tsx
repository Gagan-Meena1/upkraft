"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Form, Button } from "react-bootstrap";
import Image from "next/image";
import Profile from "../../../assets/Mask-profile.png";

const AssignCreditsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get("studentId");
  
  // Get student data from URL params (passed from StudentTable)
  const studentName = searchParams.get("studentName");
  const studentEmail = searchParams.get("studentEmail");
  const studentImage = searchParams.get("studentImage");

  const [courses, setCourses] = useState([]);
  const [creditsData, setCreditsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  

  // Fetch courses for this student
  useEffect(() => {
    if (!studentId) {
      setError("No student ID provided");
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Use the existing course API with studentId as tutorId
        const response = await fetch(`/Api/tutors/courses?tutorId=${studentId}`);
        
        if (!response.ok) throw new Error("Failed to fetch courses");
        
        const data = await response.json();
        setCourses(data.course || []);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [studentId]);

  // Handle credit input change
  const handleCreditChange = (courseId, value) => {
    const numValue = parseInt(value) || 0;
    setCreditsData((prev) => ({
      ...prev,
      [courseId]: numValue,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Format data for API - array of {courseId, credits}
      const creditsPerCourse = Object.entries(creditsData)
        .filter(([_, credits]) => credits > 0) // Only include courses with credits > 0
        .map(([courseId, credits]) => ({
          courseId,
          credits,
        }));

      if (creditsPerCourse.length === 0) {
        setError("Please assign credits to at least one course");
        setSaving(false);
        return;
      }

      const response = await fetch("/Api/academy/creditsPerCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          creditsPerCourse,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update credits");
      }

      const result = await response.json();
      console.log("Credits updated successfully:", result);
      
      setSuccess(true);
      
      // Redirect back after 2 seconds
      setTimeout(() => {
        router.push("/academy/students");
      }, 2000);
    } catch (err) {
      console.error("Error saving credits:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-purple" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card-box">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Assign Credits Per Course</h2>
              <button
                onClick={() => router.push("/academy/students")}
                className="btn btn-outline-secondary"
              >
                ← Back
              </button>
            </div>

            {/* Student Info Card */}
            <div className="mb-4 p-4 bg-light rounded">
              <div className="d-flex align-items-center gap-3">
                <Image
                  src={studentImage || Profile}
                  alt={studentName || "Student"}
                  width={60}
                  height={60}
                  className="rounded-circle"
                />
                <div>
                  <h4 className="mb-1 fw-bold">{studentName || "Student"}</h4>
                  <p className="mb-0 text-muted">{studentEmail || ""}</p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="alert alert-success" role="alert">
                ✓ Credits updated successfully! Redirecting...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Credits Assignment Form */}
            <Form onSubmit={handleSubmit}>
              <h5 className="mb-4 fw-bold">Credits Per Course</h5>

              {courses.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  No courses assigned to this student yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course._id} className="mb-4 p-4 border rounded">
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <h6 className="fw-bold mb-2">
                            {course.title || "Unnamed Course"}
                          </h6>
                          <p className="text-muted mb-0 small">
                            {course.description || "No description available"}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <Form.Group>
                            <Form.Label className="fw-bold small">
                              Credits Per Class
                            </Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              value={creditsData[course._id] || ""}
                              onChange={(e) =>
                                handleCreditChange(course._id, e.target.value)
                              }
                              placeholder="Enter credits"
                              className="form-control-lg"
                            />
                            <Form.Text className="text-muted">
                              Number of credits to deduct per class
                            </Form.Text>
                          </Form.Group>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              {courses.length > 0 && (
                <div className="mt-4 d-flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/academy/students")}
                    className="btn btn-outline-secondary flex-fill"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn bg-purple-700 text-white flex-fill"
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      "Save Credits"
                    )}
                  </button>
                </div>
              )}
            </Form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-purple-700 {
          background-color: #7c3aed;
          border-color: #7c3aed;
        }
        .bg-purple-700:hover {
          background-color: #6d28d9;
          border-color: #6d28d9;
        }
        .text-purple {
          color: #7c3aed;
        }
      `}</style>
    </div>
  );
};

export default AssignCreditsPage;