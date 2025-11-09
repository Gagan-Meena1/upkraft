"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Form } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import Profile from "../../../assets/Mask-profile.png";

// Loading component
const LoadingFallback = () => (
  <div className="card-box">
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 mb-0">Loading...</p>
    </div>
  </div>
);

// Main component content
const AssignStudentsContent = () => {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch students
  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/Api/academy/students?page=${page}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setStudents(data.students);
        setPagination(data.pagination);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error loading students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!courseId) {
      toast.error("No course ID provided");
      return;
    }
    fetchStudents();
  }, [courseId]);

  // Handle individual checkbox
  const handleCheckboxChange = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = students.map((student) => student._id);
      setSelectedStudents(allIds);
    } else {
      setSelectedStudents([]);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    fetchStudents(page);
    setSelectedStudents([]); // Clear selections on page change
  };

  // Handle submit
  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Assigning students...", { id: "assign-students" });

      const response = await fetch(
        `/Api/academy/assignStudentsToCourse?courseId=${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentIds: selectedStudents,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Students assigned successfully!", {
          id: "assign-students",
        });
        setSelectedStudents([]);
        // Optionally redirect or refresh
        // router.push('/academy/courses');
      } else {
        throw new Error(data.error || "Failed to assign students");
      }
    } catch (error) {
      console.error("Error assigning students:", error);
      toast.error(error.message || "Failed to assign students", {
        id: "assign-students",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const { currentPage, totalPages } = pagination;

    // Always show first page
    items.push(
      <Pagination.Item
        key={1}
        active={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        {1}
      </Pagination.Item>
    );

    // Show ellipsis if current page is far from start
    if (currentPage > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(
        <Pagination.Item
          key={i}
          active={currentPage === i}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  if (!courseId) {
    return (
      <div className="card-box">
        <div className="text-center py-5">
          <h3>No course selected</h3>
          <p>Please select a course to assign students.</p>
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
            <h2>Assign Students to Course</h2>
            <p className="mb-0 text-muted">
              Select students to assign to this course
            </p>
          </div>
          <div className="right-form">
            <Button
              onClick={handleSubmit}
              disabled={submitting || selectedStudents.length === 0}
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
                    Assign Selected ({selectedStudents.length})
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
                          students.length > 0 &&
                          selectedStudents.length === students.length
                        }
                        disabled={loading || students.length === 0}
                      />
                    </th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Tutor</th>
                    <th>Current Course</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 mb-0">Loading students...</p>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        <p className="mb-0">No students found</p>
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student._id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => handleCheckboxChange(student._id)}
                          />
                        </td>
                        <td>
                          <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="img-box">
                              <Image
                                src={student.profileImage || Profile}
                                alt={student.username}
                                width={40}
                                height={40}
                              />
                            </div>
                            <div className="text-box">
                              <h6 className="mb-0">{student.username}</h6>
                            </div>
                          </div>
                        </td>
                        <td>{student.email}</td>
                        <td>{student.tutor}</td>
                        <td>{student.course}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination-sec d-flex align-items-center justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  onClick={() =>
                    pagination.hasPrevPage &&
                    handlePageChange(pagination.currentPage - 1)
                  }
                  disabled={!pagination.hasPrevPage}
                />
                {renderPaginationItems()}
                <Pagination.Next
                  onClick={() =>
                    pagination.hasNextPage &&
                    handlePageChange(pagination.currentPage + 1)
                  }
                  disabled={!pagination.hasNextPage}
                />
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export wrapped component
const AssignStudentsToCourse = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AssignStudentsContent />
    </Suspense>
  );
};

export default AssignStudentsToCourse;