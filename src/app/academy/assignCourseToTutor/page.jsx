"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Form } from "react-bootstrap";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import Profile from "../../../assets/Mask-profile.png";

const AssignTutorsToCourse = () => {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutors, setSelectedTutors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch tutors
  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/Api/academy/tutors`);
      const data = await response.json();

      if (data.success) {
        setTutors(data.tutors);
      } else {
        toast.error("Failed to fetch tutors");
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      toast.error("Error loading tutors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!courseId) {
      toast.error("No course ID provided");
      return;
    }
    fetchTutors();
  }, [courseId]);

  // Handle individual checkbox
  const handleCheckboxChange = (tutorId) => {
    setSelectedTutors((prev) => {
      if (prev.includes(tutorId)) {
        return prev.filter((id) => id !== tutorId);
      } else {
        return [...prev, tutorId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = tutors.map((tutor) => tutor._id);
      setSelectedTutors(allIds);
    } else {
      setSelectedTutors([]);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (selectedTutors.length === 0) {
      toast.error("Please select at least one tutor");
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Assigning tutors...", { id: "assign-tutors" });

      const response = await fetch(
        `/Api/academy/assignTutorsToCourse?courseId=${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tutorIds: selectedTutors,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Tutors assigned successfully!", {
          id: "assign-tutors",
        });
        setSelectedTutors([]);
        // Optionally redirect or refresh
        // router.push('/academy/courses');
      } else {
        throw new Error(data.error || "Failed to assign tutors");
      }
    } catch (error) {
      console.error("Error assigning tutors:", error);
      toast.error(error.message || "Failed to assign tutors", {
        id: "assign-tutors",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!courseId) {
    return (
      <div className="card-box">
        <div className="text-center py-5">
          <h3>No course selected</h3>
          <p>Please select a course to assign tutors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-box">
      <Toaster />
      <div className="assignments-list-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
            <h2>Assign Tutors to Course</h2>
            <p className="mb-0 text-muted">
              Select tutors to assign to this course
            </p>
          </div>
          <div className="right-form">
            <Button
              onClick={handleSubmit}
              disabled={submitting || selectedTutors.length === 0}
              className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <span>
                    Assign Selected ({selectedTutors.length})
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.9997 8.66536H8.66634V11.9987C8.66634 12.1755 8.5961 12.3451 8.47108 12.4701C8.34605 12.5951 8.17649 12.6654 7.99967 12.6654C7.82286 12.6654 7.65329 12.5951 7.52827 12.4701C7.40325 12.3451 7.33301 12.1755 7.33301 11.9987V8.66536H3.99967C3.82286 8.66536 3.65329 8.59513 3.52827 8.4701C3.40325 8.34508 3.33301 8.17551 3.33301 7.9987C3.33301 7.82189 3.40325 7.65232 3.52827 7.52729C3.65329 7.40227 3.82286 7.33203 3.99967 7.33203H7.33301V3.9987C7.33301 3.82189 7.40325 3.65232 7.52827 3.52729C7.65329 3.40227 7.82286 3.33203 7.99967 3.33203C8.17649 3.33203 8.34605 3.40227 8.47108 3.52729C8.5961 3.65232 8.66634 3.82189 8.66634 3.9987V7.33203H11.9997C12.1765 7.33203 12.3461 7.40227 12.4711 7.52729C12.5961 7.65232 12.6663 7.82189 12.6663 7.9987C12.6663 8.17551 12.5961 8.34508 12.4711 8.4701C12.3461 8.59513 12.1765 8.66536 11.9997 8.66536Z"
                      fill="white"
                    />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>

        <hr className="hr-light" />

        <div className="assignments-list-com">
          <div className="table-sec">
            <div className="table-responsive">
              <table className="table align-middle m-0">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>
                      <Form.Check
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          tutors.length > 0 &&
                          selectedTutors.length === tutors.length
                        }
                        disabled={loading || tutors.length === 0}
                      />
                    </th>
                    <th>Tutor Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 mb-0">Loading tutors...</p>
                      </td>
                    </tr>
                  ) : tutors.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-5">
                        <p className="mb-0">No tutors found</p>
                      </td>
                    </tr>
                  ) : (
                    tutors.map((tutor) => (
                      <tr key={tutor._id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedTutors.includes(tutor._id)}
                            onChange={() => handleCheckboxChange(tutor._id)}
                          />
                        </td>
                        <td>
                          <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="img-box">
                              <Image
                                src={tutor.profileImage || Profile}
                                alt={tutor.username}
                                width={40}
                                height={40}
                              />
                            </div>
                            <div className="text-box">
                              <h6 className="mb-0">{tutor.username}</h6>
                            </div>
                          </div>
                        </td>
                        <td>{tutor.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTutorsToCourse;